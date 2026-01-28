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
    const res = await api.post("/follow/follow", { user_to_follow_id: userId });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to follow user.' };
  }
};

// Unfollow a user - POST /follow/unfollow/{user_id}
export const unfollowUser = async (userId) => {
  try {
    const res = await api.post(`/follow/unfollow/${userId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to unfollow user.' };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const res = await api.get("/api/user/profile");
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch user profile.' };
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

/**
 * Check if current user is following a specific user
 * @param {string} userId - The user ID to check
 * @returns {object} { success: boolean, isFollowing: boolean }
 */
export const checkFollowStatus = async (userId) => {
  try {
    const res = await api.get('/follow/following');
    // API response: { success, message, data: { following: [...] } }
    const followingList = res.data?.data?.following || [];
    
    // Check if userId is in the following list
    const isFollowing = followingList.some(user => user?.id === userId);
    
    return { success: true, isFollowing };
  } catch (error) {
    console.error('Check follow status error:', error);
    return { success: false, isFollowing: false, error: error.message };
  }
};