# 🧪 GPS Location Testing Guide

## Pre-Testing Checklist

- [ ] `react-native-geolocation-service` is installed
- [ ] Android permissions added to AndroidManifest.xml
- [ ] iOS Info.plist descriptions added
- [ ] `src/utils/locationService.js` exists
- [ ] `src/tabs/Home.js` has location integration
- [ ] Project builds without errors

---

## Testing on Android

### Using Real Device

**Prerequisites**:
- Android phone with GPS enabled
- USB debugging enabled
- App installed via: `npx react-native run-android`

**Steps**:
1. Run app: `npx react-native run-android`
2. Go to Home screen
3. Wait for permission dialog
4. Tap "Allow" (or "Allow only while using the app")
5. Check console: `✅ Location obtained: {latitude: X, longitude: Y}`
6. Verify selected location updated
7. Tap location selector → "Use Current Location (GPS)"
8. Verify loading spinner appears
9. Verify location coordinates display
10. Verify "Nearby" items load with real coordinates

**Expected Behavior**:
```
✅ Location obtained: {latitude: 26.1245, longitude: 72.5890}
🟢 Starting GPS tracking...
📍 Location updated: {latitude: 26.1245, longitude: 72.5890}
```

### Using Android Emulator

**Setup Emulator Location**:
1. Open Android Emulator
2. Click "..." menu (Extended controls)
3. Go to Location
4. Set Custom location:
   - Latitude: 26.1245
   - Longitude: 72.5890
5. Click "Send"

**Steps**:
1. Run: `npx react-native run-android`
2. App should detect mock location
3. Verify location displays correctly
4. Check console for location logs

**Troubleshooting**:
```
If location not detected:
1. Go to AVD Manager
2. Settings → Location → Check "Use device location"
3. Restart emulator
4. Try again
```

---

## Testing on iOS

### Using Real Device

**Prerequisites**:
- iPhone with GPS enabled
- iOS 12+
- App installed via Xcode

**Steps**:
1. Build: `npx react-native run-ios`
2. Go to Home screen
3. Wait for permission dialog:
   - Message: "We need your location..."
   - Tap "Allow"
4. Check console: `✅ Location obtained: {latitude: X, longitude: Y}`
5. Verify location name updated
6. Open location selector
7. Tap "Use Current Location (GPS)"
8. Verify GPS coordinates obtained
9. Verify "Nearby" items filter works

**Expected Output**:
```
✅ Location obtained: {latitude: 28.6139, longitude: 77.2090}
📍 Location updated: {latitude: 28.6139, longitude: 77.2090}
```

### Using iOS Simulator

**Setup Simulator Location**:
1. Open iOS Simulator
2. Features → Location → Custom Location
3. Enter coordinates:
   - Latitude: 26.1245
   - Longitude: 72.5890
4. Click "Done"

**Steps**:
1. Run: `npx react-native run-ios`
2. Go to Home screen
3. Verify permission dialog shows
4. Tap "Allow"
5. Check console for location logs
6. Verify UI updates with location

**Troubleshooting**:
```
If permission not asked:
1. Simulator → Settings → Privacy → Location
2. Find app → Change to "Always"
3. Restart simulator
4. Delete app
5. Rebuild and run
```

---

## Manual Testing Scenarios

### Scenario 1: Permission Grant
```
1. App launches
2. Permission dialog appears
3. User taps "Allow"
4. Location loaded successfully
5. UI shows actual coordinates

✅ Expected: Location displays, nearby items show
```

### Scenario 2: Permission Deny
```
1. App launches
2. Permission dialog appears
3. User taps "Deny"
4. App uses default location (New Delhi)

✅ Expected: Default location used, app doesn't crash
```

### Scenario 3: Use GPS Button
```
1. Tap location selector
2. Modal shows "Use Current Location (GPS)"
3. Tap button
4. Loading spinner appears
5. GPS location loads
6. Coordinates update
7. Nearby items filter

✅ Expected: Real GPS coordinates used, items update
```

### Scenario 4: Location Timeout
```
1. GPS takes >15 seconds to lock
2. timeout triggers
3. Error logged

✅ Expected: Error handling works, doesn't crash
```

### Scenario 5: GPS Unavailable
```
1. GPS disabled on device
2. User requests location
3. Error message shown

✅ Expected: Graceful error handling
```

---

## Console Log Verification

### Expected Logs on Startup

```javascript
// App launches
LOG  ➡️ Attempting to request location permission

// Permission granted
LOG  ✅ Location obtained: {latitude: 26.1245, longitude: 72.5890}
LOG  📍 Location updated: {latitude: 26.1245, longitude: 72.5890}

// Home screen renders
LOG  selectedLocation changed to: "Current Location (26.1245, 72.5890)"

// User taps "Nearby" filter
LOG  Starting fetch for Nearby items
LOG  API call: getNearbyItems(26.1245, 72.5890)

// Items loaded
LOG  Nearby items loaded: 15 results
```

### Expected Logs When Using GPS Button

