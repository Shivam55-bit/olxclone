import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWishlist } from '../WishlistContext'; // Adjust path as needed

// 🔑 CRITICAL FIX: Import BASE_URL from the central API file 
import { BASE_URL } from '../apis/api'; 

// Helper function for safe ID extraction
const getItemId = (item) => item._id || item.id || item.product_id;

// 🚀 ROBUST IMAGE HELPER
const getWishlistItemImage = (item) => {
    // 1. Check for normalized 'images' array (from Home screen normalization)
    if (Array.isArray(item.images) && item.images.length > 0) {
        return item.images[0];
    }
    // 2. Check for original 'image' field (from API/Context fetch)
    if (typeof item.image === 'string') {
        return item.image;
    }
    // 3. Fallback (no path found)
    return null;
};

const Wishlist = ({ navigation }) => {
    const {
        wishlist,
        isLoading,
        removeFromWishlist,
    } = useWishlist();

    const fadeAnims = useRef({}).current;
    const [imageErrors, setImageErrors] = useState({});

    // Utility to ensure we have an Animated.Value for every item
    const getFadeAnim = (id) => {
        if (!fadeAnims[id]) {
            fadeAnims[id] = new Animated.Value(1);
        }
        return fadeAnims[id];
    };

    // Callback to handle removal with animation
    const removeItem = useCallback(async (item) => {
        const id = getItemId(item);

        const anim = getFadeAnim(id);
        
        // 1. Start fade-out animation
        Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(async () => {
            // 2. Call API/Context to remove item
            const success = await removeFromWishlist(id);
            
            if (success) {
                // If API/context succeeds, clean up the animation ref
                delete fadeAnims[id];
                console.log(`Item ${id} removed successfully via context.`);
            } else {
                // If API failed, revert animation to make the item visible again
                Animated.timing(anim, { toValue: 1, duration: 0, useNativeDriver: true }).start();
                console.error(`Failed to remove item ${id}. Resetting animation.`);
            }
        });
    }, [removeFromWishlist, fadeAnims]);

    // ✅ Render each card item
    const renderItem = ({ item }) => {
        const id = getItemId(item);
        const fadeAnim = getFadeAnim(id);

        // --- IMAGE PATH FIX ---
        const relativePath = getWishlistItemImage(item); 
        
        const isValidBaseUrl = typeof BASE_URL === 'string' && BASE_URL.startsWith('http');
        const cleanedBaseUrl = isValidBaseUrl ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';
        
        let absoluteImageUri = null;

        if (typeof relativePath === 'string') {
            if (relativePath.startsWith('http')) {
                // Already absolute
                absoluteImageUri = relativePath; 
            } else if (cleanedBaseUrl.length > 0) {
                // 🚀 Construct the full URL correctly (e.g., https://api.com + /path/to/img.jpg)
                const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
                absoluteImageUri = `${cleanedBaseUrl}${path}`;
            }
        }
        
        // Final image source selection
        const imageUri = imageErrors[id] || !absoluteImageUri 
            ? 'https://placehold.co/400x400?text=No+Image' // Fallback URL
            : absoluteImageUri; 

        // --- IMAGE PATH FIX END ---

        // Ensure properties are safe strings for rendering
        const title = typeof item.title === 'string' ? item.title : '';
        const details = item.details || item.description;
        const detailsString = typeof details === 'string' ? details.trim() : '';
        const priceValue = item.price != null && !isNaN(parseFloat(item.price)) ? parseFloat(item.price).toFixed(2) : '0.00';
        const priceString = String(priceValue);

        return (
            <Animated.View
                key={id.toString()}
                style={[
                    styles.cardWrapper,
                    {
                        opacity: fadeAnim,
                        // Scale down animation based on fade
                        transform: [{ scale: Animated.add(0.05, Animated.multiply(fadeAnim, 0.95)) }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ItemDetails', { item })}
                >
                    {/* Floating Remove Button */}
                    <TouchableOpacity 
                        style={styles.removeIcon} 
                        onPress={() => removeItem(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }} // Using the now absolute 'imageUri'
                            style={styles.cardImage}
                            onError={(e) => {
                                console.warn(`⚠️ Image load FAILED for: ${title} (${imageUri})`, e.nativeEvent.error);
                                // Set an error state to permanently show fallback image for this item
                                setImageErrors((prev) => ({ ...prev, [id]: true }));
                            }}
                        />
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {title || 'Unknown Product'}
                        </Text>

                        {detailsString.length > 0 ? (
                            <Text style={styles.cardDetails} numberOfLines={2}>
                                {detailsString}
                            </Text>
                        ) : null}

                        {/* Price Badge */}
                        <View style={styles.priceTag}>
                            <Text style={styles.cardPrice}>₹ {priceString}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Main render
    return (
        <View style={styles.container}>
            {/* Conditional Rendering for Loading/Empty State */}
            {isLoading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#ff6b81" />
                    <Text style={styles.emptyText}>Loading Wishlist...</Text>
                </View>
            ) : wishlist.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-dislike" size={80} color="#ff6b81" />
                    <Text style={styles.emptyText}>Your wishlist is empty</Text>
                    <Text style={styles.emptySubText}>Save items to view them later ❤️</Text>
                    <TouchableOpacity
                        style={styles.shopNowBtn}
                        // Assuming 'HomeScreen' is the correct target for the main tab
                        onPress={() => navigation.navigate('Home')} 
                    >
                        <Text style={styles.shopNowText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlist}
                    keyExtractor={(item) => getItemId(item).toString()}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

export default Wishlist;

// ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', padding: 8 },
    listContainer: { paddingBottom: 20 },
    cardWrapper: { flex: 0.5, padding: 6 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    removeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        backgroundColor: 'rgba(255,107,129,0.85)',
        padding: 6,
        borderRadius: 20,
    },

    imageContainer: {
        width: '100%',
        height: 160,
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fafafa',
    },

    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    infoContainer: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
    cardDetails: { fontSize: 12, color: '#666', marginTop: 4 },

    priceTag: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#ff6b81',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    cardPrice: { fontSize: 14, fontWeight: '800', color: '#fff' },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        minHeight: 300,
    },
    emptyText: { fontSize: 22, fontWeight: '800', color: '#333', marginTop: 20 },
    emptySubText: { fontSize: 16, color: '#666', marginTop: 8, textAlign: 'center' },

    shopNowBtn: {
        marginTop: 30,
        backgroundColor: '#ff6b81',
        paddingHorizontal: 35,
        paddingVertical: 12,
        borderRadius: 30,
        elevation: 4,
    },
    shopNowText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
