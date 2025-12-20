import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  Pressable,
  // TouchableOpacity was removed for consistency, using Pressable everywhere
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

// 🔑 Consistent Green Color Palette
const COLORS = {
  primaryGreen: "#28a745", // Main Green
  darkGreen: "#218838", // Darker Green for gradient end
  rippleGreen: "rgba(40, 167, 69, 0.15)", // Light green ripple effect
  textDark: "#333",
  borderGray: "#bbb",
  white: "#fff",
  lightBackground: "#f0f4f3",
};


// ✅ Updated Categories with IDs that map to the dynamic form's logic (apartment, house, land)
const categories = [
  { id: "apartment", title: "Sell Residential Apartment", icon: "home-city-outline" },
  { id: "house", title: "Sell Residential House", icon: "home-account" },
  { id: "land", title: "Sell Land or Plot", icon: "map-marker-radius-outline" },
  // These categories will default to the 'apartment' form structure for simplicity
  { id: "rent_residential", title: "Rent Residential Property", icon: "home-search-outline" },
  { id: "commercial_sale", title: "Sell Commercial Property (Shop/Office)", icon: "office-building-outline" },
  { id: "commercial_rent", title: "Rent Commercial Property", icon: "store-outline" },
];

export default function SellProperties({ navigation }) {
  const renderItem = ({ item }) => {
    // Map complex IDs to the core dynamic form keys (apartment, house, land)
    let formKey = item.id;
    if (formKey.includes("rent") || formKey.includes("commercial")) {
        // For non-core types, default to the most common dynamic form key
        formKey = "apartment"; 
    }
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          // Apply a gentle scale down for visual feedback on press (works on both iOS/Android)
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
        ]}
        // 🔑 Green Ripple Effect (Android specific)
        android_ripple={{ color: COLORS.rippleGreen, borderless: false }}
        onPress={() =>
          navigation.navigate("PropertyForm", { 
            category: { id: formKey, title: item.title },
          })
        }
      >
        {/* Icon with Green gradient background */}
        <LinearGradient
          colors={[COLORS.primaryGreen, COLORS.darkGreen]} 
          style={styles.iconWrapper}
        >
          <Icon name={item.icon} size={24} color={COLORS.white} />
        </LinearGradient>

        {/* Title */}
        <Text style={styles.cardText}>{item.title}</Text>

        {/* Chevron */}
        <Icon name="chevron-right" size={26} color={COLORS.borderGray} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Set status bar style and make it translucent for the header gradient */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ✅ Gradient Header - Now using Green */}
      <LinearGradient
        colors={[COLORS.primaryGreen, COLORS.darkGreen]} // Green Gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          {/* FIX: Replaced TouchableOpacity with Pressable for touch consistency */}
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={({ pressed }) => [
                styles.backBtn, 
                pressed && { opacity: 0.7 }
            ]}
            // Custom ripple for the icon
            android_ripple={{ color: COLORS.darkGreen, borderless: true, radius: 24 }} 
          >
            <Icon name="arrow-left" size={26} color={COLORS.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Post Your Property Ad</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      {/* ✅ Rounded White Content */}
      <View style={styles.contentContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lightBackground },

  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
  },
  // Adjusted padding for the back button area to ensure a good touch target
  backBtn: { padding: 10, marginRight: -6 }, 

  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Negative margin to overlap the header gradient
    marginTop: -16, 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    borderLeftWidth: 5, // Visual accent
    borderLeftColor: COLORS.primaryGreen, // 🔑 Green accent bar
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },
});
