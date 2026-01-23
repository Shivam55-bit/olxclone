// src/screens/SellFashion.js
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

// 🔑 Consistent Green Color Palette
const COLORS = {
    primaryGreen: "#28a745", // Main Green
    darkGreen: "#218838",    // Darker Green for gradient end
    rippleGreen: "rgba(40, 167, 69, 0.15)", // Light green ripple effect
    textDark: "#333",
    borderGray: "#bbb",
    white: "#fff",
    lightBackground: "#f0f4f3",
};

const fashionCategories = [
    { id: "mens_wear", title: "Men's Clothing & Shoes", icon: "tshirt-crew-outline" },
    { id: "womens_wear", title: "Women's Clothing & Footwear", icon: "shoe-heel" },
    { id: "accessories", title: "Bags, Watches & Accessories", icon: "bag-personal-outline" },
    { id: "jewelry", title: "Jewelry & Precious Items", icon: "diamond-stone" },
    { id: "kids_wear", title: "Kids/Baby Clothes & Gear", icon: "baby-carriage" },
];

export default function SellFashion({ navigation }) {
    const renderItem = ({ item }) => {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
                ]}
                android_ripple={{ color: COLORS.rippleGreen, borderless: false }}
                onPress={() =>
                    // Navigate to the FashionForm and pass the specific category
                    navigation.navigate("FashionForm", { 
                        category: { id: item.id, title: item.title },
                    })
                }
            >
                <LinearGradient
                    colors={[COLORS.primaryGreen, COLORS.darkGreen]} 
                    style={styles.iconWrapper}
                >
                    <Icon name={item.icon} size={24} color={COLORS.white} />
                </LinearGradient>

                <Text style={styles.cardText}>{item.title}</Text>
                <Icon name="chevron-right" size={26} color={COLORS.borderGray} />
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Gradient Header */}
            <LinearGradient
                colors={[COLORS.primaryGreen, COLORS.darkGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContainer}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sell Fashion Item</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <FlatList
                    data={fashionCategories}
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
    backBtn: { padding: 4 },
    contentContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
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
        borderLeftWidth: 5, 
        borderLeftColor: COLORS.primaryGreen,
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