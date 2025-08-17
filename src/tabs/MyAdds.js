// tabs/MyAdds.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function MyAdds({ navigation }) {
  // Dummy ads data (replace later with API or state)
  const [ads, setAds] = useState([
    {
      id: "1",
      title: "iPhone 11 Pro Max",
      price: "$999",
      image: "https://via.placeholder.com/150",
      status: "Active",
    },
    {
      id: "2",
      title: "Wooden Sofa",
      price: "$250",
      image: "https://via.placeholder.com/150",
      status: "Pending",
    },
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Info Section */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price}</Text>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Active" ? "rgba(46, 125, 50, 0.1)" : "rgba(255, 152, 0, 0.1)",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === "Active" ? "#2e7d32" : "#ff9800" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Forward Icon */}
      <Icon name="chevron-forward" size={22} color="#bbb" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Ads</Text>

      {ads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={70} color="#ccc" />
          <Text style={styles.emptyText}>You haven’t posted any ads yet.</Text>
          <TouchableOpacity style={styles.postButton}>
            <Text style={styles.postButtonText}>Post Your First Ad</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ads}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 16,
    color: "#2e7d32",
  },

  // Card styles
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: 75, height: 75, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: "600", color: "#333" },
  price: { fontSize: 15, color: "#2e7d32", marginTop: 4, fontWeight: "500" },

  // Status Badge
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  postButton: {
    marginTop: 18,
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  postButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