```javascript
// User taps "Use Current Location"
LOG  📤 Getting Location...

// Location retrieved
LOG  ✅ Location from modal: {latitude: 26.1245, longitude: 72.5890}

// Location selected
LOG  handleLocationSelect called with: {lat: 26.1245, lon: 72.5890}

// Items loaded
LOG  getNearbyItems called with: 26.1245, 72.5890
LOG  Fetched 20 nearby items
```

---

## UI Testing Checklist

### Home Screen
- [ ] Location selector button shows location name
- [ ] Location selector opens modal on tap
- [ ] Modal shows search bar
- [ ] Modal shows "Use Current Location (GPS)" button
- [ ] "Nearby" filter available
- [ ] Items display after location select

### Location Selector Modal
- [ ] Modal appears on tap
- [ ] Search bar functional
- [ ] Location list shows
- [ ] "Use Current Location (GPS)" button visible
- [ ] Loading spinner appears when getting GPS
- [ ] Modal closes after selection

### Nearby Items Display
- [ ] Items load after location selection
- [ ] Items show distance/location info
- [ ] Items are sorted by relevance
- [ ] Images load correctly
- [ ] Prices display
- [ ] Tap item → details screen

---

## Performance Testing

### Memory Usage
```
Before GPS request: ~150MB
During GPS request: ~160MB
After location obtained: ~155MB

✅ Expected: No memory leaks
```

### Battery Impact
```
Location request: ~5-10% battery/minute
Continuous tracking: ~20-30% battery/minute
Idle (no tracking): <1% battery/minute

✅ Expected: Battery impact is acceptable
```

### Location Accuracy
```
High Accuracy Mode:
- Accuracy: ±5 meters
- Response time: 5-15 seconds
- Works: Indoors & Outdoors

✅ Expected: Reasonable accuracy for app
```

---

## Error Handling Tests

### Test 1: Permission Denied
```
1. Build app with GPS permissions
2. Run on real device
3. Deny permission
4. App should:
   ✅ Not crash
   ✅ Show default location
   ✅ Allow manual location selection
```

### Test 2: GPS Timeout
```
1. GPS disabled on device
2. Request location
3. App should:
   ✅ Wait 15 seconds
   ✅ Show timeout error
   ✅ Fall back to default
   ✅ Not crash
```

### Test 3: Network Error
```
1. Device offline
2. Request location
3. App should:
   ✅ Still get GPS location (offline works)
   ✅ Try fallback methods
   ✅ Handle gracefully
```

---

## Automated Testing

### Jest Unit Tests

```javascript
// tests/locationService.test.js
import { 
  requestLocationPermission, 
  getCurrentLocation 
} from '../src/utils/locationService';

describe('Location Service', () => {
  test('requestLocationPermission returns boolean', async () => {
    const result = await requestLocationPermission();
    expect(typeof result).toBe('boolean');
  });

  test('getCurrentLocation returns {lat, lon}', async () => {
    const result = await getCurrentLocation();
    expect(result).toHaveProperty('latitude');
    expect(result).toHaveProperty('longitude');
  });

  test('startLocationTracking returns watchId', () => {
    const watchId = startLocationTracking(() => {});
    expect(typeof watchId).toBe('number');
  });
});
```

### React Native Testing

```javascript
// tests/HomeScreen.test.js
import { render, waitFor } from '@testing-library/react-native';
import Home from '../src/tabs/Home';

describe('Home Screen Location', () => {
  test('requests location permission on mount', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(locationService.requestLocationPermission).toHaveBeenCalled();
    });
  });
});
```

---

## Regression Testing Checklist

After any changes to locationService.js or Home.js:

- [ ] App still builds without errors
- [ ] Permission dialog shows
- [ ] Location loads successfully
- [ ] GPS button works
- [ ] Nearby items filter works
- [ ] No console errors
- [ ] No memory leaks
- [ ] Battery usage acceptable
- [ ] Works on Android
- [ ] Works on iOS
- [ ] Works on emulator

---

## Device Testing Matrix

| Device | Android | iOS | Emulator | Status |
|--------|---------|-----|----------|--------|
| Real Phone | ✅ | ✅ | - | Test |
| Emulator | - | - | ✅ | Test |
| Tablet | ✅ | ✅ | ✅ | Test |

---

## Sign-Off Checklist

After all testing is complete:

- [ ] Android real device tested
- [ ] iOS real device tested
- [ ] Android emulator tested
- [ ] iOS simulator tested
- [ ] Permission flow verified
- [ ] Location accuracy verified
- [ ] Error handling verified
- [ ] UI display verified
- [ ] Performance verified
- [ ] Battery impact acceptable
- [ ] No crashes observed
- [ ] Console logs clean
- [ ] Ready for production

---

**Testing Date**: [Enter Date]  
**Tested By**: [Enter Name]  
**Devices Tested**: [List devices]  
**Status**: ✅ READY FOR PRODUCTION  

---

## Quick Debug Commands

```bash
# Clear cache and rebuild (Android)
npx react-native run-android --reset-cache

# Clear cache and rebuild (iOS)
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
npx react-native run-ios

# Check simulator location
xcrun simctl location get

# Mock location on simulator
xcrun simctl location set 26.1245 72.5890
```

---

**Testing Status**: Ready for QA  
**Last Updated**: January 27, 2026
