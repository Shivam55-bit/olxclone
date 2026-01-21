# API Integration Documentation
## OLX Clone - Complete API Reference

### 🔗 **Base URL**
```
https://olx.fixsservices.com
```

---

## 🔐 **Authentication Endpoints**

### Register User
- **Endpoint**: `POST /auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "phone_number": "string",
  "password": "string"
}
```
- **Response**: `{ access_token, refresh_token, token_type, user }`
- **Function**: `registerUser(userData)`

### Login User
- **Endpoint**: `POST /auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response**: `{ access_token, refresh_token, token_type }`
- **Function**: `loginUser({ email, password })`

### Refresh Token
- **Endpoint**: `POST /auth/token/refresh`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "refresh_token": "string"
}
```
- **Response**: `{ access_token, refresh_token }`
- **Function**: `refreshToken()`

---

## 🏠 **Home & Feed Endpoints**

### Get Top Picks
- **Endpoint**: `GET /api/top_picks`
- **Query Params**: `limit=20`
- **Auth**: Not Required
- **Function**: `getTopPicks()`

### Get Nearby Ads
- **Endpoint**: `GET /api/nearby`
- **Query Params**: `latitude, longitude`
- **Auth**: Not Required
- **Function**: `getNearbyItems(latitude, longitude)`

### Get Following Ads
- **Endpoint**: `GET /api/following`
- **Query Params**: `limit=20`
- **Auth**: Required
- **Function**: `getFollowingItems()`

---

## 📦 **Ads Management Endpoints**

### Get All Ads
- **Endpoint**: `GET /ads/`
- **Query Params**: `page=1, size=20`
- **Auth**: Not Required
- **Function**: `getAllAds(page, size)`

### Get Single Ad
- **Endpoint**: `GET /ads/single/{ad_id}`
- **Auth**: Not Required
- **Function**: `getAdById(ad_id)`

### Get My Ads
- **Endpoint**: `GET /ads/my-ads`
- **Query Params**: `page=1, size=20`
- **Auth**: Required
- **Function**: `getMyAds(page, size)`

