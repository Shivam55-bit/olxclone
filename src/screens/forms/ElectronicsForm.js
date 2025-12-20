import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    Animated,
    Alert, // 🔑 NEW: For user feedback
    Image, // 🔑 NEW: For photo preview
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker"; // 🔑 NEW: For image selection
import { createAd } from "../../apis/adsService"; 

// Default values for fields not in the form but required by the API
const DEFAULT_LATITUDE = null; 
const DEFAULT_LONGITUDE = null; 
const DEFAULT_YEAR = new Date().getFullYear(); 

// Category Extra Field Map for the nested 'details' object key
const categoryExtraKeyMap = {
    tv: "Screen Size(inches)",
    laptop: "Specifications",
    fridge: "Capacity(Liters)",
    washing_machine: "Type(Load)",
    ac: "Tonnage",
    camera: "Camera Type",
    microwave: "Capacity(Liters)",
};

// --- Floating Label Input (Added `required` prop) ---
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
            outputRange: ["#aaa", isFocused ? "#2e7d32" : "#999"], // Added isFocused logic
        }),
        backgroundColor: "#fff",
        paddingHorizontal: 4,
        zIndex: 1,
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
            {/* Added required indicator to the label */}
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

// --- Category Features (Unchanged) ---
const categoryFeatures = {
    tv: ["Smart TV", "4K Resolution", "HDR", "Wall Mount Included"],
    laptop: ["Touchscreen", "Backlit Keyboard", "Dedicated Graphics", "Fingerprint Sensor"],
    fridge: ["Double Door", "Frost Free", "Inverter", "Water Dispenser"],
    washing_machine: ["Fully Automatic", "Front Load", "Inverter Motor", "Quick Wash"],
    ac: ["Inverter AC", "Split AC", "Energy Efficient", "Remote Control"],
    camera: ["WiFi", "4K Video", "Interchangeable Lens", "Image Stabilization"],
    microwave: ["Convection", "Grill Option", "Child Lock", "Defrost Function"],
};

