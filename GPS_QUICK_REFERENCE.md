# 📍 GPS Location Quick Reference

## Import Location Service
```javascript
import { 
    requestLocationPermission, 
    getCurrentLocation, 
    startLocationTracking, 
    stopLocationTracking 
} from '../utils/locationService';
```

## Quick Code Snippets

### 1️⃣ Request Permission + Get Location (One Time)
```javascript
const handleGetLocation = async () => {
    try {
        const permitted = await requestLocationPermission();
        if (permitted) {
            const { latitude, longitude } = await getCurrentLocation();
            console.log(`📍 Lat: ${latitude}, Lon: ${longitude}`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};
```

### 2️⃣ Start GPS Tracking (Continuous)
```javascript
const [trackingId, setTrackingId] = useState(null);

const startLiveTracking = () => {
    const watchId = startLocationTracking(
        (coords) => {
            console.log('📍 New location:', coords);
            // Update UI or send to server
        },
        (error) => console.error('❌ Error:', error)
    );
    setTrackingId(watchId);
};

const stopLiveTracking = () => {
    if (trackingId) {
        stopLocationTracking(trackingId);
        setTrackingId(null);
    }
};
```

### 3️⃣ In useEffect (Auto-request on Mount)
```javascript
useEffect(() => {
    const init = async () => {
        const allowed = await requestLocationPermission();
        if (allowed) {
            try {
                const location = await getCurrentLocation();
                setUserLocation(location);
            } catch (err) {
                console.error('Location failed:', err);
            }
        }
    };
    init();
}, []);
```

### 4️⃣ In a Screen Component
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { getCurrentLocation, requestLocationPermission } from '../utils/locationService';

export default function MyScreen() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            const permitted = await requestLocationPermission();
            if (permitted) {
                const coords = await getCurrentLocation();
                setLocation(coords);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <View>
            <Button title="Get My Location" onPress={handleGetLocation} />
            {location && (
                <Text>
                    Latitude: {location.latitude}
                    Longitude: {location.longitude}
                </Text>
            )}
        </View>
    );
}
```

## Return Values

### getCurrentLocation()
```javascript
{
    latitude: 26.1234567,      // number
    longitude: 72.5678901,     // number
}
```

### startLocationTracking callback
```javascript
{
    latitude: 26.1234567,      // number
    longitude: 72.5678901,     // number
    accuracy: 5.5              // meters (optional)
}
```

## Error Handling

```javascript
try {
    const permitted = await requestLocationPermission();
    if (!permitted) {
        console.log('⚠️ User denied permission');
        return;
    }
    
    const location = await getCurrentLocation();
    console.log('✅ Got location:', location);
} catch (error) {
    if (error.code === 'TIMEOUT') {
        console.error('⏱️ Location request timed out');
    } else if (error.code === 'PERMISSION_DENIED') {
        console.error('🚫 Permission denied');
    } else if (error.code === 'UNAVAILABLE') {
        console.error('📍 Location unavailable');
    } else {
        console.error('❌ Unknown error:', error.message);
    }
}
```

## Common Locations to Add

- **Home Screen**: ✅ Already added
- **Sell Screen**: Add before form submission
- **Search Screen**: Add for nearby filtering
- **User Profile**: Add to show user location
- **Map View**: Add to show nearby listings

## Permissions Status

- ✅ Android Manifest: Configured
- ✅ iOS Info.plist: Configured
- ✅ Runtime Permission: Handled

## Files Modified

- `src/utils/locationService.js` - New utility
- `android/app/src/main/AndroidManifest.xml` - Permissions added
- `ios/olxclone/Info.plist` - Descriptions added
- `src/tabs/Home.js` - Integration added

---

**Pro Tip**: Always wrap location calls in try-catch and handle permission denial gracefully!