### Create Ad
- **Endpoint**: `POST /ads/`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "title": "string",
  "description": "string", 
  "price": "number",
  "category": "string",
  "condition": "new|used|refurbished",
  "location": "string",
  "contact_phone": "string"
}
```
- **Function**: `createAd(adData)`

### Update Ad
- **Endpoint**: `PUT /ads/{ad_id}`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Function**: `updateAd(ad_id, adData)`

### Delete Ad
- **Endpoint**: `DELETE /ads/{ad_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Function**: `deleteAd(ad_id)`

### Get Ads by Category
- **Endpoint**: `GET /ads/by-parent/{parent_name}`
- **Query Params**: `page=1, size=20`
- **Function**: `getItemsByCategory(category, page, size)`

### Get Similar Ads
- **Endpoint**: `GET /ads/{ad_id}/similar`
- **Function**: `getSimilarAds(ad_id)`

### Get Ads by User
- **Endpoint**: `GET /ads/by-user/{user_id}`
- **Query Params**: `page=1, size=20`
- **Function**: `getAdsByUser(user_id, page, size)`

### Increment Ad View
- **Endpoint**: `POST /ads/{ad_id}/view`
- **Headers**: `Authorization: Bearer <token>`
- **Function**: `incrementAdView(ad_id)`

### Toggle Ad Like
- **Endpoint**: `POST /ads/{ad_id}/like`
- **Headers**: `Authorization: Bearer <token>`
- **Function**: `toggleAdLike(ad_id)`

---

## 🔍 **Search & Recommendations**

### Get Recommendations
- **Endpoint**: `GET /api/recommendations/`
- **Query Params**: `limit=20`
- **Function**: `getRecommendations(limit)`

### Get Similar Recommendations
- **Endpoint**: `GET /api/recommendations/similar/{ad_id}`
- **Function**: `getSimilarRecommendations(ad_id)`

### Get Trending Ads
- **Endpoint**: `GET /api/recommendations/trending`
- **Query Params**: `limit=20`
- **Function**: `getTrendingAds(limit)`

### Get Category Recommendations
- **Endpoint**: `GET /api/recommendations/category/{category_name}`
- **Query Params**: `limit=20`
- **Function**: `getCategoryRecommendations(category_name, limit)`

### Get Location Recommendations
- **Endpoint**: `GET /api/recommendations/location/{location}`
- **Query Params**: `limit=20`
- **Function**: `getLocationRecommendations(location, limit)`

### Get Search Suggestions
- **Endpoint**: `GET /api/search/suggestions`
- **Query Params**: `q=search_term`
- **Function**: `getSearchSuggestions(query)`

### Get Trending Searches
- **Endpoint**: `GET /api/search/trending`
- **Function**: `getTrendingSearches()`

---

## 💗 **Favorites Management**

### Get Favorite Ads
- **Endpoint**: `GET /api/favourites/`
- **Headers**: `Authorization: Bearer <token>`

### Add to Favorites
- **Endpoint**: `POST /api/favourites/{ad_id}`
- **Headers**: `Authorization: Bearer <token>`

### Remove from Favorites
- **Endpoint**: `DELETE /api/favourites/{product_id}`
- **Headers**: `Authorization: Bearer <token>`

### Clear All Favorites
- **Endpoint**: `DELETE /api/favourites/clear`
- **Headers**: `Authorization: Bearer <token>`

---

## 💬 **Messages & Chat**

### Create Message
- **Endpoint**: `POST /api/messages/`
- **Headers**: `Authorization: Bearer <token>`

### Get Conversation
- **Endpoint**: `GET /api/messages/conversation/{user_id}/{product_id}`
- **Headers**: `Authorization: Bearer <token>`

### Get User Conversations
- **Endpoint**: `GET /api/messages/conversations/`
- **Headers**: `Authorization: Bearer <token>`

### Mark Message as Read
- **Endpoint**: `PUT /api/messages/{message_id}/read`
- **Headers**: `Authorization: Bearer <token>`

---

## 👤 **User Management**

### Get Profile
- **Endpoint**: `GET /api/user/profile`
- **Headers**: `Authorization: Bearer <token>`

### Update Profile
- **Endpoint**: `PUT /api/user/profile`
- **Headers**: `Authorization: Bearer <token>`

### Update Avatar
- **Endpoint**: `PUT /api/user/avatar`
- **Headers**: `Authorization: Bearer <token>`

### Change Password
- **Endpoint**: `POST /api/user/change-password`
- **Headers**: `Authorization: Bearer <token>`

---

## 🔔 **Notifications**

### Get Notifications
- **Endpoint**: `GET /api/notifications/`
- **Headers**: `Authorization: Bearer <token>`

### Mark Notification as Read
- **Endpoint**: `PUT /api/notifications/{notification_id}/read`
- **Headers**: `Authorization: Bearer <token>`

### Register FCM Token
- **Endpoint**: `POST /api/notifications/register-token`
- **Headers**: `Authorization: Bearer <token>`

---

## 📁 **File Uploads**

### Upload Ad Image
- **Endpoint**: `POST /uploads/ad-image`
- **Headers**: `Content-Type: multipart/form-data`

### Upload Multiple Images
- **Endpoint**: `POST /uploads/ad-images`
- **Headers**: `Content-Type: multipart/form-data`

---

## 🛒 **Orders & Payments**

### Place Order
- **Endpoint**: `POST /api/orders/`
- **Headers**: `Authorization: Bearer <token>`

### Get User Orders
- **Endpoint**: `GET /api/orders/`
- **Headers**: `Authorization: Bearer <token>`

### Verify Payment
- **Endpoint**: `POST /api/orders/verify-payment`
- **Headers**: `Authorization: Bearer <token>`

---

## 🚨 **Error Handling**

All endpoints return errors in FastAPI format:
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🧪 **Testing**

To test all endpoints:
```javascript
import { runAllAPITests } from './src/apis/__tests__/apiTests';

// Run comprehensive tests
const results = await runAllAPITests();
console.log(results);
```

To test individual endpoints:
```javascript
import { testEndpoint } from './src/apis/testRunner';
import { getTopPicks } from './src/apis/homeApi';

// Test single endpoint
const result = await testEndpoint('Top Picks', () => getTopPicks());
console.log(result);
```

---

## ✅ **Fixed Integration Issues**

1. **✅ Corrected Authentication Endpoints** - Now using `/auth/register`, `/auth/login`, `/auth/token/refresh`
2. **✅ Standardized Base URL** - All files now import from `api.js`
3. **✅ Added Missing Endpoints** - Complete coverage of documented APIs
4. **✅ Improved Error Handling** - Centralized FastAPI error formatting
5. **✅ Comprehensive Testing** - Full test suite for all endpoints
6. **✅ Proper Token Management** - Automatic token refresh and storage

The API integration is now fully functional and aligned with the official documentation!