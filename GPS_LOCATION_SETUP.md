# 📍 GPS Location Setup - Complete Implementation Guide

## ✅ All Steps Completed

### 1️⃣ Required Library ✅ DONE
- **Library**: `react-native-geolocation-service` (Already installed)
- **Status**: ✅ Ready to use

### 2️⃣ Permissions Setup ✅ DONE

#### Android (AndroidManifest.xml) ✅
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```
**Location**: `android/app/src/main/AndroidManifest.xml`

#### iOS (Info.plist) ✅
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby items and personalize your experience</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to show nearby items and personalize your experience</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to show nearby items and personalize your experience</string>
```
**Location**: `ios/olxclone/Info.plist`

### 3️⃣ Location Service Utility ✅ DONE
**File**: `src/utils/locationService.js`

**Functions Available**:
```javascript
// Request location permission (both Android & iOS)
requestLocationPermission() → Promise<boolean>

// Get current location once
getCurrentLocation() → Promise<{latitude, longitude}>

// Start continuous location tracking
startLocationTracking(onLocationChange, onError) → watchId

// Stop location tracking
stopLocationTracking(watchId) → boolean
```

### 4️⃣ Home Screen Integration ✅ DONE

#### Updated Files:
1. **[src/tabs/Home.js](src/tabs/Home.js)**
   - Added location permission request on app launch
   - Integrated GPS location fetching
   - "Use Current Location" button now gets real GPS coordinates
   - Auto-updates nearby items based on user location

#### Implementation Details:
```javascript
// 📍 Request permission & get location on mount
useEffect(() => {
    const initializeLocation = async () => {
        const permissionGranted = await requestLocationPermission();
        if (permissionGranted) {
            const currentCoords = await getCurrentLocation();
            setUserLocation(currentCoords);
        }
    };
    initializeLocation();
}, []);
```

### 5️⃣ Usage Examples

#### Example 1: Single Location Request
```javascript
import { requestLocationPermission, getCurrentLocation } from '../utils/locationService';

const handleGetLocation = async () => {
    const permitted = await requestLocationPermission();
    if (permitted) {
        try {
            const location = await getCurrentLocation();
            console.log('Latitude:', location.latitude);
            console.log('Longitude:', location.longitude);
        } catch (error) {
            console.error('Location error:', error);
        }
    }
};
```

#### Example 2: Live Location Tracking
```javascript
import { startLocationTracking, stopLocationTracking } from '../utils/locationService';

let watchId = null;

const startTracking = () => {
    watchId = startLocationTracking(
        (coords) => {
            console.log('📍 Location:', coords);
            // Update state or send to server
        },
        (error) => {
            console.error('❌ Tracking error:', error);
        }
    );
};

const stopTracking = () => {
    stopLocationTracking(watchId);
};
```

#### Example 3: Use in Any Screen
```javascript
import { getCurrentLocation, requestLocationPermission } from '../utils/locationService';

export default function MyScreen() {
    useEffect(() => {
        const initLocation = async () => {
            const allowed = await requestLocationPermission();
            if (allowed) {
                const coords = await getCurrentLocation();
                // Use coords
            }
        };
        initLocation();
    }, []);
}
```

## 🔧 Configuration Details

### Location Request Options (src/utils/locationService.js)

**getCurrentLocation**:
- `enableHighAccuracy`: true
- `timeout`: 15000ms
- `maximumAge`: 10000ms

**Continuous Tracking** (watchPosition):
- `enableHighAccuracy`: true
- `distanceFilter`: 5 meters (update on 5m movement)
- `interval`: 5000ms (check every 5 seconds)
- `fastestInterval`: 3000ms (fastest update rate)

### Customization

To change these settings, edit `src/utils/locationService.js`:

```javascript
// For faster updates (more frequent, more battery)
distanceFilter: 0,    // Update on any movement
interval: 1000,       // Check every 1 second

// For slower updates (less frequent, less battery)
distanceFilter: 100,  // Update on 100m movement
interval: 30000,      // Check every 30 seconds
```

## 🧪 Testing

### Test on Real Device/Emulator
1. **Android Emulator**: Open Google Play Services > Location settings
2. **iOS Simulator**: Features > Location > Custom Location
3. **Real Device**: App will request permission automatically

### Check Console Logs
```
✅ Location obtained: {latitude: 26.1234, longitude: 72.5678}
🟢 Starting GPS tracking...
📍 Location updated: {latitude: 26.1234, longitude: 72.5678}
🛑 Stopping GPS tracking...
```

## 🐛 Troubleshooting

### Permission Denied
- **Android**: Check Android Settings > Apps > Permissions > Location
- **iOS**: Check Settings > App Name > Location
- **Code**: `requestLocationPermission()` returns `false`

### "Can't get location"
- Ensure GPS is enabled on device
- Check internet connection (some devices need network fallback)
- Timeout might be too short, increase to 30000ms

### High Battery Drain
- Reduce `interval` from 5000ms to higher value
- Increase `distanceFilter` from 5 to 50+ meters
- Stop tracking when screen is not visible

## 📱 Production Recommendations

1. **Ask for Location Only When Needed**
   - Don't request permission on app launch
   - Ask when user clicks "Nearby Items"

2. **Stop Tracking When Not Needed**
   - Stop when leaving location-dependent screens
   - Stop when app goes to background

3. **Use Native Module for Better Performance**
   - Consider `react-native-background-geolocation` for background tracking
   - Use `@react-native-location/location` as alternative

4. **Privacy Notices**
   - Display clear messaging why location is needed
   - Include in Privacy Policy

## 🚀 Next Steps

1. **Implement in More Screens**:
   - Add to PropertyDetails.js for property location
   - Add to SellBikes/SellCar forms for listing location
   - Add to user profile for location display

2. **Server Integration**:
   - Send GPS location to backend when listing items
   - Use for "Nearby Items" feature
   - Calculate distance from user to listings

3. **Advanced Features**:
   - Geofencing (notify when entering area)
   - Map integration (display location on map)
   - Background location tracking

---

**Last Updated**: January 27, 2026  
**Status**: ✅ All 5 Steps Complete & Tested
