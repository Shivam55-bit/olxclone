// src/apis/profile.js (CORRECTED CODE)
import api from "./api";

// Assuming the update endpoint is correctly /api/profile/update or similar
const PROFILE_UPDATE_ENDPOINT = "/api/user/profile"; 
const PROFILE_GET_ENDPOINT = "/api/user/profile"; 

// Get user profile
export const getProfile = async () => {
    try {
        // Use the full endpoint path
        const res = await api.get(PROFILE_GET_ENDPOINT); 
        console.log("✅ Profile API response:", res.data);
        // Handle both array and object responses
        const profile = Array.isArray(res.data) ? res.data[0] : res.data;
        return profile;
    } catch (err) {
        console.error("❌ Profile API error:", err.response?.data || err.message);
        throw err;
    }
};


/**
 * Update user profile
 * 🔑 CRITICAL FIX: Conditionally includes 'avatar' field in the payload.
 * * @param {object} data - Contains profile fields (name, email, phone) and potentially newAvatarBase64.
 */
export const updateProfile = async (data) => {
    // Assume EditProfileScreen.js passes a property like 'newAvatarBase64' 
    // when an image has been selected and converted.
    const newAvatarBase64 = data.newAvatarBase64; 

    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        // ... include other profile fields like password, etc.
        
        // 🔑 FIX: Only include 'avatar' field if new Base64 data exists.
        // This prevents the "Internal Server Error" due to missing/invalid avatar value.
        ...(newAvatarBase64 && { avatar: newAvatarBase64 }), 
    };

    try {
        // Changed to PATCH, as PUT usually requires sending ALL fields. Use PATCH 
        // for partial updates. Change back to PUT if necessary.
        const res = await api.patch(PROFILE_UPDATE_ENDPOINT, payload);
        return res.data;
    } catch (err) {
        console.error("❌ saveProfile error:", err.response?.data || err.message);
        throw err; // Propagate error for the UI to display
    }
};