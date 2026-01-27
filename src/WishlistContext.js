import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
// 🔑 Import the token retrieval functions from the auth utility file
import { getAccessToken, getTokenType } from './apis/authApi';
// ✅ FIXED: Import correct BASE_URL
import { BASE_URL } from './apis/api';

const WishlistContext = createContext();

// 🔑 API Configuration - Using correct base URL
const API_BASE_URL = `${BASE_URL}/api/`;
// Removed the hardcoded AUTH_TOKEN

// 🔑 Helper: Get item ID safely
const getItemId = (item) => item._id || item.id || item.product_id;

// 🔑 Helper: Auth headers - Now ASYNC to retrieve the current token
const getAuthHeaders = async () => {
  const token = await getAccessToken();
  const tokenType = (await getTokenType()) || "Bearer";

  if (!token) {
    // Return standard headers if no token is present (e.g., if user logged out)
    return {
      accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  return {
    accept: 'application/json',
    Authorization: `${tokenType} ${token}`, // Use the dynamically retrieved token
    'Content-Type': 'application/json',
  };
};

// 🔑 Helper: Handle API response
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    // Use the errorText in the throw message to capture more details
    throw new Error(`API call failed with status ${response.status}: ${errorText}`);
  }
  try {
    return await response.json();
  } catch {
    // Gracefully handle success responses with no content (e.g., 204 No Content for DELETE)
    return {};
  }
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // --- 1. FETCH INITIAL WISHLIST (GET) ---
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated first
      const token = await getAccessToken();
      if (!token) {
        console.log('[API] No token found. Skipping wishlist fetch.');
        setWishlist([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}favourites/`, {
        method: 'GET',
        headers: await getAuthHeaders(), // ⬅️ AWAIT the dynamic headers
      });

      const responseData = await handleApiResponse(response);
      
      // Extract items from API response { success, message, data: { favourites: [...], total_count } }
      let items = [];
      
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData?.data?.favourites && Array.isArray(responseData.data.favourites)) {
        // API returns { data: { favourites: [...], total_count } }
        // Each item has structure: { id, added_at, product: {...} }
        // Normalize to use product data
        items = responseData.data.favourites.map(fav => {
          const product = fav.product || fav;
          return {
            _id: product.id || fav.id,
            id: product.id || fav.id,
            title: product.title,
            description: product.description,
            price: product.price,
            condition: product.condition,
            location: product.location,
            is_available: product.is_available,
            is_negotiable: product.is_negotiable,
            views_count: product.views_count,
            images: product.images || [],
            image: product.images?.[0], // Use first image as main image
            added_at: fav.added_at,
          };
        });
        console.log('[DEBUG] Extracted from responseData.data.favourites');
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        items = responseData.data;
      }
      
      setWishlist(items);
      console.log(`[API] Wishlist fetched successfully. Count: ${items.length}`);
    } catch (error) {
      console.error('Fetch Wishlist API Error:', error.message);
      // Silently handle 403 errors (not authenticated yet) - user will log in later
      if (error.message.includes('403')) {
        console.log('[API] User not authenticated yet. Wishlist will load after login.');
        setWishlist([]);
      } 
      // Only show alert for other errors
      else if (!error.message.includes('502') && !error.message.includes('503') && !error.message.includes('Network')) {
        // Don't show alert, just log
        console.warn('[API] Wishlist load failed (will retry on screen focus)');
        setWishlist([]);
      } else {
        setWishlist([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2. CHECK IF ITEM IS IN WISHLIST ---
  const isInWishlist = useCallback(
    (item) => {
      const itemId = getItemId(item);
      const list = Array.isArray(wishlist) ? wishlist : [];
      return list.some((w) => getItemId(w) === itemId);
    },
    [wishlist]
  );

  // --- 3. TOGGLE ADD/REMOVE (POST/DELETE API) ---
  const toggleWishlist = useCallback(
    async (item) => {
      const itemId = getItemId(item);
      if (!itemId) {
        Alert.alert('Error', 'Cannot toggle wishlist: Item ID is missing.');
        return;
      }

      const exists = isInWishlist(item);
      const method = exists ? 'DELETE' : 'POST';
      const url = `${API_BASE_URL}favourites/${itemId}`;
      const originalWishlist = wishlist;

      // Optimistic UI update
      if (exists) {
        setWishlist((prev) => prev.filter((w) => getItemId(w) !== itemId));
      } else {
        setWishlist((prev) => [...prev, { ...item, _id: itemId }]);
      }

      try {
        const response = await fetch(url, {
          method,
          headers: await getAuthHeaders(), // ⬅️ AWAIT the dynamic headers
        });

        // ⚡ FIX: Gracefully handle "already in favorites" error
        if (response.status === 400) {
          const errorText = await response.text();
          try {
             const errorData = JSON.parse(errorText);
             if (errorData.detail && errorData.detail.includes('already in favorites')) {
              console.log(`[API] Item ${itemId} already in favorites — skipping error.`);
              return;
            }
          } catch {
            // Not a JSON error, or not the specific one we handle. Proceed to normal error handling.
          }
          // Re-throw if it wasn't the specific error
          throw new Error(`API call failed with status 400: ${errorText}`);
        }

        await handleApiResponse(response);
        console.log(
          `[API] Item ${itemId} ${exists ? 'removed' : 'added'} successfully using ${method} ${url}.`
        );
      } catch (error) {
        console.error(`Toggle API Error (${method}):`, error.message);
        Alert.alert('Error', `Failed to update wishlist. ${error.message}`);
        setWishlist(originalWishlist); // revert on failure
      }
    },
    [isInWishlist, wishlist]
  );

  // --- 4. REMOVE EXPLICITLY (DELETE API) ---
  const removeFromWishlist = useCallback(
    async (itemId) => {
      if (!itemId) return false;

      const originalWishlist = wishlist;
      setWishlist((prev) => prev.filter((w) => getItemId(w) !== itemId));

      try {
        const response = await fetch(`${API_BASE_URL}favourites/${itemId}`, {
          method: 'DELETE',
          headers: await getAuthHeaders(), // ⬅️ AWAIT the dynamic headers
          body: undefined,
        });

        await handleApiResponse(response);
        console.log(`[API] Item ${itemId} removed explicitly.`);
        return true;
      } catch (error) {
        console.error('Explicit Remove API Error:', error.message);
        Alert.alert('Error', `Failed to remove item. ${error.message}`);
        setWishlist(originalWishlist);
        return false;
      }
    },
    [wishlist]
  );

  // --- 5. LIFECYCLE - Auto-fetch wishlist on mount ---
  useEffect(() => {
    if (!hasFetched) {
      console.log('[WISHLIST] Auto-fetching wishlist on app startup...');
      fetchWishlist();
      setHasFetched(true);
    }
  }, []);

  // --- 6. RESET FLAG (for re-fetching after login) ---
  const resetWishlist = useCallback(() => {
    console.log('[WISHLIST] Resetting wishlist (new login detected)');
    setHasFetched(false);
    setWishlist([]);
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
        fetchWishlist,
        resetWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
