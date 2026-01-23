import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

// Screens
import Home from "../tabs/Home";
import MyAds from "../tabs/MyAds";
import User from "../tabs/User";
import Chat from "../screens/Chat";
import SellCategories from "./SellCategories";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 🚀 Floating pulse effect for Sell button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" ,paddingBottom:10 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2e7d32", // ✅ green
        tabBarInactiveTintColor: "#9e9e9e",
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Chat":
              iconName = "chatbubble-outline";
              break;
            case "Sell":
              iconName = "add-circle";
              break;
            case "MyAds":
              iconName = "albums-outline";
              break;
            case "Account":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Chat" component={Chat} />

      {/* 🌟 Floating SELL button with pulse animation */}
      <Tab.Screen
        name="Sell"
        component={View}
        options={{
          tabBarLabel: "",
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("SellCategories")}
              style={styles.sellButtonWrapper}
              activeOpacity={0.9}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                  colors={["#43a047", "#2e7d32"]} // ✅ green gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sellButton}
                >
                  <Ionicons name="add" size={34} color="#fff" />
                </LinearGradient>
              </Animated.View>
              <Text style={styles.sellLabel}>Sell</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen name="MyAds" component={MyAds} />
      <Tab.Screen name="Account" component={User} />
    </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: "#fff", // ✅ solid white (not transparent)
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  sellButtonWrapper: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  sellButton: {
    width: 44,
    height: 44,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2e7d32",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  sellLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "700",
  },
});
