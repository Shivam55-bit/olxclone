// ✅ src/screens/SellJobs.js
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

const jobCategories = [
  { id: "it", title: "IT & Software", icon: "laptop", subtitle: "Developers, Designers, Engineers" },
  { id: "marketing", title: "Marketing", icon: "bullhorn", subtitle: "Digital, Sales, Advertising" },
  { id: "finance", title: "Finance", icon: "cash-multiple", subtitle: "Banking, Accounting, Auditing" },
  { id: "education", title: "Education", icon: "book-open-variant", subtitle: "Teachers, Trainers, Tutors" },
  { id: "healthcare", title: "Healthcare", icon: "hospital", subtitle: "Doctors, Nurses, Assistants" },
];

export default function SellJobs({ navigation }) {
  const renderItem = ({ item }) => (
    <Pressable
      android_ripple={{ color: "rgba(76,175,80,0.1)", borderless: false }}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
      ]}
      onPress={() =>
        navigation.navigate("JobForm", {
          category: { id: item.id, title: item.title },
        })
      }
    >
      {/* ✅ Gradient Icon */}
      <LinearGradient
        colors={["#66bb6a", "#2e7d32"]}
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
          <Text style={styles.headerTitle}>Post a Job</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      {/* ✅ Rounded White Content */}
      <View style={styles.contentContainer}>
        <FlatList
          data={jobCategories}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  // ✅ Card styling
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 2,
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
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2e7d32",
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
});
