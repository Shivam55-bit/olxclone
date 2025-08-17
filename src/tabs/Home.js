// Home.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useWishlist } from '../WishlistContext';
import { useItems } from '../ItemsContext';

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', label: 'Cars', icon: require('../images/car.png') },
  { id: '2', label: 'Properties', icon: require('../images/briefcase.png') },
  { id: '3', label: 'Mobiles', icon: require('../images/phone.png') },
  { id: '4', label: 'CCTV', icon: require('../images/cctv-camera.png') },
  { id: '5', label: 'Fashion', icon: require('../images/shoes.png') },
  { id: '6', label: 'Bikes', icon: require('../images/bikes.png') },
  { id: '7', label: 'Electronics', icon: require('../images/fridge.png') },
];

const banners = [
  { id: '1', image: require('../images/banner1.png') },
  { id: '2', image: require('../images/banner2.png') },
  { id: '3', image: require('../images/banner3.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { wishlist, toggleWishlist } = useWishlist();
  const { items } = useItems();

  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const scrollRef = useRef(null);

  const onScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slide);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const results = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(results);
    }
    Keyboard.dismiss();
  };

  // ✅ Fixed Header (stays pinned)
  const renderFixedHeader = () => (
    <View style={{ backgroundColor: '#fff', elevation: 4 }}>
      {/* Gradient Header */}
      <LinearGradient colors={['#2e7d32', '#1c6d21ff']} style={styles.header}>
        <Image
          source={require('../images/logo-wbg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.locationContainer}>
          <Icon name="location-sharp" size={18} color="#fff" />
          <Text style={styles.locationText}>Your Location</Text>
          <MIcon name="keyboard-arrow-down" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          {/* 👈 Search Icon inside left */}
          <Icon name="search" size={20} color="#2e7d32" style={{ marginRight: 6 }} />

          <TextInput
            style={styles.searchInput}
            placeholder="Find Cars, Mobile Phones and more..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Icon name="heart-outline" size={20} color="#2e7d32" />
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={20} color="#2e7d32" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Scrollable content below fixed header
  const renderListHeader = () => (
    <>
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          ref={scrollRef}
          scrollEventThrottle={16}
        >
          {banners.map((item) => (
            <Image key={item.id} source={item.image} style={styles.bannerImage} />
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? '#2e7d32' : '#ccc',
                  transform: [{ scale: index === activeIndex ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() =>
                navigation.navigate('Search', { category: item.label })
              }
            >
              <View style={styles.categoryIconWrapper}>
                <Image source={item.icon} style={styles.categoryImage} />
              </View>
              <Text style={styles.categoryText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Recommendations Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Fresh recommendations</Text>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderFixedHeader()}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => {
          const isWishlisted = wishlist.some((w) => w.id === item.id);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ItemDetails', { item })}
            >
              <TouchableOpacity
                style={styles.likeIcon}
                onPress={() => toggleWishlist(item)}
              >
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={19}
                  color={isWishlisted ? 'red' : '#2e7d32'}
                />
              </TouchableOpacity>

              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.details ? (
                <Text style={styles.cardDetails}>{item.details}</Text>
              ) : null}
              <Text style={styles.cardPrice}>₹ {item.price}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    elevation: 4,
  },
  logo: { width: 45, height: 45 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationText: {
    color: '#fff',
    fontSize: 15,
    marginHorizontal: 4,
    fontWeight: '600',
  },

  // Search Bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 12,
    borderRadius: 30,
    height: 44,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, paddingLeft: 0 }, //  no extra padding since icon is left
  iconButton: {
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 8,
    elevation: 2,
  },

  // Banner
  bannerContainer: { height: 180, marginTop: 8 },
  bannerImage: {
    width: width - 20,
    height: 170,
    marginHorizontal: 10,
    borderRadius: 12,
    resizeMode: 'cover',
    elevation: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  dot: { height: 8, width: 8, borderRadius: 4, marginHorizontal: 5 },

  // Sections
  section: { marginTop: 12, paddingHorizontal: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },

  // Categories
  categoryItem: { alignItems: 'center', marginRight: 18 },
  categoryIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 12,
    elevation: 3,
    marginBottom: 6,
  },
  categoryImage: { width: 40, height: 40 },
  categoryText: { fontSize: 12, fontWeight: '500' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flex: 0.48,
    elevation: 3,
    margin: 5,
  },
  likeIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    zIndex: 1,
  },
  cardImage: { width: '100%', height: 130, borderRadius: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 6 },
  cardDetails: { fontSize: 12, color: '#666', marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: '#2e7d32', marginTop: 4 },
});
