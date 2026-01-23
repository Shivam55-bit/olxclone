/**
 * viewTracker.js - Manages view tracking for ads per user session
 * Prevents duplicate view counts from the same user viewing the same ad multiple times
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEWED_ADS_KEY = 'viewed_ads_session';

/**
 * Get all ads viewed in current session by this user
 * @returns {Promise<string[]>} Array of ad IDs that have been viewed
 */
export const getViewedAds = async () => {
    try {
        const viewedAds = await AsyncStorage.getItem(VIEWED_ADS_KEY);
        return viewedAds ? JSON.parse(viewedAds) : [];
    } catch (error) {
        console.error('Error retrieving viewed ads:', error);
        return [];
    }
};

/**
 * Check if an ad has already been viewed by the user in this session
 * @param {string|number} adId - The ad ID to check
 * @returns {Promise<boolean>} true if ad has been viewed, false otherwise
 */
export const hasAdBeenViewed = async (adId) => {
    try {
        const viewedAds = await getViewedAds();
        return viewedAds.includes(String(adId));
    } catch (error) {
        console.error('Error checking viewed ad:', error);
        return false;
    }
};

/**
 * Mark an ad as viewed in the user's session
 * @param {string|number} adId - The ad ID to mark as viewed
 * @returns {Promise<void>}
 */
export const markAdAsViewed = async (adId) => {
    try {
        const viewedAds = await getViewedAds();
        const adIdStr = String(adId);
        
        // Only add if not already in list
        if (!viewedAds.includes(adIdStr)) {
            viewedAds.push(adIdStr);
            await AsyncStorage.setItem(VIEWED_ADS_KEY, JSON.stringify(viewedAds));
        }
    } catch (error) {
        console.error('Error marking ad as viewed:', error);
    }
};

/**
 * Clear all viewed ads (useful when user logs out)
 * @returns {Promise<void>}
 */
export const clearViewedAds = async () => {
    try {
        await AsyncStorage.removeItem(VIEWED_ADS_KEY);
    } catch (error) {
        console.error('Error clearing viewed ads:', error);
    }
};

/**
 * Get count of ads viewed in current session
 * @returns {Promise<number>} Number of unique ads viewed
 */
export const getViewedAdsCount = async () => {
    try {
        const viewedAds = await getViewedAds();
        return viewedAds.length;
    } catch (error) {
        console.error('Error getting viewed ads count:', error);
        return 0;
    }
};
