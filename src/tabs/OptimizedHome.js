// src/tabs/OptimizedHome.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { useOptimizedWishlistActions, useWishlistCount } from '../contexts/OptimizedWishlistContext';
import { useOptimizedApi } from '../hooks/useOptimizedApi';
import { getTopPicks, getNearbyItems, getFollowingItems } from '../apis/homeApi';
import OptimizedProductList from '../components/OptimizedProductList';
import OptimizedImage from '../components/OptimizedImage';

const { width } = Dimensions.get('window');

// ✅ Move static data outside component to prevent re-creation
const CATEGORIES = [
    { id: '1', label: 'Cars', icon: require('../images/car.png') },
    { id: '2', label: 'Properties', icon: require('../images/briefcase.png') },
    { id: '3', label: 'Mobiles', icon: require('../images/phone.png') },
    { id: '5', label: 'Fashion', icon: require('../images/shoes.png') },
    { id: '6', label: 'Bikes', icon: require('../images/bikes.png') },
    { id: '7', label: 'Electronics', icon: require('../images/fridge.png') },
];

const BANNERS = [
    { id: '1', image: require('../images/banner1.png') },
    { id: '2', image: require('../images/banner2.png') },
    { id: '3', image: require('../images/banner5.png') },
    { id: '4', image: require('../images/banner4.png') },
];

