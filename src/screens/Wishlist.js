// Wishlist.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWishlist } from '../WishlistContext';   // ✅ use context

const Wishlist = ({ navigation }) => {
  const { wishlist, toggleWishlist } = useWishlist();  // ✅ get from context

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ItemDetails', { item })}
    >
      {/* Remove button */}
      <TouchableOpacity
        style={styles.removeIcon}
        onPress={() => toggleWishlist(item)}   // ✅ remove via context
      >
        <Ionicons name="trash-outline" size={18} color="#d32f2f" />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      {item.details ? (
        <Text style={styles.cardDetails} numberOfLines={2}>{item.details}</Text>
      ) : null}
      <Text style={styles.cardPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={70} color="#bbb" />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubText}>Start adding items you love ❤️</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 6 },

  listContainer: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flex: 0.48,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  removeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  cardDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    color: '#2e7d32',
    marginTop: 6,
    fontWeight: '700',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
});
