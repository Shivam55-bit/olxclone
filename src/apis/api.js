import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// 🔑 Import utility functions from the new authApi file
import { 
    getAccessToken, 
    getTokenType, 
    refreshToken, 
    logout 
} from "./authApi";

// 🔑 SET THIS CORRECTLY! Base URL for your API.
export const BASE_URL = "https://bhoomi.dinahub.live";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
});

// --- Global state for Token Refresh ---
let isRefreshing = false;
let failedQueue = [];

// Helper function to process the queue of requests that failed due to 401
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            // Resolve queued requests with the new token
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Helper function to format complex error data into a single, readable string
const formatApiErrorMessage = (error) => {
    const errorResponse = error.response;
    if (!errorResponse || !errorResponse.data) {
        return error.message || "An unknown network error occurred.";
    }

    const errorDetail = errorResponse.data.detail || errorResponse.data.message || errorResponse.data;

    if (Array.isArray(errorDetail)) {
        // Handle FastAPI/Pydantic validation array structure
        const validationMessages = errorDetail.map(detail => {
            const field = detail.loc ? detail.loc.slice(1).join('.') : 'Unknown Field';
            return `${field}: ${detail.msg || detail.message}`;
        });
        return validationMessages.join('\n');
    } else if (typeof errorDetail === 'string') {
        return errorDetail;
    } else if (typeof errorDetail === 'object' && errorDetail !== null) {
        // Handle general JSON object errors
        let detailMessages = [];
        try {
            for (const key in errorDetail) {
                const value = errorDetail[key];
                const fieldErrors = Array.isArray(value) ? value.join(', ') : String(value);

                detailMessages.push(`${key.toUpperCase()}: ${fieldErrors}`);
            }
            return detailMessages.length > 0 ? detailMessages.join('\n') : JSON.stringify(errorDetail, null, 2);
        } catch (e) {
            return JSON.stringify(errorDetail, null, 2);
        }
    }

    return String(errorDetail);
};


// Interceptor: Adds Authorization header
api.interceptors.request.use(
    async (config) => {
        // Use dynamic token retrieval from authApi.js
        const token = await getAccessToken(); 
        const tokenType = (await getTokenType()) || "Bearer";
        
        if (token) {
            config.headers.Authorization = `${tokenType} ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: Handles status codes, error formatting, and token refresh
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isApiError = !!error.response;

        // 1. Check for 401 Unauthorized AND ensure it's not a retry or the refresh request itself
        if (status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/token/refresh') {
            
            // Mark the request as having been attempted for retry
            originalRequest._retry = true; 

            if (isRefreshing) {
                // If a refresh is already in progress, queue the current failed request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, originalRequest });
                }).then(() => {
                    // Once refresh is complete, retry the original request with the new token
                    return api(originalRequest); 
                }).catch(err => {
                    // Propagate logout error
                    return Promise.reject(err);
                });
            }

            // --- Start the Refresh Process ---
            isRefreshing = true;
            
            return new Promise(async (resolve, reject) => {
                try {
                    console.log("Starting token refresh...");
                    // 2. Call the dedicated refresh function
                    const newTokens = await refreshToken(); 
                    
                    // 3. Update the original request's header with the new token
                    originalRequest.headers.Authorization = `${newTokens.token_type} ${newTokens.access_token}`;
                    
                    // 4. Process the queue and execute the original request
                    processQueue(null, newTokens.access_token);
                    resolve(api(originalRequest));

                } catch (err) {
                    // Refresh failed, log user out and reject all queued requests
                    console.error("Token refresh failed. Logging user out.", err);
                    await logout();
                    processQueue(err, null);
                    reject(err);

                } finally {
                    isRefreshing = false;
                }
            });
        }
        
        // --- Existing error formatting and default 401/403 handling (if refresh fails) ---
        if (status === 401 || status === 403) {
            // Note: If token refresh failed, logout() is already called above. 
            // This is for other 401/403 errors (e.g., refresh token expired or invalid credentials).
            await logout();
        }

        if (isApiError) {
            error.message = formatApiErrorMessage(error);
        } else if (error.message.includes('Network Error')) {
            error.message = "Network connection failed. Check Wi-Fi/data or ensure the API server is reachable.";
        }

        return Promise.reject(error);
    }
);

export default api;