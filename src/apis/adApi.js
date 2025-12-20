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

// You can add other ad-related endpoints here (e.g., postAd, deleteAd, etc.)