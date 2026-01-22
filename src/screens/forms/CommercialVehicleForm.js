// src/screens/CommercialVehicleForm.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Alert, 
    Image, 
    Platform,
    StatusBar,
    KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker"; 
import { createAd } from "../../apis/adsService"; 

// --- Constants for API Payload ---
const DEFAULT_LATITUDE = null;
const DEFAULT_LONGITUDE = null;
const DEFAULT_CONDITION = "used"; 

const commercialFeatures = {
    truck: {
        Performance: ["Diesel Engine", "Turbocharged", "High Torque", "Heavy Duty Tyres"],
        Safety: ["Air Brakes", "ABS", "Reverse Camera", "Parking Sensors"],
        Comfort: ["Power Steering", "AC Cabin", "Adjustable Seats"],
    },
    bus: {
        Safety: ["Emergency Exit", "ABS", "Speed Limiter", "First Aid Kit"],
        "Passenger Comfort": ["Recliner Seats", "AC", "LED Lights", "Charging Ports"],
        Performance: ["Diesel Engine", "Automatic Doors", "Power Steering"],
    },
    tractor: {
        Performance: ["4WD", "Turbo Engine", "High HP", "Hydraulic Lifting"],
        Implements: ["Plough", "Harvester Attachment", "Trolley Hook", "Seeder"],
        Comfort: ["Power Steering", "Driver Cabin", "Adjustable Seat"],
    },
    pickup: {
        Performance: ["Diesel Engine", "4x4 Drive", "High Payload", "Turbo Engine"],
        Safety: ["ABS", "Airbags", "Reverse Camera"],
        Comfort: ["AC", "Music System", "Power Steering"],
    },
    delivery_van: {
        Performance: ["Diesel/Petrol/CNG", "High Mileage", "Manual/Auto Transmission"],
        Safety: ["ABS", "Driver Airbag", "Rear Parking Sensors"],
        Convenience: ["Sliding Doors", "Spacious Cargo", "GPS Enabled"],
    },
    tempo: {
        Performance: ["CNG/Diesel", "High Mileage", "Compact Size"],
        Safety: ["Drum Brakes", "Strong Chassis"],
        Convenience: ["Easy Loading", "High Maneuverability"],
    },
};

