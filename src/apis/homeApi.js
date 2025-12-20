// src/apis/homeApi.js (FULL FIXED CODE)

// 🔑 FIXED IMPORT: We are now importing the DEFAULT exported Axios instance
import api from "./api"; 

// 🔑 FIXED DEFAULT LOCATION
const DEFAULT_LATITUDE = 26.2967719;
const DEFAULT_LONGITUDE = 73.0351433;

/**
 * Helper function to handle the request and retrieve the response data.
 * @param {string} endpoint - The API endpoint (e.g., "/api/following" or "/ads/by-parent/Mobiles")
 * @param {object} [options] - Axios request options (for params, headers, etc.)
 * @returns {object} The full response data object (e.g., { success: true, data: { ads: [...] } })
 */
const handleRequest = async (endpoint, options = {}) => {
    try {
        // Use the imported Axios instance 'api'
        const res = await api.get(endpoint, options);
        
        // Return the data field from the Axios response
        if (res.data) {
            return res.data;
        }

        // Fallback if structure is not as expected
        return { success: false, data: {} };

    } catch (error) {
        // Log detailed error information
        console.error(`❌ API error for ${endpoint}:`, error.response?.data || error.message);
        // Return a structured error response
        return { success: false, data: {}, error: error.response?.data || error.message };
    }
};

// ----------------------------------------------------------------------
// 🔹 API Calls using the Robust Handler
// ----------------------------------------------------------------------

/**
 * 🔹 GET Items by Category
 * Maps directly to your API structure: /ads/by-parent/{category}
 */
export const getItemsByCategory = async (category, page = 1, size = 20) => {
    const endpoint = `/ads/by-parent/${category}`;
    
    const options = {
        params: {
            page: page,
            size: size,
        }
    };
    
    return handleRequest(endpoint, options);
};


/**
 * 🔹 GET Top Picks
 * 🚀 CRITICAL FIX: Matching the endpoint from the working curl command: 
 * /api/top_picks?limit=20
 */
export const getTopPicks = async () => {
    const options = {
        params: {
            limit: 20 // Passing limit as a parameter as seen in the curl
        }
    };
    // Correct endpoint based on curl command
    return handleRequest("/api/top_picks", options); 
};

/**
 * 🔹 GET Nearby Items
 */
export const getNearbyItems = async (latitude = DEFAULT_LATITUDE, longitude = DEFAULT_LONGITUDE) => {
    const options = {
        params: {
            latitude: latitude,
            longitude: longitude,
        }
    };
    // Assuming /api/nearby is correct, but could be /api/nearby_ads if issues persist
    return handleRequest("/api/nearby", options); 
};


/**
 * 🔹 GET Following Items
 */
export const getFollowingItems = async () => {
    const options = {
        params: {
            limit: 20
        }
    };
    return handleRequest("/api/following", options); 
};