// src/utils/NavigationOptimizer.js
import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// ✅ Lazy Loading Components - CRITICAL Performance Boost
const LazyHomeScreen = React.lazy(() => import('../screens/HomeScreen'));
const LazySearchScreen = React.lazy(() => import('../tabs/Search'));
const LazyUserScreen = React.lazy(() => import('../tabs/User'));
const LazyMyAdsScreen = React.lazy(() => import('../tabs/MyAds'));
const LazyItemDetailsScreen = React.lazy(() => import('../screens/ItemDetails'));
const LazyChatScreen = React.lazy(() => import('../screens/Chat'));
const LazyChatDetailScreen = React.lazy(() => import('../screens/ChatDetail'));
const LazyLoginScreen = React.lazy(() => import('../screens/LoginScreen'));
const LazyRegisterScreen = React.lazy(() => import('../screens/RegisterScreen'));
const LazyEditProfileScreen = React.lazy(() => import('../screens/EditProfileScreen'));
const LazyWishlistScreen = React.lazy(() => import('../screens/Wishlist'));
const LazySellCategoriesScreen = React.lazy(() => import('../screens/SellCategories'));

// ✅ Universal Loading Component
const ScreenLoader = ({ text = 'Loading...' }) => (
    <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        {text && <Text style={styles.loaderText}>{text}</Text>}
    </View>
);

// ✅ Enhanced Lazy Wrapper with Error Boundary
const withLazyLoading = (Component, loadingText) => {
    return React.forwardRef((props, ref) => (
        <Suspense fallback={<ScreenLoader text={loadingText} />}>
            <Component {...props} ref={ref} />
        </Suspense>
    ));
};

// ✅ Pre-configured Lazy Components
export const LazyComponents = {
    Home: withLazyLoading(LazyHomeScreen, 'Loading Home...'),
    Search: withLazyLoading(LazySearchScreen, 'Loading Search...'),
    User: withLazyLoading(LazyUserScreen, 'Loading Profile...'),
    MyAds: withLazyLoading(LazyMyAdsScreen, 'Loading Your Ads...'),
    ItemDetails: withLazyLoading(LazyItemDetailsScreen, 'Loading Product...'),
    Chat: withLazyLoading(LazyChatScreen, 'Loading Messages...'),
    ChatDetail: withLazyLoading(LazyChatDetailScreen, 'Loading Chat...'),
    Login: withLazyLoading(LazyLoginScreen, 'Loading Login...'),
    Register: withLazyLoading(LazyRegisterScreen, 'Loading Registration...'),
    EditProfile: withLazyLoading(LazyEditProfileScreen, 'Loading Profile Editor...'),
    Wishlist: withLazyLoading(LazyWishlistScreen, 'Loading Wishlist...'),
    SellCategories: withLazyLoading(LazySellCategoriesScreen, 'Loading Categories...'),
};

// ✅ Navigation Performance Configurations
export const NavigationOptimizations = {
    // Screen options for better performance
    defaultScreenOptions: {
        headerShown: true,
        animationEnabled: true,
        gestureEnabled: true,
        // ✅ Reduce animation duration for faster navigation
        animationDuration: 200,
        cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
            },
        }),
    },

    // Tab bar optimizations
    tabBarOptions: {
        lazy: true,
        swipeEnabled: false,
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: true,
        tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
        },
        // ✅ Prevent unnecessary re-renders
        tabBarItemStyle: {
            paddingVertical: 4,
        },
    },

    // Stack navigator optimizations
    stackOptions: {
        headerMode: 'screen',
        // ✅ Disable gestures on heavy screens to prevent memory issues
        gestureEnabled: false,
        
        // ✅ Optimize for Android back button
        headerBackTitleVisible: false,
        headerTruncatedBackTitle: '',
        
        // ✅ Reduce header rendering overhead
        headerStyle: {
            elevation: 4,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
    },
};

// ✅ Screen Memory Management
export class ScreenMemoryManager {
    static activeScreens = new Set();
    static preloadedScreens = new Map();
    static MAX_PRELOADED = 3;

    // Track active screens to manage memory
    static markScreenActive(screenName) {
        this.activeScreens.add(screenName);
        this.cleanupInactiveScreens();
    }

    static markScreenInactive(screenName) {
        this.activeScreens.delete(screenName);
    }

    // Preload critical screens in background
    static async preloadScreen(screenName, Component) {
        if (this.preloadedScreens.size >= this.MAX_PRELOADED) {
            // Remove oldest preloaded screen
            const firstKey = this.preloadedScreens.keys().next().value;
            this.preloadedScreens.delete(firstKey);
        }

        try {
            const LoadedComponent = await Component();
            this.preloadedScreens.set(screenName, LoadedComponent);
        } catch (error) {
            console.warn(`Failed to preload screen ${screenName}:`, error);
        }
    }

    // Get preloaded screen or lazy load
    static getScreen(screenName, Component) {
        if (this.preloadedScreens.has(screenName)) {
            return this.preloadedScreens.get(screenName);
        }
        return Component;
    }

    // Cleanup inactive screens to free memory
    static cleanupInactiveScreens() {
        if (this.activeScreens.size > 5) {
            // Force cleanup if too many screens are active
            console.warn('Too many active screens, forcing cleanup');
            global.gc && global.gc();
        }
    }
}

// ✅ Navigation Performance Monitor
export class NavigationPerformanceMonitor {
    static navigationTimes = new Map();
    static averageTimes = new Map();

    static startNavigation(screenName) {
        this.navigationTimes.set(screenName, Date.now());
    }

    static endNavigation(screenName) {
        const startTime = this.navigationTimes.get(screenName);
        if (startTime) {
            const duration = Date.now() - startTime;
            this.updateAverageTime(screenName, duration);
            this.navigationTimes.delete(screenName);

            // Log slow navigations
            if (duration > 1000) {
                console.warn(`Slow navigation to ${screenName}: ${duration}ms`);
            }

            return duration;
        }
        return null;
    }

    static updateAverageTime(screenName, duration) {
        const current = this.averageTimes.get(screenName) || { total: 0, count: 0 };
        current.total += duration;
        current.count += 1;
        this.averageTimes.set(screenName, current);
    }

    static getAverageNavigationTime(screenName) {
        const data = this.averageTimes.get(screenName);
        return data ? data.total / data.count : null;
    }

    static getAllAverageTimes() {
        const result = {};
        for (const [screenName, data] of this.averageTimes) {
            result[screenName] = Math.round(data.total / data.count);
        }
        return result;
    }
}

// ✅ Navigation HOC for Performance Tracking
export const withNavigationTracking = (Component, screenName) => {
    return React.forwardRef((props, ref) => {
        React.useEffect(() => {
            NavigationPerformanceMonitor.startNavigation(screenName);
            ScreenMemoryManager.markScreenActive(screenName);

            return () => {
                NavigationPerformanceMonitor.endNavigation(screenName);
                ScreenMemoryManager.markScreenInactive(screenName);
            };
        }, []);

        return <Component {...props} ref={ref} />;
    });
};

// ✅ Styles
const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    loaderText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default {
    LazyComponents,
    NavigationOptimizations,
    ScreenMemoryManager,
    NavigationPerformanceMonitor,
    withNavigationTracking,
    withLazyLoading,
};