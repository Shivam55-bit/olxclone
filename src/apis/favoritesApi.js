// src/apis/favoritesApi.js

// 🔑 API Configuration (Keep this here, away from the Context)
// 💡 Recommended Fix: Switch to HTTPS for production and security reasons.
const API_BASE_URL = 'https://bhoomi.dinahub.live/api/'; 
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzMTIzIiwiZXhwIjoxNzYwMDkwMTU1fQ.xSEBlG1McDewKhdBYkOtOVLjTSZH06Dgj1uvNwR6HCU'; 
const IMAGE_BASE_URL = 'https://bhoomi.dinahub.live'; // Base URL for constructing absolute image URIs

// 🔑 Helper function to get headers for authenticated requests
const getAuthHeaders = () => ({
    'accept': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
});

// 🔑 Helper function to handle API response
const handleApiResponse = async (response) => {
    if (!response.ok) {
        let errorText;
        try {
            const errorData = await response.json();
            errorText = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch {
            errorText = await response.text();
        }
        // Throw an error that includes relevant status and message
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }
    // Return the parsed JSON data
    return response.json();
};

// ----------------------------------------------------------------------
// --- API Function 1: GET Wishlist ---
// ----------------------------------------------------------------------
export const getFavorites = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}favourites/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const data = await handleApiResponse(response);
        
        // 💡 Enhancement: Map the data to prepend the IMAGE_BASE_URL for correct display
        // This ensures the Image component gets a fully absolute URL (e.g., https://domain.com/uploads/...)
        const cleanedData = data.map(item => {
            // Check if the image path is relative (starts with '/')
            if (typeof item.image === 'string' && item.image.startsWith('/')) {
                return { 
                    ...item, 
                    image: `${IMAGE_BASE_URL}${item.image}` // Creates the full absolute URL
                };
            }
            return item;
        });

        return cleanedData; 
        
    } catch (error) {
        console.error('Fetch Wishlist API Error:', error.message);
        // Return empty array if API route doesn't exist (404) to prevent app crash
        if (error.message.includes('404')) {
            console.warn('Wishlist API endpoint not found. Returning empty wishlist.');
            return [];
        }
        throw error; // Re-throw the error for the context to handle
    }
};

// ----------------------------------------------------------------------
// --- API Function 2: REMOVE From Wishlist (Assumes DELETE method) ---
// ----------------------------------------------------------------------
export const removeFromWishlistApi = async (itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}favourites/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        // The API might return 204 No Content for a successful DELETE, so check status explicitly
        if (response.status === 204 || response.ok) {
            return true;
        }

        await handleApiResponse(response); // Will throw if status is bad

    } catch (error) {
        // console.error(`API Error (removeFromWishlistApi) for item ${itemId}:`, error.message);
        throw error;
    }
};

// ----------------------------------------------------------------------
// --- API Function 3: ADD to Wishlist (Assumes POST method) ---
// ----------------------------------------------------------------------
export const addToWishlistApi = async (itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}favourites/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ product_id: itemId }) // Adjust payload key if needed
        });
        
        const data = await handleApiResponse(response);
        return data; // Usually returns the newly created favorite item/confirmation
        
    } catch (error) {
        // console.error(`API Error (addToWishlistApi) for item ${itemId}:`, error.message);
        throw error;
    }
};