// --- Main Component ---
export default function ElectronicsForm({ route, navigation }) {
    const { category } = route.params;
    const [loading, setLoading] = useState(false); // 🔑 NEW: Loading state

    const [formData, setFormData] = useState({
        title: "",
        brand: "",
        model: "", // 🔑 NEW: Added model field
        price: "",
        condition: "New", // Default condition
        location: "",
        description: "",
        contact: "",
        extra: "", // Category-specific field data
        features: [],
        photos: [], // 🔑 NEW: Array to store image assets
    });

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const toggleFeature = (feature) => {
        setFormData((prev) => {
            const exists = prev.features.includes(feature);
            return {
                ...prev,
                features: exists
                    ? prev.features.filter((f) => f !== feature)
                    : [...prev.features, feature],
            };
        });
    };
    
    // --- Image Picker Logic ---
    const pickMedia = async () => {
        if (formData.photos.length >= 5) {
            Alert.alert("Limit Reached", "You can only select up to 5 images.");
            return;
        }

        const result = await launchImageLibrary({ 
            mediaType: "photo", 
            selectionLimit: 5 - formData.photos.length, 
            includeBase64: true, // CRITICAL: Get Base64 for the API
            quality: 0.8,
        });

        if (!result.didCancel && result.assets) {
            setFormData((prev) => ({
                ...prev,
                photos: [...prev.photos, ...result.assets],
            }));
        }
    };
    
    const removePhoto = (uri) => {
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter(p => p.uri !== uri),
        }));
    };

    // --- API Submission Logic ---
    const handleSubmit = async () => {
        const { title, price, brand, model, description, location, condition, extra, contact, features, photos } = formData;
        
        // 1. Client-Side Validation 
        let validationErrors = [];
        if (!title || title.length < 3) validationErrors.push("Product Title is required (min 3 chars).");
        if (!price || Number(price) <= 0 || isNaN(Number(price))) validationErrors.push("Price must be a valid number greater than zero.");
        if (!location) validationErrors.push("Location is required.");
        if (!description || description.length < 10) validationErrors.push("Description is required (min 10 chars).");
        if (!condition) validationErrors.push("Condition is required.");
        if (photos.length === 0) validationErrors.push("At least one photo is required.");

        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        // 2. Base64 Conversion
        const base64Images = photos.map(file => {
            if (file.base64) {
                const mimeType = file.type || 'image/jpeg';
                // CRITICAL: Prefix with mime type for full Base64 format
                return `data:${mimeType};base64,${file.base64}`; 
            }
            return null;
        }).filter(Boolean);

        setLoading(true);

        try {
            // 3. Construct API Payload
            const detailsKey = categoryExtraKeyMap[category.id];
            // Build the dynamic part of the 'details' object
            const dynamicDetail = detailsKey && extra ? { [detailsKey]: extra } : {};

            const payload = {
                category_name: category.title,
                title,
                description,
                price: Number(price),
                location,
                
                // CRITICAL FIX: Ensure condition is lowercase as required by typical FastAPI backends
                condition: condition.trim().toLowerCase(), 
                
                // Default/Optional fields
                latitude: DEFAULT_LATITUDE, 
                longitude: DEFAULT_LONGITUDE,
                year: DEFAULT_YEAR, 
                
                ...(brand && { brand: brand }),
                ...(model && { model: model }),
                
                images: base64Images, 
                
                // CRITICAL FIX: Nested 'details' object
                details: {
                    ...dynamicDetail,
                    "Contact Number / Email": contact || "",
                    "Features": features || [],
                },
            };

            // 4. API Call
            await createAd(payload); 

            Alert.alert("Success", `${category.title} ad posted successfully! ✅`);
            navigation.goBack();
        } catch (error) {
            // The error.message is automatically formatted by the api.js interceptor
            const errorMessage = error.message || "An unexpected error occurred while posting the ad.";
            Alert.alert("Error Posting Ad", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // --- Category-specific field rendering (Unchanged) ---
    const renderExtraField = () => {
        const key = category.id;
        const labelMap = {
            "tv": "Screen Size (inches)",
            "laptop": "Specifications (RAM, SSD, Processor)",
            "fridge": "Capacity (Liters)",
            "washing_machine": "Type (Front/Top Load)",
            "ac": "Tonnage (1.5 Ton, 2 Ton, etc.)",
            "camera": "Camera Type (DSLR, Mirrorless, etc.)",
            "microwave": "Capacity (Liters)",
        };
        const iconMap = {
            "tv": "television", "laptop": "laptop", "fridge": "fridge", "washing_machine": "washing-machine", 
            "ac": "air-conditioner", "camera": "camera", "microwave": "microwave",
        };

        if (!labelMap[key]) return null;

        return (
            <FloatingLabelInput
                label={labelMap[key]}
                value={formData.extra}
                onChangeText={(t) => handleChange("extra", t)}
                icon={iconMap[key]}
            />
        );
    };

    // --- Render Features List (Unchanged) ---
    const renderFeatures = () => {
        const features = categoryFeatures[category.id] || [];
        if (!features.length) return null;

        return (
            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Features</Text>
                {features.map((feature, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[
                            styles.featureItem,
                            formData.features.includes(feature) && styles.featureItemSelected,
                        ]}
                        onPress={() => toggleFeature(feature)}
                    >
                        <Icon
                            name={
                                formData.features.includes(feature)
                                    ? "check-circle"
                                    : "checkbox-blank-circle-outline"
                            }
                            size={22}
                            color={formData.features.includes(feature) ? "#2e7d32" : "#777"}
                        />
                        <Text
                            style={[
                                styles.featureText,
                                formData.features.includes(feature) && { color: "#2e7d32", fontWeight: "600" },
                            ]}
                        >
                            {feature}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // --- JSX Rendering ---
    return (
        <View style={{ flex: 1, backgroundColor: "#f4f9f4" }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Gradient Header */}
            <LinearGradient
                colors={["#388e3c", "#1b5e20"]}
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

            {/* Form */}
            <ScrollView contentContainerStyle={styles.formContainer}>
                <FloatingLabelInput
                    label="Product Title"
                    value={formData.title}
                    onChangeText={(t) => handleChange("title", t)}
                    icon="tag"
                    required
                />
                <FloatingLabelInput
                    label="Brand"
                    value={formData.brand}
                    onChangeText={(t) => handleChange("brand", t)}
                    icon="label"
                />
                <FloatingLabelInput
                    label="Model"
                    value={formData.model}
                    onChangeText={(t) => handleChange("model", t)}
                    icon="shape"
                />
                <FloatingLabelInput
                    label="Price"
                    value={formData.price}
                    onChangeText={(t) => handleChange("price", t)}
                    keyboardType="numeric"
                    icon="currency-usd"
                    required
                />
                <FloatingLabelInput
                    label="Condition (New / Used)"
                    value={formData.condition}
                    onChangeText={(t) => handleChange("condition", t)}
                    icon="information"
                    required
                />
                <FloatingLabelInput
                    label="Location (City, State)"
                    value={formData.location}
                    onChangeText={(t) => handleChange("location", t)}
                    icon="map-marker"
                    required
                />

                {/* Category-Specific Field */}
                {renderExtraField()}

                {/* Features Section */}
                {renderFeatures()}

                {/* Photos / Videos Section */}
                <Text style={styles.sectionTitle}>Photos / Videos * ({formData.photos.length}/5)</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickMedia}>
                    <Icon name="camera-plus" size={22} color="#2e7d32" />
                    <Text style={styles.uploadText}>Upload Photos / Videos</Text>
                </TouchableOpacity>

                {/* Photo Preview */}
                <ScrollView horizontal style={{ marginBottom: 20 }}>
                    {formData.photos.map((asset, idx) => (
                        <TouchableOpacity key={idx} onPress={() => removePhoto(asset.uri)} style={styles.photoPreviewItem}>
                            <Image
                                source={{ uri: asset.uri }}
                                style={styles.photoImage}
                            />
                            <View style={styles.removePhotoBtn}>
                                <Icon name="close-circle" size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Description *</Text>
                <FloatingLabelInput
                    label="Additional details about your device"
                    multiline
                    value={formData.description}
                    onChangeText={(t) => handleChange("description", t)}
                    icon="text"
                    required
                />
                <Text style={styles.sectionTitle}>Contact</Text>
                <FloatingLabelInput
                    label="Contact Number / Email"
                    value={formData.contact}
                    onChangeText={(t) => handleChange("contact", t)}
                    icon="phone"
                />

                {/* Submit Button */}
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={styles.submitBtn}
                    disabled={loading} // Disable button while loading
                >
                    <LinearGradient
                        colors={["#43a047", "#1b5e20"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.submitGradient, loading && { opacity: 0.7 }]}
                    >
                        <Text style={styles.submitText}>{loading ? 'Posting...' : 'Post Ad'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// --- Styles (Added Photo Preview Styles) ---
const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: STATUSBAR_HEIGHT,
        paddingBottom: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        flex: 1,
        textAlign: "center",
    },
    backBtn: { padding: 6 },
    formContainer: { padding: 16 },
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
    featuresContainer: {
        marginBottom: 14,
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dfe6e9",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
        color: "#1b5e20",
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 8,
    },
    featureItemSelected: {
        backgroundColor: "#f1f8f4",
    },
    featureText: {
        marginLeft: 10,
        fontSize: 15,
        color: "#444",
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f8f4",
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#d0e8d0",
    },
    uploadText: {
        marginLeft: 10,
        color: "#2e7d32",
        fontWeight: "600",
    },
    photoPreviewItem: {
        marginRight: 10, 
        position: 'relative',
    },
    photoImage: {
        width: 80, 
        height: 80, 
        borderRadius: 10,
    },
    removePhotoBtn: {
        position: 'absolute', 
        top: -5, 
        right: -5, 
        backgroundColor: 'rgba(255, 0, 0, 0.9)', 
        borderRadius: 10,
        padding: 1,
    },
    submitBtn: {
        borderRadius: 14,
        overflow: "hidden",
        elevation: 2,
        marginTop: 20,
        marginBottom: 40,
    },
    submitGradient: {
        padding: 15,
        alignItems: "center",
        borderRadius: 14,
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});