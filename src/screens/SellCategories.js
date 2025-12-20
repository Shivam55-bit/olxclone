// src/screens/SellCategories.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
// Calculate card size based on screen width, accounting for 20px padding on each side and 16px in the middle.
const HORIZONTAL_PADDING = 20;
const COLUMN_GAP = 16;
const CARD_SIZE = (width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

// Categories with gradient colors
const categories = [
  { id: 1, name: 'Cars', icon: 'car-outline', colors: ['#66bb6a', '#2e7d32'], screen: 'SellCar' },
  { id: 2, name: 'Properties', icon: 'business-outline', colors: ['#81c784', '#388e3c'], screen: 'SellProperties' },
  { id: 3, name: 'Mobiles', icon: 'phone-portrait-outline', colors: ['#4caf50', '#2e7d32'], screen: 'SellMobile' },
  // { id: 4, name: 'Jobs', icon: 'briefcase-outline', colors: ['#9ccc65', '#558b2f'], screen: 'SellJobs' },
  { id: 5, name: 'Bikes', icon: 'bicycle-outline', colors: ['#43a047', '#1b5e20'], screen: 'SellBikes' },
  { id: 6, name: 'Electronics & Appliances', icon: 'tv-outline', colors: ['#66bb6a', '#2e7d32'], screen: 'SellElectronicsAppliances' },
  { id: 7, name: 'Commercial Vehicles', icon: 'bus-outline', colors: ['#81c784', '#388e3c'], screen: 'SellCommercialVehicles' },
  // 🔑 NEW: Fashion Category Added
  { id: 8, name: 'Fashion', icon: 'shirt-outline', colors: ['#9ccc65', '#558b2f'], screen: 'SellFashion' },
];

export default function SellCategories({ navigation }) {
  const [query, setQuery] = useState('');

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

  // Render Category
  const renderCategory = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500)}
      // Removed 'flex: 1' here and applied fixed dimensions in styles.
      style={styles.categoryItemWrapper} 
    >
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate(item.screen)}
      >
        <LinearGradient colors={item.colors} style={styles.iconWrapper}>
          <Icon name={item.icon} size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.categoryText}>{item.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header is commented out, keeping the structure */}
      {/* <LinearGradient
        colors={['#2e7d32', '#1b5e20']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Select Category</Text>
      </LinearGradient> */}

      {/* Sub header */}
      <Text style={styles.subHeader}>What are you offering? Choose a category. 🏷️</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search-outline" size={18} color="#666" />
        <TextInput
          placeholder="Search categories..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Categories Grid */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        // Use a more appropriate row style to handle spacing for the 2-column grid
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noResult}>No categories found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fef9' },

  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  subHeader: {
    fontSize: 15,
    color: '#444',
    marginHorizontal: 20, // Adjusted for consistent horizontal spacing
    marginBottom: 10,
    fontWeight: '500',
    paddingTop: 15,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 6,
    color: '#000',
  },

  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING, // Added padding to the list content
    paddingBottom: 60,
    paddingTop: 10,
  },
  
  categoryItemWrapper: {
    marginBottom: 16, // Added bottom margin for vertical spacing between rows
    // Added margin to the right only for the first column to create the gap
    marginRight: COLUMN_GAP, 
    width: CARD_SIZE, // Explicitly set width to the calculated size
  },

  categoryCard: {
    alignItems: 'center',
    height: CARD_SIZE + 20, // Increased height slightly to accommodate long category names
    width: '100%', // Use 100% of the wrapper's width
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  iconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  categoryText: {
    fontSize: 13, // Slightly reduced font size for better fit
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 5, // Added padding to prevent text overflow
  },
  row: {
    // This style is applied to the wrapper of each row (two items)
    justifyContent: 'flex-start', // Use flex-start and let item margins/widths manage space
  },
  noResult: {
    textAlign: 'center',
    color: '#999',
    marginTop: 60,
    fontSize: 15,
  },
});