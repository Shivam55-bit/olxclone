// src/screens/SellMobileForm.js
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  Animated,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker";
import { createAd } from "../../apis/adsService"; // <-- CRITICAL: Ensure this path is correct

// --- Constants ---
const DEFAULT_LATITUDE = null;
const DEFAULT_LONGITUDE = null;

// --- FloatingLabelInput Component (Updated to fix label overlap on Android) ---
const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, multiline, icon, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const animated = new Animated.Value(value ? 1 : 0);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 40,
    top: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animated.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", isFocused ? "#2e7d32" : "#999"],
    }),
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    zIndex: 1,
    // FIX: Add paddingRight to the label to prevent text from overlapping the label background when it's short.
    // Also, use elevation/shadow for the zIndex effect on Android if necessary, though zIndex usually works.
    elevation: 2, // Helps the label sit above the border/input on Android
  };

  return (
    <View
      style={[
        styles.inputContainer,
        { borderColor: isFocused ? "#2e7d32" : "#e0e0e0" },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={isFocused ? "#2e7d32" : "#999"}
          style={styles.inputIcon}
        />
      )}
      <Animated.Text style={labelStyle}>{label}{required && ' *'}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
};

// --- Main Component ---
export default function SellMobileForm({ route, navigation }) {
  // CRITICAL FIX: Ensure category object/title exists
  const category = route.params?.category || { title: "Mobile" }; 
  
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const [formData, setFormData] = useState({
    title: "",
    contact: "",
    brand: "",
    model: "",
    storage: "",
    ram: "",
    condition: "New", // Default to 'New'
    price: "", // Stored as string for TextInput
    description: "",
    features: [],
    photos: [], // will store local assets including base64
    location: "",
  });

  // FIX: Added logic to ensure 'price' is only numbers (for better UX)
  const handleChange = (key, value) => {
    if (key === 'price') {
      // Allow empty string or only digits and a single decimal point
      const cleanedValue = value.replace(/[^0-9.]/g, '');
      const finalValue = cleanedValue.includes('.')
        ? cleanedValue.substring(0, cleanedValue.indexOf('.')) + '.' + cleanedValue.substring(cleanedValue.indexOf('.') + 1).replace(/\./g, '')
        : cleanedValue;
      setFormData({ ...formData, [key]: finalValue });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };


  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const hasFeature = prev.features.includes(feature);
      return {
        ...prev,
        features: hasFeature
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  // FIX: Added removal functionality to image picker for better UX
  const removePhoto = (index) => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              photos: prev.photos.filter((_, i) => i !== index),
            }));
          }
        }
      ]
    );
  };


  const pickMedia = async () => {
    if (formData.photos.length >= 5) {
      Alert.alert("Limit Reached", "You can only select up to 5 images.");
      return;
    }

    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 5 - formData.photos.length,
      includeBase64: true, // Crucial for API submission
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      // FIX: Filter out any null/undefined assets just in case
      const newAssets = result.assets.filter(asset => asset && asset.uri); 
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newAssets],
      }));
      Alert.alert("Media Selected", `${newAssets.length} file(s) chosen ✅. Total: ${formData.photos.length + newAssets.length}`);
    } else if (result.didCancel) {
      // Optional: Give feedback if the user explicitly cancels
      console.log('Image picker cancelled');
    }
  };


  const handleSubmit = async () => {
    const { title, price, brand, model, description, location, condition, storage, ram, contact, features, photos } = formData;

    // --- 0. Check if user is logged in ---
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Login Required", "You must be logged in to post an ad. Please login first.");
        return;
      }
    } catch (e) {
      console.error("Error checking login status:", e);
    }

    // --- 1. Client-Side Validation ---
    let validationErrors = [];
    if (!title || title.length < 3) validationErrors.push("Title is required (min 3 characters).");
    // FIX: Use parseFloat for price validation
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) validationErrors.push("Price must be a valid number greater than zero.");
    if (!location) validationErrors.push("Location is required.");
    if (!description || description.length < 10) validationErrors.push("Description is required (min 10 characters).");
    // FIX: Basic validation for contact (optional, but good practice if available)
    if (contact && contact.length < 5) validationErrors.push("Contact must be at least 5 characters long (if provided)."); 
    if (!condition) validationErrors.push("Condition is required.");
    if (photos.length === 0) validationErrors.push("At least one photo is required.");

    if (validationErrors.length > 0) {
      Alert.alert("Validation Failed", validationErrors.join('\n'));
      return;
    }

    // --- 2. Base64 Conversion ---
    // FIX: Use optional chaining (`?.`) for safer access to base64 property
    const base64Images = photos.map(file => {
      if (file?.base64) {
        // Use provided type or default to image/jpeg
        const mimeType = file.type || 'image/jpeg'; 
        return `data:${mimeType};base64,${file.base64}`;
      }
      return null;
    }).filter(Boolean);

    if (base64Images.length === 0) {
      Alert.alert("Image Error", "Could not process image(s). Please ensure images were selected correctly.");
      return;
    }

    setLoading(true);

    try {
      // 🔑 3. BUILD FINAL JSON PAYLOAD matching the cURL structure
      const payload = {
        category_name: category.title, // e.g., 'Mobile'
        title,
        description,
        price: parsedPrice, // FIX: Use the validated, parsed number
        location,
        condition: condition.trim().toLowerCase(), // FIX: Send condition as lowercase
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        
        // Optional fields - only include if they have a value
        ...(brand && { brand: brand }),
        ...(model && { model: model }),
        
        images: base64Images,
        
        // ⭐ CRITICAL FIX: Details structure exactly matching your cURL
        details: {
          ...(storage && { "storage": storage }),
          ...(ram && { "RAM": ram }),
          // Ensure features is an array, even if empty
          "Features": features, 
          "Contact Number / Email": contact, 
        },
      };

      console.log("Submitting Payload:", JSON.stringify(payload, null, 2));

      // ⭐ CRITICAL FIX: CALL THE API
      const response = await createAd(payload); 

      console.log("✅ Ad created successfully:", response);
      Alert.alert("Success", `${category.title} ad posted successfully! Ad ID: ${response?.ad_id || 'N/A'}`);
      // FIX: Navigate to a success screen or back to home
      navigation.goBack(); 
    } catch (error) {
      console.error("❌ API Request Failed:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Message:", error.message);
      // FIX: Provide a more user-friendly error message
      const apiErrorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || "An unexpected error occurred."; 
      Alert.alert("Error Posting Ad", `Failed to create ad: ${apiErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
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
          <Text style={styles.headerTitle}>Sell {category.title}</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Basic Info */}
        <Text style={styles.sectionTitle}>Basic Information *</Text>
        <FloatingLabelInput
          label="Ad Title"
          value={formData.title}
          onChangeText={(text) => handleChange("title", text)}
          icon="text"
          required
        />
        <FloatingLabelInput
          label="Brand (e.g. Apple, Samsung)"
          value={formData.brand}
          onChangeText={(text) => handleChange("brand", text)}
          icon="cellphone"
        />
        <FloatingLabelInput
          label="Model (e.g. iPhone 14, Galaxy S23)"
          value={formData.model}
          onChangeText={(text) => handleChange("model", text)}
          icon="shape"
        />
        <FloatingLabelInput
          label="Storage (e.g. 128GB)"
          value={formData.storage}
          onChangeText={(text) => handleChange("storage", text)}
          icon="sd"
        />
        <FloatingLabelInput
          label="RAM (e.g. 6GB)"
          value={formData.ram}
          onChangeText={(text) => handleChange("ram", text)}
          icon="memory"
        />
        <FloatingLabelInput
          label="Condition (New / Used / Like New)"
          value={formData.condition}
          onChangeText={(text) => handleChange("condition", text)}
          icon="checkbox-marked-circle-outline"
          required
        />
        <FloatingLabelInput
          label="Price (₹)"
          keyboardType="numeric"
          value={formData.price}
          onChangeText={(text) => handleChange("price", text)}
          icon="currency-usd"
          required
        />

        {/* Features */}
        <Text style={styles.sectionTitle}>Features (Optional)</Text>
        <View style={styles.featuresGrid}>
          {["Dual SIM", "5G", "Fingerprint Sensor", "Face Unlock", "Stylus Support", "Expandable Storage"].map(
            (feature) => (
              <TouchableOpacity
                key={feature}
                style={[
                  styles.featureBtn,
                  formData.features.includes(feature) && styles.featureBtnActive,
                ]}
                onPress={() => toggleFeature(feature)}
              >
                <Text
                  style={[
                    styles.featureText,
                    formData.features.includes(feature) && styles.featureTextActive,
                  ]}
                >
                  {feature}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Photos & Videos */}
        <Text style={styles.sectionTitle}>Photos / Videos *</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickMedia}>
          <Icon name="camera-plus" size={22} color="#2e7d32" />
          <Text style={{ marginLeft: 8, color: "#2e7d32", fontWeight: "600" }}>
            Upload Media ({formData.photos.length} selected)
          </Text>
        </TouchableOpacity>
        {/* FIX: Use an inline ScrollView for horizontal display of selected photos */}
        <ScrollView horizontal style={{ marginTop: 10 }}>
          {formData.photos.map((asset, idx) => (
            <TouchableOpacity key={idx} onPress={() => removePhoto(idx)} style={{ marginRight: 8 }}>
              <Image
                source={{ uri: asset.uri }}
                style={{ width: 90, height: 90, borderRadius: 10 }}
              />
              {/* Add a small 'x' button for removal feedback */}
              <View style={styles.removePhotoBtn}>
                <Icon name="close-circle" size={20} color="red" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Location */}
        <Text style={styles.sectionTitle}>Location *</Text>
        <FloatingLabelInput
          label="Enter Location (City, State)"
          value={formData.location}
          onChangeText={(text) => handleChange("location", text)}
          icon="map-marker"
          required
        />

        {/* Description */}
        <Text style={styles.sectionTitle}>Description *</Text>
        <FloatingLabelInput
          label="Additional details about your device"
          multiline
          value={formData.description}
          onChangeText={(text) => handleChange("description", text)}
          icon="text"
          required
        />

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact</Text>
        <FloatingLabelInput
          label="Contact Number / Email"
          value={formData.contact}
          onChangeText={(text) => handleChange("contact", text)}
          icon="phone"
        />

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, loading && { opacity: 0.7 }]} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Post Ad'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Styles (Added a style for image removal) ---

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { padding: 4 },

  formContainer: { padding: 16 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 10,
    color: "#333",
  },

  // Floating Label Input
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingLeft: 40,
    paddingTop: 18,
    paddingRight: 12,
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 20,
  },
  input: {
    fontSize: 12,
    color: "#000",
    paddingVertical: 10,
    top: -6,
  },

  // Features
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  featureBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    marginRight: 8,
    marginBottom: 8,
  },
  featureBtnActive: {
    backgroundColor: "#2e7d32",
  },
  featureText: {
    fontSize: 13,
    color: "#333",
  },
  featureTextActive: {
    color: "#fff",
  },

  // Upload
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2e7d32",
    backgroundColor: "#e8f5e9",
    marginBottom: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
  },

  // Submit
  submitBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});