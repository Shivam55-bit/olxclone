// src/apis/favoritesApi.js - Updated with exact API endpoints from curl commands

import { BASE_URL } from './api';
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔑 API Configuration
const API_BASE_URL = `${BASE_URL}/api/`; 
const IMAGE_BASE_URL = 'https://olx.fixsservices.com';

// 🔑 Helper function to get headers for authenticated requests
const getAuthHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem('access_token');
        return {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }
};

// 🔑 Helper function to handle API response
const handleApiResponse = async (response) => {
    if (!response.ok) {
        let errorText;
        try {
            const errorData = await response.json();
            errorText = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch {
            errorText = await response.text();
        }
        
        if (response.status === 401) {
            throw new Error('Authentication required. Please log in to access favorites.');
        } else if (response.status === 502) {
            throw new Error('Server is temporarily unavailable. Please try again later.');
        } else if (response.status === 404) {
            throw new Error('Favorites endpoint not found.');
        }
        
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }
    
    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType?.includes('application/json')) {
        return { success: true };
    }
    
    return response.json();
};

// ================= GET FAVOURITES ==================
// curl -X 'GET' 'https://olx.fixsservices.com/api/favourites/' -H 'accept: application/json' -H 'Authorization: Bearer {token}'
export const getFavorites = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}favourites/`, {
            method: 'GET',
            headers: headers,
        });

        const responseData = await handleApiResponse(response);
        
        // Extract items from API response { data: { favourites: [...], total_count } }
        let items = [];
        
        if (Array.isArray(responseData)) {
            items = responseData;
        } else if (responseData?.data?.favourites && Array.isArray(responseData.data.favourites)) {
            // Normalize the data: { id, added_at, product: {...} } -> product data
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
                    image: product.images?.[0],
                    added_at: fav.added_at,
                };
            });
        } else if (responseData?.data && Array.isArray(responseData.data)) {
            items = responseData.data;
        }
        
        // Map data to include correct image URLs
        return items.map(item => {
            if (item?.image && !item.image.startsWith('http')) {
                return { ...item, image: `${IMAGE_BASE_URL}${item.image}` };
            }
            return item;
        });
        
    } catch (error) {
        console.error('Fetch Favorites API Error:', error.message);
        if (error.message.includes('404')) {
            console.warn('Favorites API endpoint not found. Returning empty favorites.');
            return [];
        }
        throw error;
    }
};

// ================= ADD TO FAVOURITES ==================
// curl -X 'POST' 'https://olx.fixsservices.com/api/favourites/{product_id}' -H 'accept: application/json' -H 'Authorization: Bearer {token}' -d ''
export const addToFavorites = async (productId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}favourites/${productId}`, {
            method: 'POST',
            headers: headers,
        });

        return await handleApiResponse(response);
        
    } catch (error) {
        console.error(`Add to Favorites API Error for product ${productId}:`, error.message);
        throw error;
    }
};

// ================= REMOVE FROM FAVOURITES ==================
// curl -X 'DELETE' 'https://olx.fixsservices.com/api/favourites/{product_id}' -H 'accept: application/json' -H 'Authorization: Bearer {token}'
export const removeFromFavorites = async (productId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}favourites/${productId}`, {
            method: 'DELETE',
            headers: headers,
        });

        return await handleApiResponse(response);
        
    } catch (error) {
        console.error(`Remove from Favorites API Error for product ${productId}:`, error.message);
        throw error;
    }
};

// ================= CLEAR ALL FAVOURITES ==================
// curl -X 'DELETE' 'https://olx.fixsservices.com/api/favourites/clear' -H 'accept: application/json' -H 'Authorization: Bearer {token}'
export const clearAllFavorites = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}favourites/clear`, {
            method: 'DELETE',
            headers: headers,
        });

        return await handleApiResponse(response);
        
    } catch (error) {
        console.error('Clear All Favorites API Error:', error.message);
        throw error;
    }
};

// ================= LEGACY COMPATIBILITY ==================
// Keep old function names for compatibility with existing code
export const addToWishlistApi = addToFavorites;
export const removeFromWishlistApi = removeFromFavorites;

// Named exports
export default {
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    clearAllFavorites,
    // Legacy compatibility
    addToWishlistApi,
    removeFromWishlistApi
};