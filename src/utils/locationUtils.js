// src/utils/locationUtils.js

/**
 * ⚠️ IMPORTANT: In a production app, you MUST replace this with a real 
 * Geocoding API call (e.g., using Expo-Location.reverseGeocodeAsync, 
 * or fetching from Google Maps API).
 * * For demonstration, this is a placeholder function.
 */
export const getAddressFromCoords = async (latitude, longitude) => {
    // These are the default coordinates you set (26.2967719, 73.0351433 is Jodhpur)
    if (latitude === 26.2967719 && longitude === 73.0351433) {
        return "Jodhpur"; 
    }
    
    // Fallback for any other coordinates
    return "Nearby Area"; 
};