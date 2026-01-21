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

  // --- 1. FETCH INITIAL WISHLIST (GET) ---
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}favourites/`, {
        method: 'GET',
        headers: await getAuthHeaders(), // ⬅️ AWAIT the dynamic headers
      });

      const data = await handleApiResponse(response);
      setWishlist(Array.isArray(data) ? data : []);
      console.log(`[API] Wishlist fetched successfully. Count: ${data.length}`);
    } catch (error) {
      console.error('Fetch Wishlist API Error:', error.message);
      // Only show alert for non-network errors or if there's specific error handling needed
      // For network/server errors (502, 503, etc.), just log it and continue with empty wishlist
      if (!error.message.includes('502') && !error.message.includes('503') && !error.message.includes('Network')) {
        Alert.alert('Error', 'Failed to load wishlist from server.');
      }
      setWishlist([]);
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

  // --- 5. LIFECYCLE ---
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
        fetchWishlist,
        
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
