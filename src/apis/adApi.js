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
        // Throw the error instead of returning it so components can handle it properly
        throw error;
    }
};

/**
 * Update existing ad
 * Endpoint: PUT /ads/{ad_id}
 * 
 * Matches curl:
 * curl -X 'PUT' 'https://olx.fixsservices.com/ads/{ad_id}'
 * -H 'Authorization: Bearer <token>'
 * -H 'Content-Type: application/json'
 * -d '{ "price": 9000 }'
 */
export const updateAd = async (ad_id, adData) => {
    try {
        // Determine if data is FormData (for file uploads) or plain JSON
        const isFormData = adData instanceof FormData;
        
        const config = {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
                'Accept': 'application/json',
            }
        };

        const res = await api.put(`/ads/${ad_id}`, adData, config);
        return res.data;
    } catch (error) {
        console.error('❌ updateAd Error:', error.response?.data || error.message);
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

/**
 * Upload ad images
 * Endpoint: POST /uploads/ad-images
 * 
 * @param {Array} images - Array of image objects with { uri, type, fileName }
 * @returns {Object} - { success: true, paths: [...] } or { success: false, error: '...' }
 */
export const uploadAdImages = async (images) => {
    try {
        const formData = new FormData();
        
        images.forEach((image, index) => {
            const fileType = image.type || 'image/jpeg';
            const fileName = image.fileName || `ad_image_${Date.now()}_${index}.jpg`;
            
            formData.append('files', {
                uri: image.uri,
                name: fileName,
                type: fileType,
            });
        });

        console.log('📤 Uploading images...', images.length, 'files');
        
        const res = await api.post('/uploads/ad-images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Log the full response to debug
        console.log('✅ Image upload RAW response:', JSON.stringify(res.data, null, 2));
        
        // Extract paths from response - handle various API response formats
        let extractedPaths = [];
        const data = res.data;
        
        if (Array.isArray(data)) {
            // Response is directly an array
            extractedPaths = data;
        } else if (data.paths && Array.isArray(data.paths)) {
            extractedPaths = data.paths;
        } else if (data.images && Array.isArray(data.images)) {
            extractedPaths = data.images;
        } else if (data.files && Array.isArray(data.files)) {
            extractedPaths = data.files;
        } else if (data.uploaded && Array.isArray(data.uploaded)) {
            extractedPaths = data.uploaded;
        } else if (typeof data === 'object') {
            // Try to get first array property
            const arrayProp = Object.values(data).find(v => Array.isArray(v));
            if (arrayProp) extractedPaths = arrayProp;
        }

        // Convert objects to string paths if needed
        const stringPaths = extractedPaths.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
                // Try common property names for file paths
                return item.path || item.url || item.file_path || item.filepath || 
                       item.filename || item.file || item.image || item.location || null;
            }
            return null;
        }).filter(p => p !== null && typeof p === 'string');

        console.log('✅ Extracted string paths:', stringPaths);
        
        return {
            success: true,
            paths: stringPaths,
            raw: data, // Include raw for debugging
        };
    } catch (error) {
        console.error('❌ Image upload error:', error.response?.data || error.message);
        const errorMessage = error.message || "Failed to upload images";
        return {
            success: false,
            error: errorMessage,
        };
    }
};

// You can add other ad-related endpoints here (e.g., postAd, deleteAd, etc.)