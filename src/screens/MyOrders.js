import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const MyOrders = () => {
  const navigation = useNavigation();

  const [orders] = useState([
    { id: '1', name: 'iPhone 14 Pro', image: 'https://via.placeholder.com/150', status: 'Delivered', date: 'Aug 18, 2025', rating: 4, tag: '' },
    { id: '2', name: 'Chess Set', image: 'https://via.placeholder.com/150', status: 'Refund Cancelled', date: 'Aug 15, 2025', rating: 0, tag: 'REPLACEMENT' },
    { id: '3', name: 'Samsung Galaxy S23', image: 'https://via.placeholder.com/150', status: 'Cancelled', date: 'Aug 10, 2025', rating: 0, tag: '' },
  ]);

  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchText, setSearchText] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.75))[0];

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All Time');

  // Open filter panel
  const openFilter = () => {
    setIsFilterVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  // Close filter panel
  const closeFilter = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsFilterVisible(false));
  };

  // Apply filters
  const applyFilter = () => {
    let filtered = [...orders];
    if (selectedStatus !== 'All') filtered = filtered.filter(o => o.status === selectedStatus);
    // Example for time filter: placeholder logic
    if (selectedTime === 'Last 30 Days') filtered = filtered;
    setFilteredOrders(filtered);
    closeFilter();
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedStatus('All');
    setSelectedTime('All Time');
    setFilteredOrders(orders);
    closeFilter();
  };

  // Rating stars
  const renderStars = rating => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#f1c40f"
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  // Order card
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.info}>
        <Text style={styles.status}>{item.status} - {item.date}</Text>
        <Text style={styles.name}>{item.name}</Text>
        {item.rating > 0 && <View style={styles.rating}>{renderStars(item.rating)}</View>}
        {item.rating === 0 && item.status === 'Delivered' && (
          <Text style={styles.rateNow}>Rate this product now</Text>
        )}
        {item.tag ? <Text style={styles.tag}>{item.tag}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#66bb6a', '#2e7d32']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.rightIcons}>
          {/* <TouchableOpacity style={{ marginRight: 16 }}>
            <Icon name="search-outline" size={24} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </LinearGradient>

      {/* Search + Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#666" style={{ marginHorizontal: 6 }} />
          <TextInput
            placeholder="Search your order here"
            style={styles.searchInput}
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close-circle" size={20} color="#999" style={{ marginHorizontal: 6 }} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
          <Icon name="filter-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders.filter(o =>
          o.name.toLowerCase().includes(searchText.toLowerCase())
        )}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Icon name="cart-outline" size={60} color="#bbb" />
            <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>
              No orders found
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      {isFilterVisible && (
        <Modal transparent animationType="none">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={closeFilter}
            activeOpacity={1}
          />
          <Animated.View
            style={[styles.filterPanel, { transform: [{ translateX: slideAnim }] }]}
          >
            {/* Header */}
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Orders</Text>
              <TouchableOpacity onPress={closeFilter}>
                <Icon name="close-outline" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Order Status */}
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={styles.optionRow}>
              {['All', 'On the way', 'Delivered', 'Cancelled', 'Returned'].map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={[
                    styles.optionBtn,
                    selectedStatus === status && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={
                      selectedStatus === status
                        ? styles.optionTextSelected
                        : styles.optionText
                    }
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Order Time */}
            <Text style={styles.sectionTitle}>Order Time</Text>
            <View style={styles.optionRow}>
              {['All Time', 'Last 30 Days', 'Last 7 Days'].map(time => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  style={[
                    styles.optionBtn,
                    selectedTime === time && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={
                      selectedTime === time
                        ? styles.optionTextSelected
                        : styles.optionText
                    }
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
              <LinearGradient colors={['#66bb6a', '#2e7d32']} style={styles.applyGradient}>
                <Text style={styles.applyText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.applyBtn, { marginTop: 12 }]} onPress={clearFilters}>
              <LinearGradient colors={['#d32f2f', '#c62828']} style={styles.applyGradient}>
                <Text style={styles.applyText}>Clear Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  backButton: { width: 28 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },

  searchSection: { flexDirection: 'row', padding: 16, marginBottom: 10 },
  searchBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14 },
  filterBtn: {
    width: 40,
    marginLeft: 10,
    backgroundColor: '#4caf50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImage: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  status: { fontSize: 12, color: '#888' },
  name: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  rating: { flexDirection: 'row', marginTop: 4 },
  rateNow: { color: '#4caf50', fontSize: 13, marginTop: 4 },
  tag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#ff9800',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  filterPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    padding: 16,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#444',
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionSelected: { backgroundColor: '#66bb6a' },
  optionText: { color: '#333', fontSize: 14 },
  optionTextSelected: { color: '#fff', fontWeight: '600', fontSize: 14 },
  applyBtn: { marginTop: 'auto' },
  applyGradient: { paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
