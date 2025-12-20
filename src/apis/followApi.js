// src/apis/followApi.js
import api from "./api"; // Assumes this is your interceptor-enabled Axios instance

/**
 * Helper function to handle authenticated GET requests for lists.
 * @param {string} endpoint - The API endpoint (e.g., "/follow/followers")
 * @returns {object} The standardized response object: { success: boolean, data: array|null, error: string|null }
 */
const handleFollowListRequest = async (endpoint) => {
    try {
        const res = await api.get(endpoint);
        
        // Assuming the API returns a simple array of user objects in res.data
        if (res.data) {
            return { success: true, data: res.data };
        }
        
        return { success: true, data: [] };

    } catch (error) {
        // Use structured error from Axios response if available, otherwise fallback
        const errorMessage = error.response?.data?.message || error.message || "Network request failed.";
        
        return {
            success: false,
            data: null,
            error: errorMessage,
            status: error.response?.status
        };
    }
};


// ----------------------------------------------------------------------
// 🔹 List Fetching Functions (New)
// ----------------------------------------------------------------------

/**
 * Fetches the user's followers list.
 * Endpoint from cURL: /follow/followers
 * @returns {object} The API response data containing the user array.
 */
export const fetchFollowers = async () => {
    return handleFollowListRequest('/follow/followers');
};

/**
 * Fetches the user's following list.
 * Endpoint from cURL: /follow/following
 * @returns {object} The API response data containing the user array.
 */
export const fetchFollowing = async () => {
    return handleFollowListRequest('/follow/following');
};


// ----------------------------------------------------------------------
// 🔹 Existing Functions (Kept)
// ----------------------------------------------------------------------

// Follow a user
export const followUser = async (userId) => {
  try {
    const res = await api.post("/follow/follow", { user_id: userId });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to follow user.' };
  }
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  try {
    const res = await api.post(`/follow/unfollow/${userId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to unfollow user.' };
  }
};

// Get follow stats
export const getFollowStats = async () => {
  try {
    const res = await api.get("/follow/stats");
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to get stats.' };
  }
};