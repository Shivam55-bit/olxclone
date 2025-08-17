import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ItemDetails = ({ route, navigation }) => {
  const { item } = route.params; // ✅ Receive item from Home.js

  return (
    <ScrollView style={styles.container}>
      {/* Item Image */}
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      {/* Price + Title */}
      <View style={styles.detailsContainer}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {item.details ? <Text style={styles.subTitle}>{item.details}</Text> : null}

        {/* Location + Date */}
        <View style={styles.locationRow}>
          <Icon name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>Kajupada, Mumbai, Maharashtra</Text>
          <Text style={styles.date}> • Posted on 17 Oct, 2020</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          • iPhone 11Pro Max Black Color{'\n'}
          • All access are there bill box and all{'\n'}
          • 1 week extended warranty left now{'\n'}
          • Phone is in good new condition{'\n'}
          • It is an Indian purchase phone with GST bill{'\n\n'}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </View>

      {/* Posted By */}
      <View style={styles.section}>
        <View style={styles.postedByRow}>
          <View>
            <Text style={styles.sectionTitle}>Posted By</Text>
            <Text style={styles.userName}>Samantha Smith</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewProfile}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Similar Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Similar Items</Text>
        <Image
          source={{ uri: "https://via.placeholder.com/120" }}
          style={styles.similarImage}
        />
      </View>
    </ScrollView>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  itemImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },

  detailsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: '600',
    color: '#333',
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  location: { fontSize: 12, color: '#666' },
  date: { fontSize: 12, color: '#999' },

  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },

  postedByRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: { fontSize: 14, color: '#333', marginTop: 3 },
  viewProfile: { fontSize: 14, color: '#2e7d32', fontWeight: '500' },

  similarImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginTop: 5,
  },
});
