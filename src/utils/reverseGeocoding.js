// src/utils/reverseGeocoding.js
import axios from 'axios';

/**
 * Reverse Geocode: Convert coordinates to city name
 * Using OpenStreetMap Nominatim (Free, No API Key Required)
 */
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          zoom: 10,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'OLXClone-App/1.0',
          'Accept': 'application/json',
        },
        timeout: 8000,
      }
    );

    if (response.data && response.data.address) {
      const address = response.data.address;
      
      // Priority: city > town > village > county > state
      const city = address.city || 
                   address.town || 
                   address.village || 
                   address.county ||
                   address.state ||
                   'Current Location';
      
      console.log(`✅ Reverse Geocoded: ${city} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      return city;
    }
    
    return 'Current Location';
  } catch (error) {
    console.error('❌ Reverse Geocoding Error:', error.message);
    
    // 🔄 Fallback: Use alternative geocoding service (Google Maps Alternative)
    try {
      return await getLocationFromGeoLocationAPI(latitude, longitude);
    } catch (fallbackError) {
      console.error('❌ Fallback Geocoding also failed:', fallbackError.message);
      return 'Current Location';
    }
  }
};

/**
 * Fallback: Use IP-based geolocation service
 * This is less accurate but doesn't require specific coordinates
 */
export const getLocationFromGeoLocationAPI = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://geocode.maps.co/reverse`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          api_key: 'YOUR_API_KEY_HERE', // Optional, works without it too
        },
        headers: {
          'User-Agent': 'OLXClone-App/1.0',
        },
        timeout: 5000,
      }
    );

    if (response.data && response.data.address) {
      const address = response.data.address;
      const city = address.city || 
                   address.town || 
                   address.village ||
                   address.state ||
                   'Current Location';
      console.log(`✅ Fallback Geocoded: ${city}`);
      return city;
    }
    
    return 'Current Location';
  } catch (error) {
    console.error('❌ Fallback Geocoding Error:', error.message);
    return 'Current Location';
  }
};

export default {
  getCityFromCoordinates,
  getLocationFromGeoLocationAPI,
};
