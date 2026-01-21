// src/apis/errorHandler.js
// Centralized error handling for FastAPI responses

/**
 * Format FastAPI validation errors into readable messages
 * @param {object} errorResponse - The error response from FastAPI
 * @returns {string} Formatted error message
 */
export const formatFastAPIError = (errorResponse) => {
    if (!errorResponse || !errorResponse.data) {
        return "An unknown network error occurred.";
    }

    const errorDetail = errorResponse.data.detail || errorResponse.data.message || errorResponse.data;

    // Handle FastAPI validation errors (array format)
    if (Array.isArray(errorDetail)) {
        const validationMessages = errorDetail.map(detail => {
            const field = detail.loc ? detail.loc.slice(1).join('.') : 'Unknown Field';
            return `${field}: ${detail.msg || detail.message}`;
        });
        return `Validation errors: ${validationMessages.join(', ')}`;
    }

    // Handle string error messages
    if (typeof errorDetail === 'string') {
        return errorDetail;
    }

    // Handle object error messages
    if (typeof errorDetail === 'object') {
        return JSON.stringify(errorDetail);
    }

    return "An error occurred while processing your request.";
};

/**
 * Handle different types of API errors
 * @param {object} error - The error object from axios or fetch
 * @returns {object} Standardized error response
 */
export const handleApiError = (error, endpoint = 'Unknown') => {
    console.error(`❌ API error for ${endpoint}:`, error);

    let errorMessage = "An unknown error occurred.";
    let statusCode = 500;

    if (error.response) {
        // Server responded with error status
        statusCode = error.response.status;
        errorMessage = formatFastAPIError(error.response);

        // Handle specific HTTP status codes
        switch (statusCode) {
            case 400:
                errorMessage = `Bad Request: ${errorMessage}`;
                break;
            case 401:
                errorMessage = "Unauthorized. Please log in again.";
                break;
            case 403:
                errorMessage = "Access forbidden. You don't have permission.";
                break;
            case 404:
                errorMessage = "Resource not found.";
                break;
            case 422:
                errorMessage = `Validation Error: ${errorMessage}`;
                break;
            case 429:
                errorMessage = "Too many requests. Please try again later.";
                break;
            case 500:
                errorMessage = "Internal server error. Please try again later.";
                break;
            case 502:
            case 503:
            case 504:
                errorMessage = "Server is temporarily unavailable. Please try again later.";
                break;
        }
    } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your internet connection.";
        statusCode = 0;
    } else {
        // Other error
        errorMessage = error.message || "An unknown error occurred.";
    }

    return {
        success: false,
        error: errorMessage,
        statusCode: statusCode,
        timestamp: new Date().toISOString()
    };
};

/**
 * Wrapper for API calls with standardized error handling
 * @param {function} apiCall - The API call function
 * @param {string} endpoint - The endpoint being called (for logging)
 * @returns {object} Standardized API response
 */
export const withErrorHandling = async (apiCall, endpoint = 'Unknown') => {
    try {
        const response = await apiCall();
        
        // Ensure response has success field
        if (!response.hasOwnProperty('success')) {
            return {
                success: true,
                ...response
            };
        }
        
        return response;
    } catch (error) {
        return handleApiError(error, endpoint);
    }
};

/**
 * Log API call details for debugging
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {object} response - Response data
 */
export const logApiCall = (method, endpoint, data = null, response = null) => {
    const timestamp = new Date().toISOString();
    
    console.log(`🌐 API Call [${timestamp}]`);
    console.log(`   Method: ${method}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    if (data) {
        console.log(`   Request Data:`, data);
    }
    
    if (response) {
        console.log(`   Response:`, response);
    }
};

export default {
    formatFastAPIError,
    handleApiError,
    withErrorHandling,
    logApiCall
};