// src/apis/userApi.js
import api from "./api";
// ✅ FIX 1: Import the actual exported functions from authApi.js
import { getAccessToken, getTokenType } from "./authApi"; 

// 🔑 Helper: add authentication headers
const authHeaders = async () => {
    // ✅ FIX 2: Call the individual functions to retrieve token and type
    const token = await getAccessToken();
    const tokenType = (await getTokenType()) || "Bearer";

    if (!token) {
        // NOTE: The axios interceptor in './api.js' should handle token expiration/refresh.
        // This check is mainly for a truly logged-out state.
        throw new Error("No token found. Please login again.");
    }
    
    // Authorization header is correctly constructed here
    return { Authorization: `${tokenType} ${token}` };
};

// 🔹 Helper: standardize API response handling
const handleResponse = (res) => {
    // Note: The main 'api' interceptor already handles errors and formatting.
    // This is primarily for extracting data from the successful response.
    if (!res || !res.data) throw new Error("No data received from API.");
    return res.data;
};

// ====================================================================
// 1. PROFILE ENDPOINTS
// ====================================================================

// 🔹 GET logged-in user's profile
export const getProfile = async () => {
    try {
        // The token is automatically added by the axios interceptor in './api.js'
        // But explicitly adding the header here is redundant if the interceptor runs *before* this call.
        // Let's remove the explicit header pass as the API interceptor is designed to do this globally.
        const res = await api.get("/api/user/profile"); 

        const profile = Array.isArray(res.data) ? res.data[0] : res.data;
        return profile;
    } catch (error) {
        console.error("❌ getProfile API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 PUT Update profile
export const updateProfile = async (data) => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.put("/api/user/profile", data); 
        console.log("✅ Profile updated:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ updateProfile API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 PUT Upload avatar (Correct: Base64 key is 'avatar')
export const uploadAvatar = async (base64Image) => {
    try {
        if (!base64Image) throw new Error("No image data provided for upload.");

        const data = {
            avatar: base64Image,
        };
        
        // Headers are automatically added by the API interceptor
        const res = await api.put("/api/user/avatar", data);

        console.log("✅ Avatar upload response:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ uploadAvatar API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 POST Change Password
export const changePassword = async ({ current_password, new_password }) => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.post("/api/user/change-password", {
            current_password,
            new_password,
        });
        console.log("✅ Password changed:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ changePassword API error:", error.response?.data || error.message);
        throw error;
    }
};


// ====================================================================
// 2. SETTINGS & VERIFICATION ENDPOINTS
// ====================================================================

// 🔹 GET User Settings
export const getSettings = async () => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.get("/api/user/settings");
        return handleResponse(res);
    } catch (error) {
        console.error("❌ getSettings API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 PUT Update User Settings
export const updateSettings = async (data) => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.put("/api/user/settings", data);
        console.log("✅ Settings updated:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ updateSettings API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 POST Verify Email
export const verifyEmail = async (data) => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.post("/api/user/verify-email", data);
        console.log("✅ Email verification initiated:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ verifyEmail API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 POST Verify Phone
export const verifyPhone = async (data) => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.post("/api/user/verify-phone", data);
        console.log("✅ Phone verification initiated:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ verifyPhone API error:", error.response?.data || error.message);
        throw error;
    }
};


// ====================================================================
// 3. ACCOUNT MANAGEMENT ENDPOINTS
// ====================================================================

// 🔹 DELETE account
export const deleteAccount = async () => {
    try {
        // Headers are automatically added by the API interceptor
        const res = await api.delete("/api/user/account");
        console.log("🗑️ Account deleted:", res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ deleteAccount API error:", error.response?.data || error.message);
        throw error;
    }
};

// 🔹 GET Public Profile
export const getPublicProfile = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required to fetch public profile.");

        // No headers needed for public profile
        const res = await api.get(`/api/user/${userId}/public`);

        console.log(`👤 Public profile for ${userId}:`, res.data);
        return handleResponse(res);
    } catch (error) {
        console.error("❌ getPublicProfile API error:", error.response?.data || error.message);
        throw error;
    }
};