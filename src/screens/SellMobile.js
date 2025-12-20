// src/screens/SellMobile.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

const mobileCategories = [
  { id: "mobile", title: "Mobile", icon: "cellphone", subtitle: "Smartphones & feature phones" },
  { id: "tablet", title: "Tablet", icon: "tablet", subtitle: "iPads & Android tablets" },
];

export default function SellMobile({ navigation }) {
  const renderItem = ({ item }) => (
    <Pressable
      android_ripple={{ color: "#e0f2f1", borderless: false }}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], shadowOpacity: 0.15 },
      ]}
      onPress={() =>
        navigation.navigate("SellMobileForm", {
          category: { id: item.id, title: item.title },
        })
      }
    >
      {/* ✅ Gradient Icon Circle */}
      <LinearGradient
        colors={["#43a047", "#2e7d32"]}
        style={styles.iconWrapper}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={item.icon} size={22} color="#fff" />
      </LinearGradient>

      {/* ✅ Texts */}
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.cardText}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>

      <Icon name="chevron-right" size={26} color="#bbb" />
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
          <Text style={styles.headerTitle}>Sell Mobile / Tablet</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      {/* ✅ Rounded Content */}
      <View style={styles.contentContainer}>
        <FlatList
          data={mobileCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },

  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { padding: 4 },

  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