// ✅ FloatingLabelInput Component
const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, icon, multiline, required = false }) => {
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
            outputRange: [15, 12],
        }),
        color: animated.interpolate({
            inputRange: [0, 1],
            outputRange: ["#999", isFocused ? "#2e7d32" : "#999"],
        }),
        backgroundColor: "#fff",
        paddingHorizontal: 4,
        zIndex: 1,
    };

    return (
        <View
            style={[
                styles.inputContainer,
                { borderColor: isFocused ? "#2e7d32" : "#ddd" },
                multiline && { height: 120 }, 
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
                style={[styles.input, multiline && { height: 100, textAlignVertical: "top", paddingTop: 0 }]} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );
};

export default function CommercialVehicleForm({ route, navigation }) {
    const { category } = route.params;
    const [loading, setLoading] = useState(false); 
    
    // ✅ FIX: Added contact field
    const [formData, setFormData] = useState({
        title: "",
        brand: "", 
        model: "", 
        price: "",
        year: "",
        mileage: "",
        fuel: "",
        transmission: "",
        capacity: "", 
        description: "", 
        condition: DEFAULT_CONDITION, 
        location: "",
        contact: "", // ✅ NEW: Contact Field
        features: [],
        photos: [], 
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
            includeBase64: true, 
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
        const { title, brand, model, price, year, mileage, fuel, transmission, capacity, description, location, contact, condition, features, photos } = formData;
        
        // 1. Client-Side Validation 
        let validationErrors = [];
        
        // Fix for "Mileage must be a valid number." error:
        const numericMileage = Number(mileage);
        if (!mileage || isNaN(numericMileage) || numericMileage < 0) { // ✅ FIX: Check if isNaN or negative
             validationErrors.push("Mileage must be a valid number greater than or equal to zero.");
        }
        
        const numericPrice = Number(price);
        if (!price || isNaN(numericPrice) || numericPrice <= 0) validationErrors.push("Price must be a valid number greater than zero.");
        if (!title || title.length < 3) validationErrors.push("Title is required (min 3 chars).");
        if (!year || year.length !== 4 || isNaN(Number(year))) validationErrors.push("Year of Manufacture must be a 4-digit number.");
        if (!location) validationErrors.push("Location is required.");
        if (!description || description.length < 10) validationErrors.push("Description is required (min 10 chars).");
        if (photos.length === 0) validationErrors.push("At least one photo is required.");

        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        // 2. Base64 Conversion
        const base64Images = photos.map(file => {
            if (file.base64) {
                const mimeType = file.type || 'image/jpeg';
                return `data:${mimeType};base64,${file.base64}`; 
            }
            return null;
        }).filter(Boolean);

        setLoading(true);

        try {
            // 3. Construct API Payload
            const payload = {
                category_name: category.title, 
                title,
                description,
                price: numericPrice,
                location,
                condition: condition.trim().toLowerCase(), 
                
                ...(brand && { brand: brand }),
                ...(model && { model: model }),
                year: Number(year),
                
                latitude: DEFAULT_LATITUDE, 
                longitude: DEFAULT_LONGITUDE,
                
                images: base64Images, 
                
                // ✅ FIX: Added Contact to details object
                details: {
                    "Mileage / KM driven": mileage || "",
                    "Fuel Type(Diesel / Petrol / CNG / Electric)": fuel || "", 
                    "Transmission(Manual / Automatic)": transmission || "",
                    "Seating / Load Capacity": capacity || "",
                    "Contact Number / Email": contact || "", // ✅ NEW: Included contact field
                    "Features": features || [], 
                },
            };

            // 4. API Call
            await createAd(payload); 

            Alert.alert("Success", `${category.title} ad posted successfully! ✅`);
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.message || "An unexpected error occurred while posting the ad.";
            Alert.alert("Error Posting Ad", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // --- Feature Rendering (Unchanged) ---
    const renderFeatures = () => {
        const featureGroups = commercialFeatures[category.id] || {};
        return Object.keys(featureGroups).map((section, idx) => (
            <View key={idx} style={styles.featureGroup}>
                <Text style={styles.sectionTitle}>{section}</Text>
                <View style={styles.featureRow}>
                    {featureGroups[section].map((feature, fIdx) => {
                        const selected = formData.features.includes(feature);
                        return (
                            <TouchableOpacity
                                key={fIdx}
                                style={[styles.featureChip, selected && styles.featureChipSelected]}
                                onPress={() => toggleFeature(feature)}
                            >
                                <Text
                                    style={[
                                        styles.featureChipText,
                                        selected && { color: "#fff" },
                                    ]}
                                >
                                    {feature}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        ));
    };


    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: "#fafafa" }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Fixed Green Header */}
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
                    <Text style={styles.headerTitle}>Post Your {category.title}</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ padding: 16, paddingTop: 10 }}
            >
                {/* Updated Floating Inputs */}
                <FloatingLabelInput
                    label="Title (e.g., Tata Truck for Sale)"
                    value={formData.title}
                    onChangeText={(text) => handleChange("title", text)}
                    icon="file-document-edit"
                    required
                />
                <FloatingLabelInput
                    label="Brand"
                    value={formData.brand}
                    onChangeText={(text) => handleChange("brand", text)}
                    icon="label"
                />
                <FloatingLabelInput
                    label="Model"
                    value={formData.model}
                    onChangeText={(text) => handleChange("model", text)}
                    icon="shape"
                />
                <FloatingLabelInput
                    label="Price"
                    value={formData.price}
                    onChangeText={(text) => handleChange("price", text)}
                    keyboardType="numeric"
                    icon="currency-inr"
                    required
                />
                <FloatingLabelInput
                    label="Year of Manufacture"
                    value={formData.year}
                    onChangeText={(text) => handleChange("year", text)}
                    keyboardType="numeric"
                    icon="calendar"
                    required
                />
                <FloatingLabelInput
                    label="Mileage / KM driven"
                    value={formData.mileage}
                    onChangeText={(text) => handleChange("mileage", text)}
                    keyboardType="numeric"
                    icon="speedometer"
                    required
                />
                <FloatingLabelInput
                    label="Fuel Type (Diesel / Petrol / CNG / Electric)"
                    value={formData.fuel}
                    onChangeText={(text) => handleChange("fuel", text)}
                    icon="gas-station"
                    required
                />
                <FloatingLabelInput
                    label="Transmission (Manual / Automatic)"
                    value={formData.transmission}
                    onChangeText={(text) => handleChange("transmission", text)}
                    icon="car-shift-pattern"
                    required
                />
                <FloatingLabelInput
                    label="Seating / Load Capacity"
                    value={formData.capacity}
                    onChangeText={(text) => handleChange("capacity", text)}
                    icon="seat"
                    required
                />
                <FloatingLabelInput
                    label="Condition (New / Used)"
                    value={formData.condition}
                    onChangeText={(text) => handleChange("condition", text)}
                    icon="information"
                    required
                />

                {/* Features */}
                <Text style={styles.sectionHeader}>Features</Text>
                {renderFeatures()}
                
                {/* Photos/Videos */}
                <Text style={styles.sectionHeader}>Photos & Videos * ({formData.photos.length}/5)</Text>
                <TouchableOpacity onPress={pickMedia} disabled={formData.photos.length >= 5}>
                    <LinearGradient
                        colors={["#43a047", "#2e7d32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.uploadBtn, formData.photos.length >= 5 && { opacity: 0.5 }]}
                    >
                        <Icon name="camera-plus" size={22} color="#fff" />
                        <Text style={styles.uploadText}>Upload Photos / Videos</Text>
                    </LinearGradient>
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
                
                {/* Description */}
                <Text style={styles.sectionHeader}>Description *</Text>
                 <FloatingLabelInput
                    label="Detailed Description of the vehicle"
                    value={formData.description}
                    onChangeText={(text) => handleChange("description", text)}
                    icon="text-box-edit"
                    multiline
                    required
                />

                {/* Location */}
                <FloatingLabelInput
                    label="Enter Location (City, State)"
                    value={formData.location}
                    onChangeText={(text) => handleChange("location", text)}
                    icon="map-marker"
                    required
                />
                
                {/* ✅ NEW: Contact Field */}
                <Text style={styles.sectionHeader}>Contact</Text>
                <FloatingLabelInput
                    label="Contact Number / Email"
                    value={formData.contact}
                    onChangeText={(text) => handleChange("contact", text)}
                    icon="phone"
                />


                {/* Submit */}
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={styles.submitBtn}
                    disabled={loading} 
                >
                    <LinearGradient
                        colors={["#43a047", "#2e7d32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.submitGradient, loading && { opacity: 0.7 }]}
                    >
                        <Text style={styles.submitText}>{loading ? 'Posting...' : 'Submit Ad'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
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

    container: { flex: 1, backgroundColor: "#fafafa" },

    // Floating Input Styles
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

    sectionHeader: {
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 12,
        color: "#2e7d32",
        borderBottomWidth: 2,
        borderBottomColor: "#a5d6a7",
        alignSelf: "flex-start",
        paddingBottom: 4,
    },
    featureGroup: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#444" },
    featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    featureChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f2f2f2",
        marginBottom: 8,
    },
    featureChipSelected: { backgroundColor: "#2e7d32" },
    featureChipText: { fontSize: 14, color: "#333" },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    uploadText: { color: "#fff", fontSize: 16, marginLeft: 8 },
    
    // New styles for photo preview
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
    // End of new styles

    submitBtn: { marginTop: 20, borderRadius: 14, overflow: "hidden" },
    submitGradient: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});