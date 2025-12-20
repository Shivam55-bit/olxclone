// src/tabs/Home.js - UPDATED to show "Fresh recommendations" ONLY in Top Picks section

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Keyboard, 
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal, 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { useWishlist } from '../WishlistContext';
// ⚠️ Dhyan Dein: Yeh APIs sirf example ke liye hain, asali mein aapko inhe apne backend se badalna hoga.
import { getTopPicks, getNearbyItems, getFollowingItems } from '../apis/homeApi'; 
import { BASE_URL } from '../apis/api'; 

const { width } = Dimensions.get('window');

const getItemId = (item) => item.id || item._id || item.product_id;

// -----------------------------------------------------------------------------
// 🔑 MOCK GEO-CODING DATA
// -----------------------------------------------------------------------------

const mockLocations = [
    { id: '2', name: 'New Delhi, NCR', value: 'New Delhi', lat: 28.6448, lon: 77.2167 },
    { id: '3', name: 'Mumbai, Maharashtra', value: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { id: '4', name: 'Bengaluru, Karnataka', value: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { id: '5', name: 'Chennai, Tamil Nadu', value: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { id: '6', name: 'Kolkata, West Bengal', value: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { id: '7', name: 'Hyderabad, Telangana', value: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { id: '8', name: 'Pune, Maharashtra', value: 'Pune', lat: 18.5204, lon: 73.8567 },
    { id: '9', name: 'Current Location (GPS)', value: 'Current Location (GPS)', lat: 28.5355, lon: 77.3910 }, 
];

// 🔹 Local Data 
const categories = [
    { id: '1', label: 'Cars', icon: require('../images/car.png') },
    { id: '2', label: 'Properties', icon: require('../images/briefcase.png') },
    { id: '3', label: 'Mobiles', icon: require('../images/phone.png') },
    { id: '5', label: 'Fashion', icon: require('../images/shoes.png') },
    { id: '6', label: 'Bikes', icon: require('../images/bikes.png') },
    { id: '7', 'label': 'Electronics', icon: require('../images/fridge.png') },
];

const banners = [
    { id: '1', image: require('../images/banner1.png') },
    { id: '2', image: require('../images/banner2.png') },
    { id: '3', image: require('../images/banner5.png') },
    { id: '4', image: require('../images/banner4.png') },
];

// -----------------------------------------------------------------------------
// ## Location Selector Modal (Unchanged)
// -----------------------------------------------------------------------------

function LocationSelectorModal({ visible, onClose, onSelect }) {
    const [searchText, setSearchText] = useState('');
    const [filteredLocations, setFilteredLocations] = useState(mockLocations);

    useEffect(() => {
        if (visible) {
            setSearchText('');
            setFilteredLocations(mockLocations);
        }
    }, [visible]);

    useEffect(() => {
        const query = searchText.toLowerCase().trim();
        if (query.length === 0) {
            setFilteredLocations(mockLocations);
        } else {
            const results = mockLocations.filter(loc =>
                loc.name.toLowerCase().includes(query) || loc.value.toLowerCase().includes(query)
            );
            setFilteredLocations(results);
        }
    }, [searchText]);

    const handleSelectLocation = (location) => {
        Keyboard.dismiss();
        onSelect(location);
    };

    const handleUseCurrentLocation = () => {
        Keyboard.dismiss();
        const currentLocation = mockLocations.find(loc => loc.id === '9');
        onSelect(currentLocation); 
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    
                    <Text style={modalStyles.modalTitle}>Choose Location</Text>

                    {/* Search Bar */}
                    <View style={modalStyles.searchContainer}>
                        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
                        <TextInput
                            style={modalStyles.searchInput}
                            placeholder="Search city, area or landmark..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                            returnKeyType="search"
                            autoFocus={true}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Current Location Button */}
                    <TouchableOpacity 
                        style={modalStyles.currentLocationButton}
                        onPress={handleUseCurrentLocation}
                    >
                        <Ionicons name="locate-sharp" size={24} color="#fff" />
                        <Text style={modalStyles.currentLocationText}>
                            Use Current Location (GPS)
                        </Text>
                        <MIcon name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={modalStyles.popularTitle}>Popular Locations</Text>
                    
                    {/* Location List */}
                    <FlatList
                        data={filteredLocations}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={modalStyles.listContainer}
                        ListEmptyComponent={() => (
                             <Text style={modalStyles.emptyText}>No locations match your search.</Text>
                        )}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={modalStyles.locationItem}
                                onPress={() => handleSelectLocation(item)} 
                            >
                                <Ionicons name="map-outline" size={20} color="#555" />
                                <Text style={modalStyles.locationItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                        <Text style={modalStyles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// -----------------------------------------------------------------------------
// ## Utility Components (Unchanged)
// -----------------------------------------------------------------------------

function SimpleLoader() {
    return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loaderText}>Loading items...</Text>
        </View>
    );
}

function BannerSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const indexRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const startAutoSlide = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                let nextIndex = (indexRef.current + 1) % banners.length;
                scrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                indexRef.current = nextIndex;
                setActiveIndex(nextIndex);
            }, 4000);
        };

        const stopAutoSlide = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        startAutoSlide();
        return stopAutoSlide;
    }, []);

    return (
        <View style={styles.bannerContainer}>
            <FlatList
                ref={scrollRef}
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Image source={item.image} style={[styles.bannerImage, { width: width - 30 }]} />
                )}
                onMomentumScrollEnd={(event) => {
                    const slide = Math.round(event.nativeEvent.contentOffset.x / (width - 30));
                    indexRef.current = slide;
                    setActiveIndex(slide);
                }}
                onScrollBeginDrag={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
                onScrollEndDrag={() => {
                     if (!intervalRef.current) {
                         const startAutoSlide = () => {
                             intervalRef.current = setInterval(() => {
                                 let nextIndex = (indexRef.current + 1) % banners.length;
                                 scrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                                 indexRef.current = nextIndex;
                                 setActiveIndex(nextIndex);
                             }, 4000);
                         };
                         startAutoSlide();
                     }
                }}
            />
            <View style={styles.dotsContainer}>
                {banners.map((_, index) => (
                    <View key={index} style={[styles.dot, { backgroundColor: index === activeIndex ? '#2e7d32' : '#ccc' }]} />
                ))}
            </View>
        </View>
    );
}


