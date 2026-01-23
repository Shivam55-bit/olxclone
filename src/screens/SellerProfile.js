import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import api, { BASE_URL } from '../apis/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 30; // 15 padding on each side for the ad card

export default function SellerProfile() {
    const route = useRoute();
    const navigation = useNavigation();
    const userId = route.params?.userId;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const res = await api.get(`/api/user/${userId}/profile-full`);
                setProfile(res.data);
                setIsFollowing(res.data?.is_following || false);
            } catch (e) {
                setProfile(null);
            }
            setLoading(false);
        }
        if (userId) fetchProfile();
    }, [userId]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            await api.post(`/api/user/${userId}/${isFollowing ? 'unfollow' : 'follow'}`);
            setIsFollowing(!isFollowing);
        } catch (e) {}
        setFollowLoading(false);
    };

    // Extracting the header logic to be rendered inside the main View
    const renderHeaderContent = () => {
        if (loading) return <ActivityIndicator style={styles.loadingIndicator} size="large" color="#00796b" />;
        if (!profile) return <Text style={styles.notFoundText}>Seller not found</Text>;

        const avatarUri = profile.avatar?.startsWith('http')
            ? profile.avatar
            : `${BASE_URL.replace(/\/$/, '')}${profile.avatar ? '/' + profile.avatar.replace(/^\/+|\/+$/, '') : ''}`;

        return (
            <View style={styles.headerContainer}>
                {/* Background/Top Bar */}
                <LinearGradient colors={['#009688', '#186e0dff']} style={styles.gradientTopBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBox} activeOpacity={0.7}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Profile Card Stack */}
                <View style={styles.profileCardStack}>
                    {/* User Info Card (Floating above details) */}
                    <View style={styles.userInfoCard}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: avatarUri }} style={styles.avatarBig} />
                            {profile.is_verified && (
                                <View style={styles.verifiedBadgeBig}>
                                    <Icon name="checkmark-circle" size={26} color="#00791aff" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.sellerName}>{profile.full_name || profile.username}</Text>
                        <Text style={styles.sellerBio}>{profile.bio}</Text>
                        
                        {/* Action Buttons Row */}
                        <View style={styles.actionRow}>
                             {/* Follow Button */}
                            <TouchableOpacity
                                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                                onPress={handleFollow}
                                disabled={followLoading}
                                activeOpacity={0.8}
                            >
                                <Icon name={isFollowing ? "checkmark-sharp" : "person-add-outline"} size={16} color={isFollowing ? "#fff" : "#00796b"} />
                                <Text style={[styles.followBtnText, isFollowing && { color: "#fff" }]}>
                                    {isFollowing ? "Following" : "Follow"}
                                </Text>
                            </TouchableOpacity>

                            {/* Contact Button - Removed */}
                        </View>
                    </View>

                    {/* Stats/Badges Card */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statCount}>{profile.followers_count}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statSeparator} />
                        <View style={styles.statItem}>
                            <Text style={styles.statCount}>{profile.total_ads}</Text>
                            <Text style={styles.statLabel}>Total Ads</Text>
                        </View>
                        <View style={styles.statSeparator} />
                        <View style={styles.statItem}>
                            <Text style={styles.statCount}>{profile.member_since?.slice(0, 4)}</Text>
                            <Text style={styles.statLabel}>Member Since</Text>
                        </View>
                    </View>
                    
                    {/* Location and Info */}
                    <View style={styles.locationInfo}>
                        <Icon name="location-outline" size={16} color="#00796b" />
                        <Text style={styles.locationText}>{profile.location?.city || 'City'}, {profile.location?.country || 'Country'}</Text>
                    </View>
                </View>

                {/* The "Listings" title remains part of the fixed header area */}
                <Text style={styles.adsTitle}>Listings</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.adCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ItemDetails', { item: item })}
        >
            <View style={styles.adImageContainer}>
                <Image
                    source={{
                        uri: item.images?.[0]?.startsWith('http')
                            ? item.images[0]
                            : `${BASE_URL.replace(/\/$/, '')}${item.images?.[0]}`
                    }}
                    style={styles.adImage}
                />
            </View>
            <View style={styles.adInfo}>
                <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.adPrice}>₹{item.price}</Text>
                <View style={styles.adMetaRow}>
                    <Icon name="location-outline" size={12} color="#888" />
                    <Text style={styles.adMeta} numberOfLines={1}>{item.location}</Text>
                </View>
            </View>
             {/* Stats Overlay */}
             <View style={styles.adStatsOverlay}>
                <View style={styles.adStatPill}>
                    <Icon name="eye-outline" size={10} color="#fff" />
                    <Text style={styles.adStatsText}>{item.views}</Text>
                </View>
                <View style={styles.adStatPill}>
                    <Icon name="heart-outline" size={10} color="#fff" />
                    <Text style={styles.adStatsText}>{item.likes}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            {/* The header content is now a fixed component */}
            {renderHeaderContent()}

            {/* The Listings section is now a separate, scrollable FlatList */}
            <FlatList
                data={profile?.ads || []}
                keyExtractor={ad => String(ad.id)}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapperStyle}
                contentContainerStyle={styles.listingsContentContainer}
                style={styles.listingsFlatList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading && <Text style={styles.emptyListText}>No listings found.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    // The main FlatList styles are now for the Listings section
    listingsFlatList: {
        flex: 1, // Important: Allows the FlatList to take the remaining height
        marginHorizontal: 15, // Apply padding to the FlatList itself for a consistent look
    },
    listingsContentContainer: {
        paddingBottom: 30,
        // Remove horizontal padding from here as it's applied to the FlatList style
    },
    columnWrapperStyle: {
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 0, // Resetting padding from the old style
    },
    loadingIndicator: {
        marginTop: 40,
    },
    notFoundText: {
        margin: 40,
        fontSize: 18,
        textAlign: 'center',
        color: '#333',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },

    // --- Header Styles (mostly remain the same) ---
    headerContainer: {
        backgroundColor: '#f5f5f5',
        // Ensure no flex property is here, let its content determine its height
    },
    gradientTopBar: {
        height: 120, // Background color for the top half
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 15,
        paddingTop: 50,
        position: 'relative',
        zIndex: 1,
        // The original header had negative margins, we adjust to compensate
        marginHorizontal: -15, 
    },
    backIconBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 40,
        left: 25,
    },

    // --- Card Stack Styles ---
    profileCardStack: {
        marginTop: 10, // Adjust margin to pull up over the gradient more aggressively
        marginHorizontal: 15,
        zIndex: 2,
    },
    
    // User Info Card (Front/Top Card)
    userInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 85, // Space for the floating avatar
        paddingBottom: 20,
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#00796b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0f2f1',
    },
    avatarContainer: {
        position: 'absolute',
        top: -65, // Floats the avatar above the card
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 4,
        borderColor: '#fff',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    avatarBig: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
    },
    verifiedBadgeBig: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
    },
    sellerName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    sellerBio: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    
    // Action Row
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-evenly',
        marginTop: 5,
    },
    followBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f2f1',
        borderRadius: 22,
        paddingHorizontal: 25,
        paddingVertical: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#00796b',
    },
    followingBtn: {
        backgroundColor: '#00796b',
        borderColor: '#00796b',
    },
    followBtnText: {
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
        color: '#00796b',
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9800', // Secondary accent color
        borderRadius: 22,
        paddingHorizontal: 25,
        paddingVertical: 10,
        elevation: 2,
    },
    contactBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
    },

    // Stats Card (Middle Card)
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fcfcfc',
        borderRadius: 16,
        paddingVertical: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        marginTop: 5,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    statCount: {
        fontSize: 18,
        fontWeight: '900',
        color: '#00796b',
    },
    statLabel: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
        fontWeight: '600',
    },
    statSeparator: {
        width: 1,
        backgroundColor: '#e0e0e0',
        height: '100%',
    },

    // Location Info (Bottom Section)
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    locationText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 5,
    },

    // --- Ads Grid Styles ---
    adsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 15,
        color: '#1a1a1a',
        marginLeft: 15, // Aligned with the screen padding
    },
    // The rest of the adCard styles are the same, just the wrapper/container styles are updated
    adCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#00796b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        width: CARD_WIDTH,
        overflow: 'hidden',
        position: 'relative',
    },
    adImageContainer: {
        width: '100%',
        height: CARD_WIDTH * 0.9, // Square aspect for the image area
        backgroundColor: '#eee',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    adImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    adInfo: {
        padding: 10,
    },
    adTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    adPrice: {
        fontSize: 16,
        color: '#00796b',
        fontWeight: '900',
        marginBottom: 4,
    },
    adMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adMeta: {
        fontSize: 11,
        color: '#888',
        marginLeft: 3,
        fontWeight: '500',
    },
    
    // Ads Stats Overlay
    adStatsOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
    },
    adStatPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginLeft: 4,
    },
    adStatsText: {
        color: '#fff',
        fontSize: 10,
        marginLeft: 3,
        fontWeight: 'bold',
    },
});