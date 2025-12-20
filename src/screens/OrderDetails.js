import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";

const OrderDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>No Order Details Available</Text>
      </View>
    );
  }

  // Refund message based on payment method
  const getRefundMessage = (paymentMethod) => {
    switch (paymentMethod) {
      case "Credit Card":
      case "Debit Card":
        return "Your refund will be processed within 3-5 business days to your original card.";
      case "UPI":
        return "Your refund will be credited within 24-48 hours to your UPI account.";
      case "Wallet":
        return "Refund has been processed instantly to your wallet balance.";
      case "Cash on Delivery":
        return "Refund will be issued via bank transfer within 7-10 business days.";
      default:
        return "Your refund will be processed shortly.";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#66bb6a", "#2e7d32"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Product Info */}
        <View style={styles.card}>
          <Image source={{ uri: order.image }} style={styles.productImage} />
          <View style={styles.info}>
            <Text style={styles.name}>{order.name}</Text>
            <Text style={styles.status}>
              {order.status} - {order.date}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <Text style={styles.detailText}>Address: 123, Green Park, Delhi</Text>
          <Text style={styles.detailText}>
            Estimated Delivery: Sep 15, 2025
          </Text>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.detailText}>
            Payment Method: {order.paymentMethod || "Credit Card"}
          </Text>
          <Text style={styles.detailText}>Amount Paid: ₹1,20,000</Text>
        </View>

        {/* Refund Info */}
        {(order.status === "Cancelled" || order.status === "Refund Cancelled") && (
          <View style={styles.refundBox}>
            <Icon name="cash-outline" size={28} color="#2e7d32" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.refundTitle}>Refund Information</Text>
              <Text style={styles.refundText}>
                {getRefundMessage(order.paymentMethod || "Credit Card")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  backButton: { width: 28 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
  },
  productImage: { width: 90, height: 90, borderRadius: 10 },
  info: { flex: 1, marginLeft: 12, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  status: { fontSize: 13, color: "#888" },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  detailText: { fontSize: 14, color: "#555", marginBottom: 4 },
  refundBox: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    margin: 16,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    alignItems: "center",
  },
  refundTitle: { fontSize: 16, fontWeight: "700", color: "#2e7d32" },
  refundText: { fontSize: 14, color: "#333", marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
