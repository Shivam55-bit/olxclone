// src/apis/adsService.js
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for AsyncStorage keys (should match api.js)
const TOKEN_KEY = "token";
const TOKEN_TYPE_KEY = "token_type";

// Helper function to safely retrieve auth details
const getAuthDetails = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const tokenType = (await AsyncStorage.getItem(TOKEN_TYPE_KEY)) || "Bearer";
    return { token, tokenType };
};

// ------------------------------------------------
// CRUD Operations for Ads
// ------------------------------------------------

// Create new ad (Sends JSON/Base64 payload)
export const createAd = async (adData) => {
    try {
        const { token } = await getAuthDetails();

        if (!token) {
            // This is generally caught by the request interceptor, but good for explicit check
            throw new Error("User not logged in. Please authenticate.");
        }

        // NOTE: adData is expected to be a complete JSON object
        const res = await api.post("/ads/", adData);

        return res.data;
    } catch (error) {
        // Error message is already formatted by api.js interceptor
        throw error; 
    }
};

// Get all ads (Uses optional filtering handled by the backend)
export const getAds = async (filterParams = {}) => {
    try {
        const res = await api.get("/ads/", {
            params: filterParams,
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get a single ad by ID
export const getAdById = async (id) => {
    try {
        const res = await api.get(`/ads/${id}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

// ... (Other functions like getSimilarAds, updateAd, deleteAd, toggleLikeAd remain the same) ...