// src/apis/adApi.js (UPDATED TO LEVERAGE api.js INTERCEPTOR)

// 🔑 Import the interceptor-enabled Axios instance
// This instance AUTOMATICALLY includes the Authorization: Bearer <TOKEN> header
import api from "./api"; 

/**
 * Helper function to handle the request and retrieve the response data 
 * without managing the Authorization header manually.
 * @param {string} endpoint - The API endpoint (e.g., "/ads/my-ads")
 * @param {object} [options] - Axios request options (for params, headers, etc.)
 * @returns {object} The full response data object (e.g., { success: true, ads: [...] } )
 */
const handleAuthRequest = async (endpoint, options = {}) => {
    try {
        // Use the imported Axios instance 'api' - Interceptor handles the token
        const res = await api.get(endpoint, options);
        
        // Return the full data field from the Axios response
        if (res.data) {
            return res.data;
        }

        // Fallback if structure is not as expected
        return { success: false, ads: [] };

    } catch (error) {
        // The interceptor in api.js already logs detailed errors.
        // We catch it here to return a clean, expected error object to the component.
        const errorMessage = error.message || "Network request failed.";
        
        return { 
            success: false, 
            ads: [], 
            // Use the formatted message from the interceptor
            error: errorMessage 
        };
    }
};

// ----------------------------------------------------------------------
// 🔹 API Calls
// ----------------------------------------------------------------------

/**
 * Fetches the user's advertisement listings.
 * * Endpoint from cURL: /ads/my-ads?page=1&size=20
 * Token is handled automatically by the interceptor in api.js.
 * * @param {number} page - The page number to fetch.
 * @param {number} size - The number of ads per page.
 * @returns {object} The API response data containing the ads array.
 */
export const getMyAds = async (page = 1, size = 20) => {
    const endpoint = `/ads/my-ads`;
    
    const options = {
        params: { 
            page: page, 
            size: size 
        },
        // Optionally set a specific header, though 'accept' is often default
        headers: {
            'accept': 'application/json'
        }
    };
    
    return handleAuthRequest(endpoint, options);
};

/**
 * Get single ad details by ID
 * Endpoint: GET /ads/single/{ad_id}
 */
export const getAdById = async (ad_id) => {
    const endpoint = `/ads/single/${ad_id}`;
    return handleAuthRequest(endpoint);
};

/**
 * Get all ads with pagination
 * Endpoint: GET /ads/
 */
export const getAllAds = async (page = 1, size = 20) => {
    const endpoint = `/ads/`;
    const options = {
        params: {
            page: page,
            size: size,
        },
    };
    return handleAuthRequest(endpoint, options);
};

/**
 * Create new ad
 * Endpoint: POST /ads/
 */
export const createAd = async (adData) => {
    try {
        const res = await api.post('/ads/', adData);
        return res.data;
    } catch (error) {
        const errorMessage = error.message || "Failed to create ad";
        return { 
            success: false, 
            error: errorMessage 
        };
    }
};

/**
 * Update existing ad
 * Endpoint: PUT /ads/{ad_id}
 */
export const updateAd = async (ad_id, adData) => {
    try {
        const res = await api.put(`/ads/${ad_id}`, adData);
        return res.data;
    } catch (error) {
        const errorMessage = error.message || "Failed to update ad";
        return { 
            success: false, 
            error: errorMessage 
        };
    }
};

/**
 * Delete ad
 * Endpoint: DELETE /ads/{ad_id}
 */
export const deleteAd = async (ad_id) => {
    try {
        const res = await api.delete(`/ads/${ad_id}`);
        return res.data;
    } catch (error) {
        const errorMessage = error.message || "Failed to delete ad";
        return { 
            success: false, 
            error: errorMessage 
        };
    }
};

/**
 * Get similar ads
 * Endpoint: GET /ads/{ad_id}/similar
 */
export const getSimilarAds = async (ad_id) => {
    const endpoint = `/ads/${ad_id}/similar`;
    return handleAuthRequest(endpoint);
};

/**
 * Increment ad view count
 * Endpoint: POST /ads/{ad_id}/view
 */
export const incrementAdView = async (ad_id) => {
    try {
        const res = await api.post(`/ads/${ad_id}/view`);
        return res.data;
    } catch (error) {
        const errorMessage = error.message || "Failed to increment view";
        return { 
            success: false, 
            error: errorMessage 
        };
    }
};

/**
 * Toggle ad like
 * Endpoint: POST /ads/{ad_id}/like
 */
export const toggleAdLike = async (ad_id) => {
    try {
        const res = await api.post(`/ads/${ad_id}/like`);
        return res.data;
    } catch (error) {
        const errorMessage = error.message || "Failed to toggle like";
        return { 
            success: false, 
            error: errorMessage 
        };
    }
};

/**
 * Get ads by user
 * Endpoint: GET /ads/by-user/{user_id}
 */
export const getAdsByUser = async (user_id, page = 1, size = 20) => {
    const endpoint = `/ads/by-user/${user_id}`;
    const options = {
        params: {
            page: page,
            size: size,
        },
    };
    return handleAuthRequest(endpoint, options);
};

// You can add other ad-related endpoints here (e.g., postAd, deleteAd, etc.)