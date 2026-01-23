// src/screens/User.js
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
// Assuming these are correctly imported and function:
import { getProfile, deleteAccount } from "../apis/userApi";
import { logoutUser } from "../apis/authApi"; 
import { BASE_URL } from "../apis/api"; // ✅ Use the centralized BASE_URL

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/**
 * Helper function to construct full image URL
 * @param {string} imagePath - The image path from the backend (can be absolute URL or relative path)
 * @returns {string} - Full absolute URL
 */
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return DEFAULT_AVATAR;
    
    const trimmedPath = imagePath.trim();
    
    // If it's already an absolute URL, return as-is
    if (trimmedPath.startsWith("http")) {
        return trimmedPath;
    }
    
    // If it's a relative path, construct the full URL
    // Remove leading slashes to avoid double slashes
    const cleanedPath = trimmedPath.replace(/^\/+/, "");
    const cleanedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    
    return `${cleanedBase}/${cleanedPath}`;
};

/* ----------------- Components ----------------- */

/**
 * A reusable component for a single menu item.
 */
const MenuItem = ({ icon, label, onPress, color = "#333", isLast }) => (
    <TouchableOpacity
        style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons name={icon} size={22} color={color} style={{ marginRight: 14 }} />
        <Text style={[styles.menuText, { color }]}>{label}</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="chevron-forward-outline" size={18} color="#bbb" />
    </TouchableOpacity>
);

/**
 * A reusable component for displaying a stat box (e.g., Followers, Posts).
 */