const MOCK_LOCATIONS = [
    { id: '2', name: 'New Delhi, NCR', value: 'New Delhi', lat: 28.6448, lon: 77.2167 },
    { id: '3', name: 'Mumbai, Maharashtra', value: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { id: '4', name: 'Bengaluru, Karnataka', value: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { id: '5', name: 'Chennai, Tamil Nadu', value: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { id: '6', name: 'Kolkata, West Bengal', value: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { id: '7', name: 'Hyderabad, Telangana', value: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { id: '8', name: 'Pune, Maharashtra', value: 'Pune', lat: 18.5204, lon: 73.8567 },
    { id: '9', name: 'Current Location (GPS)', value: 'Current Location (GPS)', lat: 28.5355, lon: 77.3910 },
];

// ✅ Memoized Location Modal Component
const LocationModal = React.memo(({ visible, onClose, onSelect }) => {
    const [searchText, setSearchText] = useState('');

    // ✅ Debounced search with useMemo
    const filteredLocations = useMemo(() => {
        if (!searchText.trim()) return MOCK_LOCATIONS;
        const query = searchText.toLowerCase();
        return MOCK_LOCATIONS.filter(loc =>
            loc.name.toLowerCase().includes(query) ||
            loc.value.toLowerCase().includes(query)
        );
    }, [searchText]);

    const handleSelectLocation = useCallback((location) => {
        onSelect(location);
        setSearchText('');
    }, [onSelect]);

    const renderLocationItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.locationItem}
            onPress={() => handleSelectLocation(item)}
        >
            <Ionicons name="location-outline" size={20} color="#16A34A" />
            <Text style={styles.locationName}>{item.name}</Text>
        </TouchableOpacity>
    ), [handleSelectLocation]);

    const keyExtractor = useCallback((item) => item.id, []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Location</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for your city..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <OptimizedProductList
                    data={filteredLocations}
                    renderItem={renderLocationItem}
                    keyExtractor={keyExtractor}
                    numColumns={1}
                    initialNumToRender={10}
                />
            </SafeAreaView>
        </Modal>
    );
});

const OptimizedHome = () => {
    const navigation = useNavigation();
    const { toggleWishlist } = useOptimizedWishlistActions();
    const wishlistCount = useWishlistCount();

    // ✅ State management
    const [selectedLocation, setSelectedLocation] = useState('Current Location (GPS)');
    const [isLocationModalVisible, setLocationModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('topPicks');

    // ✅ Optimized API calls with caching
    const topPicks = useOptimizedApi(getTopPicks, [], { 
        enableCache: true, 
        cacheTime: 5 * 60 * 1000 // 5 minutes
    });

    const nearbyItems = useOptimizedApi(
        getNearbyItems, 
        [selectedLocation], 
        { enableCache: true }
    );

    const followingItems = useOptimizedApi(getFollowingItems, [], { 
        enableCache: true 
    });

    // ✅ Memoized handlers
    const handleLocationSelect = useCallback((location) => {
        setSelectedLocation(location.value);
        setLocationModalVisible(false);
    }, []);

    const handleProductPress = useCallback((product) => {
        navigation.navigate('ItemDetails', { item: product });
    }, [navigation]);

    const handleCategoryPress = useCallback((category) => {
        navigation.navigate('Search', { category: category.label });
    }, [navigation]);

    const handleSectionChange = useCallback((section) => {
        setActiveSection(section);
    }, []);

    // ✅ Memoized current data based on active section
    const currentData = useMemo(() => {
        switch (activeSection) {
            case 'nearby':
                return nearbyItems;
            case 'following':
                return followingItems;
            default:
                return topPicks;
        }
    }, [activeSection, topPicks, nearbyItems, followingItems]);

    // ✅ Memoized section tabs
    const sectionTabs = useMemo(() => [
        { key: 'topPicks', label: 'Top Picks', icon: 'star' },
        { key: 'nearby', label: 'Nearby', icon: 'location' },
        { key: 'following', label: 'Following', icon: 'heart' },
    ], []);

    const renderSectionTab = useCallback((tab) => (
        <TouchableOpacity
            key={tab.key}
            style={[
                styles.sectionTab,
                activeSection === tab.key && styles.activeSectionTab
            ]}
            onPress={() => handleSectionChange(tab.key)}
        >
            <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeSection === tab.key ? '#16A34A' : '#666'}
            />
            <Text style={[
                styles.sectionTabText,
                activeSection === tab.key && styles.activeSectionTabText
            ]}>
                {tab.label}
            </Text>
        </TouchableOpacity>
    ), [activeSection, handleSectionChange]);

    // ✅ Memoized category renderer
    const renderCategory = useCallback(({ item }) => (
        <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item)}
        >
            <OptimizedImage 
                source={item.icon}
                style={styles.categoryIcon}
                resizeMode="contain"
            />
            <Text style={styles.categoryLabel}>{item.label}</Text>
        </TouchableOpacity>
    ), [handleCategoryPress]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#16A34A" />

            {/* ✅ Optimized Header */}
            <LinearGradient colors={['#2e7d32', '#1b5e20']} style={styles.header}>
                <Text style={styles.headerTitle}>SellBuyTM</Text>
                <TouchableOpacity 
                    style={styles.locationContainer} 
                    onPress={() => setLocationModalVisible(true)}
                >
                    <Ionicons name="location-sharp" size={18} color="#fff" />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {selectedLocation}
                    </Text>
                    <MIcon name="keyboard-arrow-down" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* ✅ Search Bar */}
            <View style={styles.searchRow}>
                <TouchableOpacity 
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Ionicons name="search" size={20} color="#999" />
                    <Text style={styles.searchPlaceholder}>
                        Search for products, services...
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.wishlistButton}>
                    <Ionicons name="heart-outline" size={24} color="#16A34A" />
                    {wishlistCount > 0 && (
                        <View style={styles.wishlistBadge}>
                            <Text style={styles.wishlistBadgeText}>
                                {wishlistCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ✅ Categories */}
            <OptimizedProductList
                data={CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                numColumns={3}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                style={styles.categoriesContainer}
            />

            {/* ✅ Section Tabs */}
            <View style={styles.sectionTabs}>
                {sectionTabs.map(renderSectionTab)}
            </View>

            {/* ✅ Main Product List */}
            <OptimizedProductList
                products={currentData.data || []}
                onProductPress={handleProductPress}
                onWishlistToggle={toggleWishlist}
                refreshing={currentData.refreshing}
                onRefresh={currentData.refresh}
                onEndReached={currentData.refetch}
            />

            {/* ✅ Loading State */}
            {currentData.loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#16A34A" />
                </View>
            )}

            {/* ✅ Location Modal */}
            <LocationModal
                visible={isLocationModalVisible}
                onClose={() => setLocationModalVisible(false)}
                onSelect={handleLocationSelect}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#C8E6C9',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: width * 0.5,
    },
    locationText: {
        color: '#fff',
        fontSize: 14,
        marginHorizontal: 4,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    searchPlaceholder: {
        marginLeft: 8,
        color: '#999',
        fontSize: 14,
    },
    wishlistButton: {
        position: 'relative',
        padding: 8,
    },
    wishlistBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishlistBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryItem: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        margin: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    categoryIcon: {
        width: 32,
        height: 32,
        marginBottom: 4,
    },
    categoryLabel: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    sectionTabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeSectionTab: {
        backgroundColor: '#E8F5E9',
    },
    sectionTabText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    activeSectionTabText: {
        color: '#16A34A',
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    locationName: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
});

export default OptimizedHome;