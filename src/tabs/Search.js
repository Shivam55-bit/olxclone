// Search.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { useItems } from '../ItemsContext';   // ✅ Import items context

export default function SearchScreen() {
  const route = useRoute();
  const { items } = useItems();   // ✅ All items
  const category = route.params?.category || null;

  const [filteredItems, setFilteredItems] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Sofa',
    'Three seater sofa',
    'House for rent',
    'IPhone X',
  ]);

  useEffect(() => {
    if (category) {
      const filtered = items.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
      setFilteredItems(filtered);
    }
  }, [category, items]);

  return (
    <View style={styles.container}>
      {/* Top header with search */}
      <View >
        <Text style={styles.headerTitle}>
          {category ? category : "Search"}
        </Text>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#777" style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search here..."
            placeholderTextColor="#aaa"
            style={styles.input}
          />
        </View>
      </View>

      {/* Show filtered results if category selected */}
      <ScrollView contentContainerStyle={styles.content}>
        {category ? (
          <>
            <Text style={styles.sectionTitle}>
              Showing results for <Text style={{ color: '#5c3317' }}>{category}</Text>
            </Text>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <TouchableOpacity key={index} style={styles.searchItem}>
                  <Icon
                    name="pricetag-outline"
                    size={18}
                    color="#2e7d32"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.searchText}>{item.title}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: '#777', fontSize: 14 }}>
                No items found in this category.
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((item, index) => (
              <TouchableOpacity key={index} style={styles.searchItem}>
                <Icon
                  name="time-outline"
                  size={18}
                  color="#5c3317"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.searchText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  // Header
  header: {
    backgroundColor: '#5c3317',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: { flex: 1, fontSize: 15, color: '#333' },

  // Content
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  searchText: { fontSize: 15, color: '#444', fontWeight: '500' },
});
