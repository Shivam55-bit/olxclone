// --- REQUIRED INSTALLATION: npm install @react-native-async-storage/async-storage ---
// If you encounter 'atob is not defined' error, you must also install a base64 polyfill (e.g., 'base-64')
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'https://bhoomi.dinahub.live'; // Your actual API base URL

// Storage Keys
const ACCESS_TOKEN_KEY = '@access_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const TOKEN_TYPE_KEY = '@token_type';
const USER_DATA_KEY = '@user_data';

// --- Token and Storage Management Functions ---

export const getAccessToken = async () => {
    try {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
};
export const getRefreshToken = async () => {
    try {
        const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
};
export const getTokenType = async () => {
    try {
        const tokenType = await AsyncStorage.getItem(TOKEN_TYPE_KEY);
        // Default to 'Bearer' if not found
        return tokenType || 'Bearer'; 
    } catch (error) {
        console.error('Error getting token type:', error);
        return 'Bearer';
    }
};
export const storeTokens = async (accessToken, refreshToken, tokenType = 'Bearer') => {
    try {
        await AsyncStorage.multiSet([
            [ACCESS_TOKEN_KEY, accessToken],
            [REFRESH_TOKEN_KEY, refreshToken],
            [TOKEN_TYPE_KEY, tokenType],
        ]);
        console.log('✅ Tokens stored successfully');
    } catch (error) {
        console.error('Error storing tokens:', error);
        throw error;
    }
};
export const storeUserData = async (userData) => {
    try {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        console.log('✅ User data stored successfully');
    } catch (error) {
        console.error('Error storing user data:', error);
        throw error;
    }
};
export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const logout = async () => {
    try {
        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_TYPE_KEY, USER_DATA_KEY]);
        console.log('✅ User logged out successfully');
        // NOTE: The calling component should handle navigation to the Login Screen after logout.
        Alert.alert('Session Expired', 'Your session has expired. Please login again.', [{ text: 'OK', onPress: () => { /* Add Navigation to LoginScreen here */ } }]);
    } catch (error) {
        console.error('Error during logout:', error);
    }
};

export const isLoggedIn = async () => {
    try {
        const accessToken = await getAccessToken();
        return !!accessToken;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
};


export const refreshToken = async () => {
    try {
        const refresh_token = await getRefreshToken();

        if (!refresh_token) {
            // Log out the user if no refresh token is found
            await logout();
            throw new Error('No refresh token available. User logged out.');
        }

        console.log('🔄 Attempting to refresh token...');
        
        // Endpoint for refresh token might be different from login
        const REFRESH_ENDPOINT = `${BASE_URL}/api/auth/token/refresh`; 

        const response = await fetch(REFRESH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: refresh_token,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorStatus = response.status;
            let errorMessage = data.message || data.detail || 'Failed to refresh token';

            if (errorStatus === 401 || errorStatus === 403) {
                // If refresh token fails, clear session and force login
                throw new Error('Refresh token expired. Please login again.');
            }
            if (errorStatus === 405) {
                throw new Error('Token refresh endpoint not available (405).');
            }
            
            throw new Error(errorMessage);
        }

        const newAccessToken = data.access_token || data.token;
        const newRefreshToken = data.refresh_token || refresh_token;
        const tokenType = data.token_type || 'Bearer';

        // Store new tokens
        await storeTokens(newAccessToken, newRefreshToken, tokenType);
        console.log('✅ Token refreshed successfully');
        
        return { access_token: newAccessToken, refresh_token: newRefreshToken, token_type: tokenType };

    } catch (error) {
        console.error('❌ Token refresh failed:', error.message);
        // CRITICAL FIX: Ensure logout is called ONLY if the error implies a permanent session issue.
        if (error.message.includes('expired') || error.message.includes('No refresh token available')) {
             await logout();
        }
        throw error;
    }
};

/**
 * Login user and store tokens
 * * @param {object} credentials - Object containing username and password.
 * @param {string} credentials.username
 * @param {string} credentials.password
 */
export const login = async ({ username, password }) => { 
    try {
        console.log('🔐 Attempting to login with confirmed JSON path...');

        // Using the exact confirmed URL and JSON body
        const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`; 

        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        // Attempt to parse JSON even if response is not 'ok'
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Handle cases where the server returns a non-JSON body on error
            data = { detail: response.statusText || 'Non-JSON error response from server' };
        }

        if (!response.ok) {
            const errorStatus = response.status;
            
            // Extract error message
            let errorMessage = data.message || data.detail || data.error || response.statusText;
            
            // Handle nested 422 validation errors (common in some frameworks)
            if (errorStatus === 422 && data.detail && Array.isArray(data.detail)) {
                errorMessage = data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ');
            }
            
            throw new Error(`Login failed (${errorStatus}): ${errorMessage || 'Unknown error'}`);
        }

        // Check for required tokens
        if (!data.access_token || !data.refresh_token) {
             throw new Error("Server response missing required tokens. Check API response structure.");
        }
        
        // Store tokens
        await storeTokens(
            data.access_token,
            data.refresh_token,
            data.token_type || 'Bearer'
        );

        // Store user data if available 
        if (data.user) {
            await storeUserData(data.user);
        }

        console.log('✅ Login successful');
        return data;

    } catch (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
    }
};

export const getUserId = async () => {
    try {
        const userData = await getUserData();
        return userData?.id || userData?.user_id || userData?._id || null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

/**
 * Register a new user
 * @param {object} userData - Object containing user registration data
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.phone
 * @param {string} userData.password
 */
export const registerUser = async ({ username, email, phone, password }) => {
    try {
        console.log('📝 Attempting to register user...');

        const REGISTER_ENDPOINT = `${BASE_URL}/auth/register`;

        const response = await fetch(REGISTER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                phone: phone,
                password: password,
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            data = { detail: response.statusText || 'Non-JSON error response from server' };
        }

        if (!response.ok) {
            const errorStatus = response.status;
            let errorMessage = data.message || data.detail || data.error || response.statusText;
            
            if (errorStatus === 422 && data.detail && Array.isArray(data.detail)) {
                errorMessage = data.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ');
            }
            
            throw new Error(`Registration failed (${errorStatus}): ${errorMessage || 'Unknown error'}`);
        }

        console.log('✅ Registration successful');
        return data;

    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        throw error;
    }
};

// --- Other Token Utility Functions ---

export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // ❌ CRITICAL RN WARNING: This logic relies on global 'atob' which is NOT native to React Native. 
        // It will likely crash unless you install a polyfill (e.g., 'base-64') and import it 
        // OR use an RN-compatible library like 'jwt-decode'.
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        // ✅ Improvement: Check that 'exp' exists and is a number
        if (!decoded || typeof decoded.exp !== 'number') return true; 
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        // Assume expired if decoding fails
        return true; 
    }
};
export const getValidAccessToken = async () => {
    try {
        let accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('No access token available');
        }
        if (isTokenExpired(accessToken)) {
            console.log('⏰ Access token expired, refreshing...');
            const refreshed = await refreshToken();
            accessToken = refreshed.access_token;
        }
        return accessToken;
    } catch (error) {
        console.error('Error getting valid access token:', error);
        // Logout user on failure (e.g., if refresh fails)
        await logout(); 
        throw error;
    }
};
