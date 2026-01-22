// src/screens/CarForm.js
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
import { launchImageLibrary } from "react-native-image-picker"; // Use launchImageLibrary
import { createAd } from "../../apis/adsService"; // <-- CRITICAL: Ensure this path is correct

// --- Helper Functions and Components (Moved for clarity) ---

const DEFAULT_LATITUDE = null; 
const DEFAULT_LONGITUDE = null; 

// FloatingLabelInput Component (Unchanged, included below styles)

// ConditionPicker Component (Simplified for CarForm)
const ConditionPicker = ({ value, onChangeText }) => (
    <View style={styles.conditionContainer}>
        {["New", "Old"].map((c) => (
            <TouchableOpacity
                key={c}
                style={[
                    styles.conditionBtn,
                    value === c && styles.conditionBtnActive,
                ]}
                onPress={() => onChangeText(c)}
            >
                <Text
                    style={[
                        styles.conditionText,
                        value === c && styles.conditionTextActive,
                    ]}
                >
                    {c}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

// --- Main Component ---
export default function CarForm({ route, navigation }) {
    const { category } = route.params;
    const [loading, setLoading] = useState(false);
    
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // ⭐ CRITICAL: Added 'title' and 'contact' to match API requirements
    const [formData, setFormData] = useState({
        title: "", // Required by API, added
        brand: "",
        model: "",
        year: "",
        price: "",
        mileage: "",
        description: "",
        location: "",
        contact: "", // Required by API, added
        
        condition: "New", 
        features: [],
        photos: [], // will store local assets including base64
    });

    const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

    const toggleFeature = (feature) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const pickMedia = async () => {
        if (formData.photos.length >= 5) {
            Alert.alert("Limit Reached", "You can only select up to 5 images.");
            return;
        }
        
        // ⭐ CRITICAL: Requesting Base64 data for API submission
        const result = await launchImageLibrary({ 
            mediaType: "photo", 
            selectionLimit: 5 - formData.photos.length, 
            includeBase64: true, 
        });

        if (!result.didCancel && result.assets) {
            setFormData(prev => ({ 
                ...prev, 
                photos: [...prev.photos, ...result.assets] 
            }));
             Alert.alert("Media Selected", `${result.assets.length} file(s) chosen ✅. Total: ${formData.photos.length + result.assets.length}`);
        }
    };


    const handleSubmit = async () => {
        const { title, price, brand, model, year, description, location, condition, mileage, features, photos, contact } = formData;
        
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
        
        // --- 1. Client-Side Validation (Minimal check) ---
        let validationErrors = [];
        if (!title || title.length < 3) validationErrors.push("Title is required (min 3 characters).");
        if (!price || Number(price) <= 0) validationErrors.push("Price must be greater than zero.");
        if (!location) validationErrors.push("Location is required.");
        if (!description || description.length < 10) validationErrors.push("Description is required (min 10 characters).");
        if (photos.length === 0) validationErrors.push("At least one photo is required.");
        
        // Only require mileage if the condition is 'Old'
        if (condition === 'Old' && (!mileage || Number(mileage) <= 0)) validationErrors.push("Mileage is required for used cars.");

        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        // --- 2. Base64 Conversion ---
        const base64Images = photos.map(file => {
            if (file.base64) {
                const mimeType = file.type || 'image/jpeg';
                // ⭐ CRITICAL: Format image as required by API
                return `data:${mimeType};base64,${file.base64}`; 
            }
            return null; 
        }).filter(Boolean);
        
        if (base64Images.length === 0) {
             Alert.alert("Image Error", "Could not process image(s). Please try re-selecting.");
             return;
        }

        setLoading(true);

        try {
            // 🔑 3. BUILD FINAL JSON PAYLOAD matching the cURL structure
            const payload = {
                category_name: category.title,
                title,
                description,
                price: Number(price),
                location,
                
                // ⭐ CRITICAL FIX: Sending condition as lowercase as per your cURL
                condition: condition.trim().toLowerCase(), 
                
                latitude: DEFAULT_LATITUDE, 
                longitude: DEFAULT_LONGITUDE,
                
                // Optional fields
                ...(brand && { brand: brand }),
                ...(model && { model: model }),
                ...(Number(year) && { year: Number(year) }),
                
                images: base64Images, 
                
                // ⭐ CRITICAL FIX: Details structure exactly matching your cURL
                details: {
                    // Mileage only goes into details if condition is 'Old'
                    ...(condition.toLowerCase() === 'old' && mileage && { "Mileage": mileage }),
                    
                    // Features and Contact must be included, even if empty/null
                    "Features": features || [], 
                    "Contact Number / Email": contact || "",
                },
            };

            console.log("Submitting Payload:", payload);
            
            // ⭐ CRITICAL FIX: CALL THE API
            const response = await createAd(payload);

            console.log("✅ Ad created successfully:", response);
            Alert.alert("Success", `${category.title} ad posted successfully! ✅`);
            navigation.goBack();
        } catch (error) {
            console.error("❌ API Request Failed:", error); 
            console.error("Error Response:", error.response?.data);
            console.error("Error Message:", error.message);
            // The message here comes from the api.js interceptor
            const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message || "An unexpected error occurred while posting the ad.";
            
            Alert.alert("Error Posting Ad", errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ... (Rest of the rendering logic) ...

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: "#f4f9f4" }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            {/* ✅ Gradient Header */}
            <LinearGradient
                colors={["#43a047", "#1b5e20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContainer}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Icon name="arrow-left" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sell {category.title}</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>

            {/* ✅ Form Fields */}
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.sectionTitle}>Basic Information (Required)</Text>

                <FloatingLabelInput
                    label="Ad Title"
                    value={formData.title}
                    onChangeText={(t) => handleChange("title", t)}
                    icon="text"
                    required
                />
                <FloatingLabelInput
                    label="Brand (e.g. Toyota, BMW)"
                    value={formData.brand}
                    onChangeText={(t) => handleChange("brand", t)}
                    icon="car"
                />
                <FloatingLabelInput
                    label="Model (e.g. Corolla, X5)"
                    value={formData.model}
                    onChangeText={(t) => handleChange("model", t)}
                    icon="car-sports"
                />
                <FloatingLabelInput
                    label="Year"
                    keyboardType="numeric"
                    value={formData.year}
                    onChangeText={(t) => handleChange("year", t)}
                    icon="calendar"
                />
                <FloatingLabelInput
                    label="Price (₹)"
                    keyboardType="numeric"
                    value={formData.price}
                    onChangeText={(t) => handleChange("price", t)}
                    icon="currency-usd"
                    required
                />

                {/* ✅ Condition */}
                <Text style={styles.sectionTitle}>Condition *</Text>
                <ConditionPicker 
                    value={formData.condition} 
                    onChangeText={(c) => {
                        setFormData({
                            ...formData,
                            condition: c,
                            mileage: c === "New" ? "" : formData.mileage,
                        });
                    }}
                />

                {/* ✅ Only show Mileage if condition is Old */}
                {formData.condition === "Old" && (
                    <FloatingLabelInput
                        label="Mileage (km driven)"
                        keyboardType="numeric"
                        value={formData.mileage}
                        onChangeText={(t) => handleChange("mileage", t)}
                        icon="counter"
                        required
                    />
                )}

                {/* Features */}
                <Text style={styles.sectionTitle}>Features (Optional)</Text>
                <View style={styles.featuresGrid}>
                    {[
                        "Air Conditioning", "Sunroof", "Bluetooth", "Leather Seats",
                        "Navigation", "Backup Camera",
                    ].map((feature) => (
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
                                    formData.features.includes(feature) &&
                                        styles.featureTextActive,
                                ]}
                            >
                                {feature}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Photos */}
                <Text style={styles.sectionTitle}>Photos / Videos *</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickMedia}>
                    <Icon name="camera-plus" size={22} color="#2e7d32" />
                    <Text style={{ marginLeft: 8, color: "#2e7d32", fontWeight: "600" }}>
                        Upload Media ({formData.photos.length} selected)
                    </Text>
                </TouchableOpacity>
                <ScrollView horizontal style={{ marginTop: 10 }}>
                    {formData.photos.map((asset, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: asset.uri }}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 10,
                                marginRight: 8,
                            }}
                        />
                    ))}
                </ScrollView>

                {/* Location */}
                <Text style={styles.sectionTitle}>Location *</Text>
                <FloatingLabelInput
                    label="Enter Location (City, State)"
                    value={formData.location}
                    onChangeText={(t) => handleChange("location", t)}
                    icon="map-marker"
                    required
                />

                {/* Description */}
                <Text style={styles.sectionTitle}>Description *</Text>
                <FloatingLabelInput
                    label="Additional details about your car"
                    value={formData.description}
                    onChangeText={(t) => handleChange("description", t)}
                    multiline
                    icon="text"
                    required
                />
                
                {/* Contact */}
                <Text style={styles.sectionTitle}>Contact</Text>
                <FloatingLabelInput
                    label="Contact Number / Email"
                    value={formData.contact}
                    onChangeText={(t) => handleChange("contact", t)}
                    keyboardType="email-address"
                    icon="phone"
                />

                {/* Submit Button */}
                <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, loading && { opacity: 0.7 }]} disabled={loading}>
                    <LinearGradient
                        colors={["#43a047", "#1b5e20"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Post Ad'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// --- FloatingLabelInput Component (Included for completeness) ---
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  icon,
  required = false,
  editable = true,
}) => {
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
      outputRange: ["#aaa", "#2e7d32"],
    }),
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View
      style={[
        styles.inputContainer,
        { borderColor: isFocused ? "#2e7d32" : "#c8e6c9" },
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
        style={[
          styles.input,
          multiline && { height: 100, textAlignVertical: "top" },
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
      />
    </View>
  );
};


// --- Styles (Unchanged) ---

const STATUSBAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { padding: 4 },

  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 10,
    color: "#1b5e20",
  },

  // Floating input
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
    fontSize: 15,
    color: "#000",
    paddingVertical: 12,
    top: -10,
  },

  // Condition
  conditionContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  conditionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a5d6a7",
    backgroundColor: "#f1f8f4",
    marginRight: 10,
  },
  conditionBtnActive: {
    backgroundColor: "#2e7d32",
  },
  conditionText: {
    fontSize: 14,
    color: "#333",
  },
  conditionTextActive: {
    color: "#fff",
    fontWeight: "700",
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
    backgroundColor: "#f1f8f4",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#a5d6a7",
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
    fontWeight: "600",
  },

  // Upload
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a5d6a7",
    backgroundColor: "#e8f5e9",
    marginBottom: 8,
  },

  // Submit
  submitBtn: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    marginTop: 20,
    marginBottom: 40,
  },
  submitGradient: {
    padding: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});