const StatBox = ({ label, value, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={styles.statBoxTouchable}
        activeOpacity={0.7}
        disabled={!onPress} // Disable touch if no onPress handler is provided
    >
        <View style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    </TouchableOpacity>
);

/* ----------------- Main Component ----------------- */

const User = () => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial stats state
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    // New state to manage avatar loading failure locally
    const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATAR);

    // Fetch profile and stats in a single call
    const fetchProfile = async () => {
        try {
            if (!refreshing) setLoading(true);

            // 1. Fetch the profile data
            const userData = await getProfile();

            if (!userData) {
                throw new Error("Profile data is empty.");
            }

            // 2. Process and fix avatar URL
            let finalAvatarUri = DEFAULT_AVATAR;
            if (userData.avatar) {
                finalAvatarUri = getFullImageUrl(userData.avatar);
                // 🔧 Add cache busting to force image reload
                const cacheBuster = new Date().getTime();
                finalAvatarUri = `${finalAvatarUri}?t=${cacheBuster}`;
            }
            // Update the dedicated avatar state
            setAvatarUri(finalAvatarUri);
            console.log("🖼️ Avatar URI set to:", finalAvatarUri);


            // 3. Extract stats directly from the profile data
            setStats({
                followers: userData.followers_count || 0,
                following: userData.following_count || 0,
                posts: userData.total_ads || 0, // Assuming 'total_ads' is the post count
            });

            // 4. Set the cleaned profile data (excluding avatar URL fix)
            setProfile(userData);

        } catch (error) {
            console.error("❌ Error fetching profile details:", error.message);
            setProfile(null); // Set to null on failure to ensure UI handles it

            // Commenting out the Alert during fetchFocus to avoid spamming the user on bad connection
            // Alert.alert(
            //   "Error",
            //   error.message || "Failed to load profile."
            // );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Re-fetch profile whenever screen is focused (Crucial for update on return)
    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, []);

    // **Handles Navigation to MyAdsScreen (or a screen displaying user's posts)**
    const handleMyAdsPress = () => {
        navigation.navigate("MyAds");
    };

    // **Handles Navigation to ConnectionsScreen**
    const handleConnectionsPress = (initialTab = 'Following') => {
        // Note: ConnectionsScreen expects the initialTab name (e.g., 'Followers' or 'Following')
        navigation.navigate("ConnectionsScreen", { initialTab });
    };
    // ----------------------------------------------------

    /**
     * FIX: Ensures client-side logout (token clear + navigation reset) occurs 
     * even if the server-side logout API call fails.
     */
    const handleLogout = async () => {
        try {
            // 1. Attempt the API/Local storage clear function.
            // Wrap it in a try/catch to ensure navigation.reset runs even on failure.
            try {
                await logoutUser();
            } catch (apiError) {
                // Log the API/local error but don't stop the client from navigating away
                console.warn("Server/Local logout failed, resetting navigation anyway:", apiError.message);
            }

            // 2. Reset navigation state to push to LoginScreen. This is the crucial visual step.
            navigation.reset({
                index: 0,
                routes: [{ name: "LoginScreen" }],
            });

        } catch (error) {
            // This catch is for errors during navigation.reset
            Alert.alert("Error", error.message || "Failed to finalize log out.");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "⚠️ Delete Account",
            "Are you sure you want to permanently delete your account? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. Attempt to delete account
                            await deleteAccount();
                            // 2. Clear tokens locally (this is essential)
                            await logoutUser(); 
                            
                            // 3. Reset navigation
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "LoginScreen" }],
                            });
                            Alert.alert("✅ Account Deleted", "Your account has been removed.");
                        } catch (error) {
                            Alert.alert(
                                "❌ Error",
                                error.message || "Failed to delete account."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handlePress = (tab) => {
        switch (tab) {
            case "myAds":
                handleMyAdsPress();
                break;
            case "orders":
                navigation.navigate("MyOrders");
                break;
            case "wishlist":
                navigation.navigate("Wishlist");
                break;
            case "notifications":
                navigation.navigate("Notifications");
                break;
            case "settings":
                navigation.navigate("AccountSettings");
                break;
            case "about":
                navigation.navigate("AboutUs");
                break;
            case "contact":
                navigation.navigate("ContactUs");
                break;
            case "faq":
                navigation.navigate("FAQScreen");
                break;
            case "editProfile":
                navigation.navigate("EditProfileScreen");
                break;
            case "share":
                Alert.alert("📤 Share App", "Share the app link with friends!");
                break;
            case "logout":
                handleLogout(); // ⬅️ Calling the fixed function
                break;
            case "delete":
                handleDeleteAccount();
                break;
            default:
                break;
        }
    };

    // Loader view
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={{ marginTop: 12, color: "#444" }}>Loading profile...</Text>
            </View>
        );
    }

    // Fallback if profile is null after loading (e.g., failed to fetch)
    if (!profile) {
        return (
            <View style={styles.loader}>
                <Text style={{ fontSize: 16, color: '#d32f2f' }}>Failed to load profile data.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#4caf50", "#2e7d32", "#1b5e20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileCard}
            >
                <View style={styles.avatarBorder}>
                    <Image
                        key={avatarUri}
                        source={{ uri: avatarUri }}
                        style={styles.avatar}
                        onError={() => {
                            // Set to default on error to prevent re-render loop if image fails
                            setAvatarUri(DEFAULT_AVATAR);
                        }}
                    />
                    <TouchableOpacity
                        style={styles.editAvatar}
                        onPress={() => handlePress("editProfile")}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>
                    {profile.full_name || profile.username || "Guest User"}
                </Text>
                <Text style={styles.location}>
                    {profile.bio || "No bio available"}
                </Text>

                <View style={styles.statsRow}>
                    {/* Followers Stat: Navigates to ConnectionsScreen with 'Followers' tab */}
                    <StatBox
                        label="Followers"
                        value={stats.followers}
                        onPress={() => handleConnectionsPress('Followers')} // Pass 'Followers' tab name
                    />

                    {/* Following Stat: Navigates to ConnectionsScreen with 'Following' tab */}
                    <StatBox
                        label="Following"
                        value={stats.following}
                        onPress={() => handleConnectionsPress('Following')} // Pass 'Following' tab name
                    />

                    {/* Posts Stat: Navigates to MyAdsScreen */}
                    <StatBox
                        label="Posts"
                        value={stats.posts}
                        onPress={handleMyAdsPress} // Navigate to My Ads
                    />
                </View>
            </LinearGradient>

            <LinearGradient
                colors={["#4caf50", "#81c784", "#4caf50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerDivider}
            />

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#2e7d32" // Added tint color for better visibility
                    />
                }
            >
                {/* Menu Items */}
                <View style={styles.menuSection}>
                    
                    
                    <MenuItem icon="heart-outline" label="Wishlist" onPress={() => handlePress("wishlist")} />
                    <MenuItem icon="notifications-outline" label="Notifications" onPress={() => handlePress("notifications")} />
                    <MenuItem icon="settings-outline" label="Account Settings" onPress={() => handlePress("settings")} isLast />
                </View>

                <View style={styles.menuSection}>
                    <MenuItem icon="information-circle-outline" label="About Us" onPress={() => handlePress("about")} />
                    
                    <MenuItem icon="call-outline" label="Contact Us" onPress={() => handlePress("contact")} isLast />
                </View>

                <View style={styles.menuSection}>
                    <MenuItem icon="share-social-outline" label="Share App" onPress={() => handlePress("share")} />
                    <MenuItem icon="log-out-outline" label="Logout" onPress={() => handlePress("logout")} />
                    <MenuItem icon="trash-outline" label="Delete Account" color="#e63946" onPress={() => handlePress("delete")} isLast />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default User;

/* ----------------- Styles ----------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f9" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    profileCard: {
        alignItems: "center",
        paddingVertical: 40,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        paddingBottom: 50,
        shadowOffset: { width: 0, height: 4 },
    },
    avatarBorder: {
        padding: 4,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#fff",
    },
    editAvatar: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#2e7d32",
        padding: 6,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#fff",
    },
    name: { fontSize: 24, fontWeight: "700", color: "#fff" },
    location: {
        fontSize: 14,
        color: "#e0e0e0",
        marginTop: 2,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "80%",
    },
    statBoxTouchable: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    statBox: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        minWidth: 80,
    },
    statValue: { fontSize: 17, fontWeight: "700", color: "#fff" },
    statLabel: { fontSize: 12, color: "#f1f1f1", marginTop: 2 },
    headerDivider: {
        height: 4,
        marginHorizontal: 80,
        marginVertical: 18,
        borderRadius: 6,
    },
    scrollContent: { flex: 1 },
    menuSection: {
        backgroundColor: "#fff",
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 0.6,
        borderColor: "#eee",
    },
    menuText: { fontSize: 15.5, fontWeight: "500" },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#4caf50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});