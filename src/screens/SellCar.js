// ✅ src/screens/SellCar.js
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
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

// ✅ Car categories
const carCategories = [
  { id: "suv", title: "SUVs", icon: "car-sports" },
  { id: "luxury", title: "Luxury Cars", icon: "car-limousine" },
  { id: "electric", title: "Electric Vehicles", icon: "car-electric" },
  { id: "classic", title: "Classic Cars", icon: "car-estate" },
  
];

export default function SellCar({ navigation }) {
  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
      ]}
      android_ripple={{ color: "rgba(46,125,50,0.1)" }}
      onPress={() =>
        navigation.navigate("CarForm", {
          category: { id: item.id, title: item.title },
        })
      }
    >
      {/* ✅ Icon in gradient circle */}
      <LinearGradient
        colors={["#66bb6a", "#2e7d32"]}
        style={styles.iconWrapper}
      >
        <Icon name={item.icon} size={26} color="#fff" />
      </LinearGradient>

      <Text style={styles.cardText}>{item.title}</Text>

      <Icon name="chevron-right" size={26} color="#888" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ✅ Gradient Header */}
      <LinearGradient
        colors={["#43a047", "#2e7d32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sell Cars</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      {/* ✅ Content with rounded top */}
      <View style={styles.contentContainer}>
        <FlatList
          data={carCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 18 }}
        />
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e8f5e9" },

  // ✅ Header
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 25,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: "hidden",
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  backBtn: { padding: 6 },

  // ✅ Content
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -14,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  // ✅ Card styling
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    letterSpacing: 0.3,
  },
});