// -----------------------------------------------------------------------------
// ## Main Home Component (UPDATED)
// -----------------------------------------------------------------------------

export default function Home() {
    const navigation = useNavigation();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedItems, setDisplayedItems] = useState([]);
    
    const [activeFilter, setActiveFilter] = useState("Top Picks"); 
    
    const defaultLocation = mockLocations.find(loc => loc.value === 'New Delhi');
    const [selectedLocation, setSelectedLocation] = useState(defaultLocation.name);
    const [coords, setCoords] = useState({ lat: defaultLocation.lat, lon: defaultLocation.lon });

    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const originalItemsRef = useRef([]);

    const handleLocationSelect = useCallback((locationObject) => {
        setSelectedLocation(locationObject.name);
        setCoords({ lat: locationObject.lat, lon: locationObject.lon });
        setIsLocationModalVisible(false);
        
        setActiveFilter("Nearby");
        fetchItems("Nearby", { lat: locationObject.lat, lon: locationObject.lon }); 
    }, []); 
    
    const fetchItems = useCallback(async (filter, currentCoords = coords) => {
        setIsFetching(true);
        setSearchQuery(''); 

        let apiData = {};
        try {
            if (filter === "Top Picks") {
                apiData = await getTopPicks(selectedLocation); 
            } else if (filter === "Nearby") {
                // Assuming getNearbyItems uses lat/lon
                apiData = await getNearbyItems(currentCoords.lat, currentCoords.lon); 
            } else if (filter === "Following") {
                apiData = await getFollowingItems(selectedLocation);
            }

            const rawData = apiData?.data?.ads ||
                apiData?.ads ||
                (Array.isArray(apiData?.data) ? apiData.data : []);

            const safeData = Array.isArray(rawData)
                ? rawData
                    .filter(item => item && (item.id || item._id || item.product_id))
                    .map(item => ({
                        ...item,
                        id: getItemId(item),
                        location: String(item.formatted_address || item.location_text || item.location || "Unknown"),
                        price: item.price != null && !isNaN(parseFloat(item.price)) ? parseFloat(item.price).toFixed(2) : '0.00',
                        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
                    }))
                : [];

            originalItemsRef.current = safeData;
            setDisplayedItems(safeData);
        } catch (error) {
            console.error(`Error fetching ${filter} items:`, error.message);
            originalItemsRef.current = [];
            setDisplayedItems([]);
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    }, [coords, selectedLocation]); 

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            if (isActive) {
                // Fetch items only if not loading already
                if (loading) {
                    fetchItems(activeFilter, coords);
                }
            }
            return () => {
                isActive = false;
            };
        }, [fetchItems, activeFilter, coords, loading])
    );


    const applyFilter = async (filter) => {
        if (isFetching || filter === activeFilter) return;

        setActiveFilter(filter);
        setDisplayedItems([]); 
        
        if (filter === "Nearby") {
             await fetchItems(filter, coords);
        } else {
             await fetchItems(filter);
        }
    };

    const handleLiveSearch = (text) => {
        setSearchQuery(text);
        const query = text.trim().toLowerCase();

        if (!query) {
            setDisplayedItems(originalItemsRef.current);
            return;
        }

        const results = originalItemsRef.current.filter((item) =>
            item.title?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.location?.toLowerCase().includes(query)
        );
        setDisplayedItems(results);
    };
    
    const clearSearch = () => {
        setSearchQuery('');
        setDisplayedItems(originalItemsRef.current);
        Keyboard.dismiss();
    }


    const renderListEmptyComponent = () => {
        if (isFetching) {
            return (
                <View style={styles.fetchingIndicator}>
                    <ActivityIndicator size="small" color="#2e7d32" />
                    <Text style={styles.fetchingText}>Loading {activeFilter}...</Text>
                </View>
            );
        }

        const isSearchEmpty = searchQuery.trim().length > 0;
        const emptyMessage = isSearchEmpty
            ? `No results found for "${searchQuery.trim()}".`
            : `No items found for "${activeFilter}" in ${selectedLocation}. Try changing your filter or location.`;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>
                    {emptyMessage}
                </Text>
            </View>
        );
    };

    if (loading) {
        return <SimpleLoader />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 🔹 Fixed Header */}
            <LinearGradient colors={['#2e7d32', '#1b5e20']} style={styles.header}>
                <Text style={styles.headerTitle}>Bhoomi24</Text>
                <TouchableOpacity 
                    style={styles.locationContainer} 
                    onPress={() => setIsLocationModalVisible(true)}
                >
                    <Ionicons name="location-sharp" size={18} color="#fff" />
                    <Text style={styles.locationText} numberOfLines={1}>{selectedLocation}</Text>
                    <MIcon name="keyboard-arrow-down" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* 🔹 Fixed Search Bar + Icons */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#2e7d32" style={{ marginRight: 6 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Cars, Phones and more..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={handleLiveSearch} 
                        returnKeyType="search"
                    />
                    {searchQuery.trim().length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color="#888" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
                    <Ionicons name="heart-outline" size={22} color="#2e7d32" />
                    {wishlist.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{wishlist.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={22} color="#2e7d32" />
                </TouchableOpacity>
            </View>

            {/* 🔹 Scrollable List */}
            <FlatList
                data={displayedItems}
                keyExtractor={(item, index) => (getItemId(item) ? getItemId(item).toString() : `item-${index}`)}
                numColumns={2}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={renderListEmptyComponent}
                ListFooterComponent={<View style={{ height: 20 }} />}
                contentContainerStyle={styles.flatListContent}
                ListHeaderComponent={
                    <View key="home-header">
                        <BannerSlider />
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Browse by Categories</Text>
                            <FlatList
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.categoryItem}
                                        onPress={() => navigation.navigate('Search', { category: item.label })}
                                    >
                                        <View style={styles.categoryIconWrapper}>
                                            <Image source={item.icon} style={styles.categoryImage} />
                                        </View>
                                        <Text style={styles.categoryText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* 🔹 Filter Bar */}
                        <View style={styles.filterBarContainer}>
                            <View style={styles.filterWrapper}>
                                {["Top Picks", "Nearby", "Following"].map((filter) => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={styles.filterTab}
                                        onPress={() => applyFilter(filter)}
                                        disabled={isFetching}
                                    >
                                        <Text style={[styles.filterLabel, activeFilter === filter && styles.filterLabelActive]}>
                                            {filter}
                                        </Text>
                                        {activeFilter === filter && <View style={styles.activeIndicator} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.sectionTitleWrapper}>
                            {/* 🔑 UPDATED: Show location name for Nearby section */}
                            {activeFilter === "Nearby" && (
                                <Text style={styles.nearbyLocationTitle}>
                                     <Text style={styles.nearbyTitle}>{selectedLocation}</Text>
                                </Text>
                            )}
                            {activeFilter === "Following" && (
                               
                                     <Text style={styles.followingTitle}>✨Following</Text>
                               
                            )}

                            
                            {/* 🔑 UPDATED: Show "Fresh recommendations" ONLY for Top Picks */}
                            {activeFilter === "Top Picks" && displayedItems.length > 0 && (
                                <Text style={styles.sectionTitle}>✨ Fresh recommendations</Text>
                            )}
                        </View>
                    </View>
                }

                renderItem={({ item }) => {
                    // --- Image Logic ---
                    const FALLBACK_PATH = 'placeholder.png';
                    const imagePath =
                        (item.images && item.images.length > 0) ? item.images[0] : (item.image || FALLBACK_PATH);

                    const isValidBaseUrl = typeof BASE_URL === 'string' && BASE_URL.startsWith('http');
                    const cleanedBaseUrl = isValidBaseUrl ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';

                    let fullImageUri = '';

                    if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
                        fullImageUri = imagePath;
                    } else if (typeof imagePath === 'string' && imagePath !== FALLBACK_PATH && cleanedBaseUrl.length > 0) {
                        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
                        fullImageUri = `${cleanedBaseUrl}${path}`;
                    }

                    const imageSource = fullImageUri
                        ? { uri: fullImageUri }
                        : require('../images/user_placeholder.png');

                    const isFavourited = isInWishlist(item);

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('ItemDetails', { item: item })} 
                        >
                            {/* Heart Icon (Wishlist Toggle) */}
                            <TouchableOpacity
                                style={styles.likeIcon}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(item);
                                }}
                            >
                                <View style={styles.likeIconBackground}>
                                    <Ionicons
                                        name={isFavourited ? 'heart' : 'heart-outline'}
                                        size={22}
                                        color={isFavourited ? 'red' : '#2e7d32'}
                                    />
                                </View>
                            </TouchableOpacity>

                            <Image
                                source={imageSource}
                                style={styles.cardImage}
                                defaultSource={require('../images/user_placeholder.png')}
                                onError={(e) => {
                                    if (fullImageUri) {
                                        console.error('Image load FAILED for:', item.title, 'URI:', fullImageUri, 'Error:', e.nativeEvent.error);
                                    }
                                }}
                            />
                            <Text style={styles.cardPrice}>₹ {item.price}</Text>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            {item.description ? <Text style={styles.cardDetails} numberOfLines={1}>{item.description}</Text> : null}
                            <View style={styles.cardFooter}>
                                <Ionicons name="location-outline" size={14} color="#999" />
                                <Text style={styles.cardLocation} numberOfLines={1}>
                                    {item.location || "Unknown"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
            
            {/* Advanced Location Selector Modal */}
            <LocationSelectorModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                onSelect={handleLocationSelect}
            />
        </SafeAreaView >
    );
}

// -----------------------------------------------------------------------------
// ## Styles (Unchanged, but complete)
// -----------------------------------------------------------------------------

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    },
    modalView: {
        width: '100%',
        height: '90%', 
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        marginBottom: 15,
        fontSize: 20,
        fontWeight: '700',
        color: '#2e7d32',
    },
    
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        color: '#333',
        fontSize: 16,
        paddingVertical: 0,
    },
    
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#2e7d32',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    currentLocationText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginLeft: 15,
    },

    popularTitle: {
        width: '100%',
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 10,
        paddingVertical: 5,
    },
    listContainer: {
        width: '100%',
        flex: 1, 
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    locationItemText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 15,
        color: '#999',
    },
    
    closeButton: {
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    closeButtonText: {
        color: '#333',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    flatListContent: { paddingBottom: 20 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderText: { color: '#2e7d32', fontSize: 16, marginTop: 10, fontWeight: '600' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: Dimensions.get('window').height * 0.4,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        marginTop: 10,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },

    header: {
        paddingHorizontal: 15,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#C8E6C9' },
    locationContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        maxWidth: width * 0.5, 
    },
    locationText: { 
        color: '#fff', 
        marginLeft: 6, 
        fontWeight: '600',
        overflow: 'hidden',
        marginRight: 4,
    },

    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 25,
        paddingHorizontal: 15, height: 45,
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41,
    },
    searchInput: { flex: 1, color: '#000', fontSize: 14, paddingVertical: 0 },
    iconButton: { paddingHorizontal: 10 },
    badge: { position: 'absolute', top: -4, right: 4, backgroundColor: 'red', borderRadius: 10, paddingHorizontal: 5, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    bannerContainer: { marginTop: 10, marginBottom: 10 },
    bannerImage: { height: 180, borderRadius: 12, marginHorizontal: 15 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },

    filterBarContainer: { borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginTop: 10 },
    filterWrapper: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff' },
    filterTab: { flex: 1, alignItems: "center", paddingVertical: 6, position: "relative" },
    filterLabel: { fontSize: 15, fontWeight: "600", color: "#666" },
    filterLabelActive: { color: "#2e7d32" },
    activeIndicator: { position: "absolute", bottom: -10, height: 3, width: "60%", borderRadius: 2, backgroundColor: "#2e7d32" },

    fetchingIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 10,
    },
    fetchingText: { marginLeft: 10, color: '#2e7d32', fontWeight: '500' },

    sectionTitleWrapper: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5 },
    
    // 🔑 NEW STYLE: Location text for Nearby section (Simplified from previous version)
    nearbyLocationTitle: { 
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        marginBottom: 5,
    },
    
    section: { paddingHorizontal: 15, paddingVertical: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2e7d32', marginBottom: 8 },
    nearbyTitle: { fontSize: 18, fontWeight: '700', color: '#2e7d32', marginBottom: 8 },
    followingTitle: { fontSize: 18, fontWeight: '700', color: '#2e7d32', marginBottom: 8 },

    categoryItem: { alignItems: 'center', marginRight: 15, width: 70 },
    categoryIconWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, },
    categoryImage: { width: 32, height: 32, resizeMode: 'contain' },
    categoryText: { marginTop: 6, fontSize: 13, color: '#333', fontWeight: '600', textAlign: 'center' },

    card: { flex: 1, backgroundColor: '#fff', margin: 7, borderRadius: 12, padding: 10, position: 'relative', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, },
    cardImage: { width: '100%', height: 130, borderRadius: 10, resizeMode: 'cover' },
    cardPrice: { fontSize: 16, fontWeight: '700', color: '#2e7d32', marginTop: 6 },
    cardTitle: { fontWeight: '600', fontSize: 13, color: '#333', marginTop: 2 },
    cardDetails: { fontSize: 12, color: '#888', marginTop: 0 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    cardLocation: { fontSize: 11, color: '#999', marginLeft: 4, flex: 1 },

    likeIcon: { position: 'absolute', top: 18, right: 18, zIndex: 10 },
    likeIconBackground: {
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 20,
        padding: 5,
    }
});