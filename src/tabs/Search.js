import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    TextInput,
    StatusBar,
    Platform,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
// import Slider from '@react-native-community/slider'; // Uncomment if you add the slider back to the modal

const { width } = Dimensions.get('window');

// Base URL extracted from your API request details
const BASE_IMAGE_URL = 'https://bhoomi.dinahub.live';
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/400x300.png?text=No+Image';

// --- MOCK/CONTEXT HOOKS ---
const useWishlist = () => {
    // Mock logic to prevent errors if the actual context isn't used
    const [wishlist, setWishlist] = useState([]);
    const toggleWishlist = useCallback((item) => {
        setWishlist(prev => prev.some(w => w.id === item.id) ? prev.filter(w => w.id !== item.id) : [...prev, item]);
    }, []);
    return {
        wishlist,
        toggleWishlist,
        isInWishlist: (item) => wishlist.some(w => w.id === item.id)
    };
};

const cleanPrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;

    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
};

// ====================================================================
// FILTER MODAL COMPONENT
// ====================================================================

const FilterModal = ({ isVisible, onClose, filters, onApply }) => {
    // Use Infinity for maxPrice internally for correct filtering logic, but convert it for display
    const initialMaxPriceDisplay = filters.maxPrice === Infinity ? '' : filters.maxPrice.toString();
    const [tempFilters, setTempFilters] = useState({
        ...filters,
        maxPrice: initialMaxPriceDisplay, // Store as string for input
    });

    // Set tempFilters whenever the modal opens or parent filters change
    useEffect(() => {
        if (isVisible) {
            setTempFilters({
                ...filters,
                maxPrice: filters.maxPrice === Infinity ? '' : filters.maxPrice.toString(),
            });
        }
    }, [filters, isVisible]);

    const handleApply = () => {
        onApply({
            minPrice: cleanPrice(tempFilters.minPrice),
            // Convert empty string or 0 back to Infinity for maxPrice, otherwise clean the number
            maxPrice: tempFilters.maxPrice === '' || cleanPrice(tempFilters.maxPrice) === 0 ? Infinity : cleanPrice(tempFilters.maxPrice),
            sortBy: tempFilters.sortBy,
        });
        onClose();
    };

    const handleReset = () => {
        setTempFilters({
            minPrice: 0,
            maxPrice: '',
            sortBy: 'default',
        });
    };

    // Helper for Radio Buttons
    const SortOption = ({ value, label }) => (
        <TouchableOpacity
            style={styles.sortOption}
            onPress={() => setTempFilters(prev => ({ ...prev, sortBy: value }))}
        >
            <MIcon
                name={tempFilters.sortBy === value ? "radiobox-marked" : "radiobox-blank"}
                size={20}
                color={tempFilters.sortBy === value ? "#2e7d32" : "#999"}
                style={{ marginRight: 8 }}
            />
            <Text style={styles.sortLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const displayMinPrice = tempFilters.minPrice > 0 ? tempFilters.minPrice.toLocaleString('en-IN') : '0';
    const displayMaxPrice = tempFilters.maxPrice === '' ? 'No Limit' : `₹${cleanPrice(tempFilters.maxPrice).toLocaleString('en-IN')}`;


    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.modal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            avoidKeyboard
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Filter & Sort</Text>

                {/* --- 1. SORTING --- */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Sort By</Text>
                    <SortOption value="default" label="Default (Newest)" />
                    <SortOption value="price_asc" label="Price: Low to High" />
                    <SortOption value="price_desc" label="Price: High to Low" />
                </View>

                {/* --- 2. PRICE RANGE --- */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Price Range</Text>

                    <View style={styles.priceInputs}>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="Min Price (₹)"
                            keyboardType="numeric"
                            value={tempFilters.minPrice > 0 ? tempFilters.minPrice.toString() : ''}
                            onChangeText={(text) => setTempFilters(prev => ({ ...prev, minPrice: cleanPrice(text) }))}
                            maxLength={10}
                        />
                        <Text style={{ fontSize: 16, color: '#666' }}>-</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="Max Price (₹)"
                            keyboardType="numeric"
                            value={tempFilters.maxPrice}
                            onChangeText={(text) => setTempFilters(prev => ({ ...prev, maxPrice: text.replace(/[^0-9]/g, '') }))}
                            maxLength={10}
                        />
                    </View>

                    <Text style={styles.priceValueText}>
                        Min: ₹{displayMinPrice} | Max: {displayMaxPrice}
                    </Text>
                </View>

                {/* --- 3. ACTIONS --- */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
};


// ====================================================================
// CATEGORY ITEMS SCREEN (MAIN COMPONENT)
// ====================================================================

export default function Search() {
    const route = useRoute();
    const navigation = useNavigation();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [items, setItems] = useState([]); // Raw fetched data
    const [displayedItems, setDisplayedItems] = useState([]); // Filtered/Searched data

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false); // Filter Modal visibility

    const [activeFilters, setActiveFilters] = useState({
        minPrice: 0,
        maxPrice: Infinity,
        sortBy: 'default', // 'default', 'price_asc', 'price_desc'
    });

    // Get category from route params
    const category = route.params?.category || 'Cars';

    // Function to handle filter application from modal
    const applyFilters = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    const isFilterActive = activeFilters.sortBy !== 'default' || activeFilters.minPrice > 0 || activeFilters.maxPrice !== Infinity;

    // --- 1. API FETCH EFFECT ---
    useEffect(() => {
        const fetchCategoryItems = async () => {
            setIsLoading(true);
            setHasError(false);
            setItems([]); // Clear old items

            // API URL construction confirmed: /ads/by-parent/{category}?page=1&size=20
            const API_ENDPOINT = `${BASE_IMAGE_URL}/ads/by-parent/${category}?page=1&size=20`;

            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'GET',
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch items. Status: ${response.status}`);
                }

                const data = await response.json();
                
                const fetchedItems = Array.isArray(data) ? data : data.items || data.ads || [];

                const validItems = fetchedItems.filter(item => item && item.id && item.title);

                setItems(validItems); // Setting items state here is safe

            } catch (e) {
                console.error("Fetch Error for Search:", e);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryItems();

        // Reset filtering states when the category changes
        setSearchQuery('');
        setActiveFilters({ minPrice: 0, maxPrice: Infinity, sortBy: 'default' });

    }, [category]); 

    // --- 2. FILTERING & SORTING EFFECT ---
    useEffect(() => {
        let results = [...items];
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        const { minPrice, maxPrice, sortBy } = activeFilters;

        // 1. Apply Search Filter
        if (lowerCaseQuery) {
            results = results.filter(item =>
                item.title?.toLowerCase().includes(lowerCaseQuery) ||
                item.description?.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // 2. Apply Price Range Filter
        results = results.filter(item => {
            const priceValue = cleanPrice(item.price);
            return priceValue >= minPrice && priceValue <= maxPrice;
        });

        // 3. Apply Sorting
        if (sortBy !== 'default') {
            results.sort((a, b) => {
                if (sortBy.startsWith('price')) {
                    const priceA = cleanPrice(a.price);
                    const priceB = cleanPrice(b.price);
                    return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
                }
                return 0;
            });
        }

        setDisplayedItems(results); 

    }, [items, searchQuery, activeFilters]); 

    // --- Render Item (Card) ---
    const renderItem = ({ item }) => {
        const imagePath = item.images?.[0];
        let fullImageUrl = PLACEHOLDER_IMAGE_URL;

        if (imagePath) {
            if (imagePath.startsWith('http')) {
                fullImageUrl = imagePath;
            } else {
                const cleanedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
                fullImageUrl = `${BASE_IMAGE_URL}${cleanedPath}`;
            }
        }

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ItemDetails', { item })}
            >
                <TouchableOpacity
                    style={styles.likeIcon}
                    onPress={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                    }}
                >
                    <View style={styles.likeIconWrapper}>
                        <Icon
                            name={isInWishlist(item) ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isInWishlist(item) ? '#e53935' : '#757575'}
                        />
                    </View>
                </TouchableOpacity>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: fullImageUrl }}
                        style={styles.cardImage}
                    />
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.cardPrice}>
                        ₹ {typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : (cleanPrice(item.price).toLocaleString('en-IN') || 'Ask for Price')}
                    </Text>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled Ad'}</Text>
                    {item.description ? <Text style={styles.cardDetails} numberOfLines={2}>{item.description}</Text> : null}
                </View>
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />

            {/* Top Search/Header Area */}
            <View style={styles.topContainer}>
                <LinearGradient colors={['#2e7d32', '#1b5e20']} style={styles.gradientHeader}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Icon name="arrow-back" size={26} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitleCustom} numberOfLines={1}>
                            {category} Listings
                        </Text>

                        <View style={{ width: 36 }} />
                    </View>
                </LinearGradient>

                <View style={styles.searchBoxWrapper}>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <Icon name="search" size={18} color="#777" style={{ marginRight: 8 }} />
                            <TextInput
                                placeholder={`Search within ${category}...`}
                                placeholderTextColor="#aaa"
                                style={styles.input}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                                    <Icon name="close" size={18} color="#777" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* FILTER ICON */}
                        <TouchableOpacity
                            style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
                            onPress={() => setIsFilterModalVisible(true)}
                            disabled={isLoading}
                        >
                            <Icon
                                name="options-outline"
                                size={22}
                                color={isFilterActive ? '#fff' : '#777'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCountText}>
                    {searchQuery.trim() ? 'Search Results' : 'Showing All'} ({displayedItems.length})
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2e7d32" />
                    <Text style={styles.loadingText}>Loading {category}...</Text>
                </View>
            ) : hasError ? (
                <View style={styles.emptyContainer}>
                    <MIcon name="alert-circle-outline" size={60} color="#e53935" />
                    <Text style={styles.emptyText}>
                        Failed to load data. Please check your network or API endpoint.
                    </Text>
                </View>
            ) : displayedItems.length > 0 ? (
                <FlatList
                    data={displayedItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MIcon name="archive-off-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                        Sorry! No items found matching your criteria.
                    </Text>
                </View>
            )}

            {/* Filter Modal */}
            <FilterModal
                isVisible={isFilterModalVisible}
                onClose={() => setIsFilterModalVisible(false)}
                filters={activeFilters}
                onApply={applyFilters}
            />
        </SafeAreaView>
    );
}

// ====================================================================
// STYLES
// ====================================================================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    topContainer: { marginBottom: 50 },
    gradientHeader: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 43 : 43,
        paddingBottom: 25,
        minHeight: 120 + (Platform.OS === 'android' ? 10 : 0),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitleCustom: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    backButton: { padding: 5 },
    searchBoxWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 90 + (Platform.OS === 'android' ? 10 : 0),
        paddingHorizontal: 20,
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 8,
        borderWidth: 0,
        marginRight: 10,
    },
    input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 0 },
    filterButton: {
        height: 50,
        width: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 8,
        position: 'relative',
    },
    filterButtonActive: {
        backgroundColor: '#2e7d32',
    },
    resultsHeader: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    resultsCountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        marginTop: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 15,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 15,
        textAlign: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 6,
        borderRadius: 12,
        padding: 8,
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: { position: 'relative' },
    cardImage: { width: '100%', height: 140, borderRadius: 10, backgroundColor: '#f0f0f0' },
    cardBody: { paddingTop: 5, paddingHorizontal: 2 },
    cardPrice: { fontSize: 18, fontWeight: '800', color: '#1b5e20', marginTop: 4 },
    cardTitle: { fontWeight: '600', marginTop: 2, fontSize: 14, color: '#222' },
    cardDetails: { fontSize: 11, color: '#777', marginTop: 2, marginBottom: 4 },
    likeIcon: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
    likeIconWrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 20,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    // --- MODAL STYLES ---
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#222',
    },
    filterSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        color: '#444',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    sortLabel: {
        fontSize: 16,
        color: '#333',
    },
    priceInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    priceInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: Platform.OS === 'android' ? 10 : 15,
        width: '45%',
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    priceValueText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    resetButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#eee',
        alignItems: 'center',
        marginRight: 10,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    applyButton: {
        flex: 2,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#2e7d32',
        alignItems: 'center',
        marginLeft: 10,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});