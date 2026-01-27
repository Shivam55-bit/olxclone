// src/utils/locationService.js
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

/**
 * 📍 Request location permission (Runtime)
 * Works on both Android and iOS
 */
export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to show nearby items',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
      // iOS handles permissions automatically via Info.plist
      // When user clicks allow/deny, permission is granted/denied
      return true;
    }
  } catch (err) {
    console.warn('❌ Location permission error:', err);
    return false;
  }
};

/**
 * 📍 Get Current Location (One Time)
 * Returns { latitude, longitude } or null
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location obtained:', position.coords);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('❌ Location error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

/**
 * 📍 Start GPS Tracking (Live Location - 🔴 Continuous)
 * Returns watchId to stop tracking later
 */
export const startLocationTracking = (onLocationChange, onError) => {
  console.log('🟢 Starting GPS tracking...');
  const watchId = Geolocation.watchPosition(
    (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      console.log('📍 Location updated:', coords);
      onLocationChange(coords);
    },
    (error) => {
      console.error('❌ Tracking error:', error);
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 5, // Update when user moves 5 meters
      interval: 5000, // Check every 5 seconds
      fastestInterval: 3000, // Fastest update interval
      useSignificantChanges: false, // Don't use significant changes only
    }
  );
  return watchId;
};

/**
 * 🛑 Stop GPS Tracking
 */
export const stopLocationTracking = (watchId) => {
  if (watchId !== null) {
    console.log('🛑 Stopping GPS tracking...');
    Geolocation.clearWatch(watchId);
    return true;
  }
  return false;
};

export default {
  requestLocationPermission,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
};
