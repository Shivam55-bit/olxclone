import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
    Animated,
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { launchImageLibrary } from "react-native-image-picker";
import { createAd } from "../../apis/adsService"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 

// --- DATA: Bike Features and Dynamic Detail Field Labels ---
const bikeFeatures = {
    motorbike: ["ABS", "Disc Brakes", "Alloy Wheels", "Electric Start"],
    scooter: ["Tubeless Tyres", "Mobile Charging Port", "Digital Meter", "Self Start"],
    bicycle: ["Gear System", "Disc Brakes", "Lightweight Frame", "Shock Absorbers"],
};

const extraFieldLabels = {
    // Ensuring these labels are what the backend uses as keys in 'details'
    motorbike: "Engine Capacity (cc)",
    scooter: "Engine / Mileage",
    bicycle: "Frame Size / Gear Type",
};

// --- CORRECTED COMPONENT: ConditionPicker ---
const ConditionPicker = ({ value, onChangeText, required = false }) => {
    // The visual labels for the user. We will map them to lowercase strings (new, like_new, etc.)
    const options = ["New", "Like_New", "Good", "Fair", "Poor"];

    return (
        <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Condition {required && '*'} </Text>
            <View style={styles.pickerOptions}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.pickerItem,
                            value.toLowerCase() === option.toLowerCase() && styles.pickerItemSelected,
                            { flex: 1 / options.length } 
                        ]}
                        onPress={() => onChangeText(option)}
                    >
                        <Text style={[
                            styles.pickerText,
                            value.toLowerCase() === option.toLowerCase() && styles.pickerTextSelected,
                        ]}>
                            {option.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// --- FloatingLabelInput component (Unchanged) ---
const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, multiline, icon, maxLength, required }) => {
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
        top: animated.interpolate({ inputRange: [0, 1], outputRange: [18, -8] }),
        fontSize: animated.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
        color: animated.interpolate({ inputRange: [0, 1], outputRange: ["#aaa", isFocused ? "#2e7d32" : "#999"] }),
        backgroundColor: "#fff",
        paddingHorizontal: 4,
        zIndex: 1,
    };

    return (
        <View style={[styles.inputContainer, { borderColor: isFocused ? "#2e7d32" : "#c8e6c9" }]}>
            {icon && <Icon name={icon} size={20} color={isFocused ? "#2e7d32" : "#999"} style={styles.inputIcon} />}
            <Animated.Text style={labelStyle}>{label}{required && ' *'}</Animated.Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                multiline={multiline}
                maxLength={maxLength}
            />
        </View>
    );
};


export default function BikeForm({ route, navigation }) {
    const { category } = route.params; 
    const [loading, setLoading] = useState(false);

    const DEFAULT_LATITUDE = null; 
    const DEFAULT_LONGITUDE = null; 

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [formData, setFormData] = useState({
        title: "",
        brand: "",
        model: "",
        year: "",
        price: "",
        condition: "", 
        location: "",
        description: "",
        contact: "", 
        extra: "", 
        features: [],
        mediaAssets: [], 
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

    const handleMediaPick = async () => {
        if (formData.mediaAssets.length >= 5) {
            Alert.alert("Limit Reached", "You can only select up to 5 images.");
            return;
        }
        
        const result = await launchImageLibrary({ 
            mediaType: "photo", 
            selectionLimit: 5 - formData.mediaAssets.length, 
            includeBase64: true, 
        });

        if (!result.didCancel && result.assets) {
            setFormData(prev => ({ ...prev, mediaAssets: [...prev.mediaAssets, ...result.assets] }));
            Alert.alert("Media Selected", `${result.assets.length} file(s) chosen ✅. Total: ${formData.mediaAssets.length + result.assets.length}`);
        }
    };

    const handleSubmit = async () => {
        const { title, price, brand, model, description, location, condition, year, contact, mediaAssets, extra, features } = formData;

        // --- 1. Client-Side Validation (Unchanged) ---
        let validationErrors = [];
        if (!title || title.length < 3 || title.length > 100) validationErrors.push("Title must be 3-100 characters.");
        if (!description || description.length < 10 || description.length > 2000) validationErrors.push("Description must be 10-2000 characters.");
        
        const numericPrice = Number(price);
        if (!price || isNaN(numericPrice) || numericPrice <= 0) validationErrors.push("Price is required and must be a number greater than 0.");
        
        if (!location || location.length < 2 || location.length > 100) validationErrors.push("Location must be 2-100 characters.");
        
        if (!condition) validationErrors.push("Condition is required.");

        if (mediaAssets.length === 0) validationErrors.push("At least one image must be uploaded.");

        const numericYear = Number(year);
        if (year && (isNaN(numericYear) || numericYear < 1900 || numericYear > 2030)) validationErrors.push("Year must be a number between 1900 and 2030.");
        if (brand.length > 50) validationErrors.push("Brand cannot exceed 50 characters.");
        if (model.length > 50) validationErrors.push("Model cannot exceed 50 characters.");


        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        // --- 2. Data Conversion & Base64 ---
        
        const base64Images = mediaAssets.map(file => {
            if (file.base64) {
                const mimeType = file.type || 'image/jpeg';
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
            const extraDetailKey = extraFieldLabels[category.id] || "Extra Details";
            
            // 🔑 3. BUILD FINAL JSON PAYLOAD
            const payload = {
                category_name: category.title,
                title,
                description,
                price: numericPrice,
                
                // ⭐ CRITICAL FIX: Sending condition in lowercase, as shown in the cURL.
                condition: condition.trim().toLowerCase().replace(/_/g, ''), 
                
                location,
                
                latitude: DEFAULT_LATITUDE, 
                longitude: DEFAULT_LONGITUDE,
                
                ...(brand && { brand: brand }),
                ...(model && { model: model }),
                ...(numericYear && { year: numericYear }),
                
                images: base64Images, 
                
                // ⭐ CRITICAL FIX: Ensuring keys match cURL/backend expectation
                details: {
                    // This maps to {"Engine Capacity (cc)": "200CC"} in your cURL
                    ...(extra && { [extraDetailKey]: extra }),
                    
                    // This maps to {"Features": []} in your cURL
                    "Features": features || [],
                    
                    // This maps to {"Contact Number / Email": "8239218314"} in your cURL
                    "Contact Number / Email": contact || "", 
                },
            };

            console.log("Submitting Payload:", payload);
            
            // ⭐ API CALL IS ACTIVE
            await createAd(payload); 

            Alert.alert("Success", `${category.title} ad posted successfully! ✅`);
            navigation.goBack(); 
        } catch (error) {
            console.error("API Request Failed:", error); 
            const errorMessage = error.message || "An unexpected error occurred while posting the ad.";
            
            if (errorMessage.includes("User not logged in")) {
                 Alert.alert("Authentication Required", "Your session has expired or you are not logged in. Please log in and try again.");
            } else {
                 Alert.alert("Error Posting Ad", errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderExtraField = () => {
        const label = extraFieldLabels[category.id] || "Extra Details";
        let keyboardType = "default";
        if (category.id === "motorbike" || category.id === "scooter") {
            keyboardType = "numeric";
        }
        
        return (
            <FloatingLabelInput 
                label={label} 
                value={formData.extra} 
                onChangeText={(t) => handleChange("extra", t)} 
                keyboardType={keyboardType} 
                icon={category.id === 'bicycle' ? "bike" : "speedometer"} 
            />
        );
    };

    const renderFeatures = () => {
        const features = bikeFeatures[category.id] || [];
        if (!features.length) return null;

        return (
            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>Features (Optional)</Text>
                {features.map((feature, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.featureItem, formData.features.includes(feature) && styles.featureItemSelected]}
                        onPress={() => toggleFeature(feature)}
                    >
                        <Icon
                            name={formData.features.includes(feature) ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={22}
                            color={formData.features.includes(feature) ? "#2e7d32" : "#777"}
                        />
                        <Text style={[styles.featureText, formData.features.includes(feature) && { color: "#2e7d32", fontWeight: "600" }]}>
                            {feature}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#f4f9f4" }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient colors={["#43a047", "#1b5e20"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sell {category.title}</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <FloatingLabelInput label="Ad Title" value={formData.title} onChangeText={(t) => handleChange("title", t)} icon="text" maxLength={100} required />
                <FloatingLabelInput label="Brand (Optional)" value={formData.brand} onChangeText={(t) => handleChange("brand", t)} icon="tag" maxLength={50} />
                <FloatingLabelInput label="Model (Optional)" value={formData.model} onChangeText={(t) => handleChange("model", t)} icon="dots-horizontal" maxLength={50} />
                <FloatingLabelInput label="Year (Optional: 1900-2030)" keyboardType="numeric" value={formData.year} onChangeText={(t) => handleChange("year", t)} icon="calendar" maxLength={4} />
                <FloatingLabelInput label="Price (₹)" keyboardType="numeric" value={formData.price} onChangeText={(t) => handleChange("price", t)} icon="currency-usd" required />
                
                {/* CONDITION PICKER */}
                <ConditionPicker value={formData.condition} onChangeText={(t) => handleChange("condition", t)} required />
                
                <FloatingLabelInput label="Location (City, State)" value={formData.location} onChangeText={(t) => handleChange("location", t)} icon="map-marker" maxLength={100} required />
                
                {renderExtraField()}
                {renderFeatures()}

                <TouchableOpacity style={styles.uploadBtn} onPress={handleMediaPick}>
                    <Icon name="camera-plus" size={22} color="#2e7d32" />
                    <Text style={styles.uploadText}>Upload Photos ({formData.mediaAssets.length} selected) *</Text>
                </TouchableOpacity>

                <FloatingLabelInput label="Description" value={formData.description} onChangeText={(t) => handleChange("description", t)} multiline icon="note-text" maxLength={2000} required />
                <FloatingLabelInput label="Contact Number / Email" value={formData.contact} onChangeText={(t) => handleChange("contact", t)} keyboardType="email-address" icon="account" />

                <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, loading && { opacity: 0.7 }]} disabled={loading}>
                    <LinearGradient colors={["#43a047", "#1b5e20"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                        <Text style={styles.submitText}>{loading ? 'Posting...' : 'Post Ad'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
    headerContainer: { paddingTop: STATUSBAR_HEIGHT, paddingBottom: 14, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 4 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center" },
    backBtn: { padding: 4 },
    formContainer: { padding: 16 },
    // --- Condition Picker Styles ---
    pickerContainer: { marginBottom: 20, paddingHorizontal: 4, paddingTop: 12 },
    pickerLabel: { fontSize: 13, color: "#2e7d32", fontWeight: '600', marginBottom: 8, paddingLeft: 4 },
    pickerOptions: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#c8e6c9' },
    pickerItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, marginHorizontal: 2 }, 
    pickerItemSelected: { backgroundColor: '#43a047', elevation: 2 },
    pickerText: { color: '#444', fontWeight: '500', fontSize: 12, textAlign: 'center' }, 
    pickerTextSelected: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
    // --- Existing Styles ---
    inputContainer: { marginBottom: 20, borderWidth: 1, borderRadius: 12, backgroundColor: "#fff", paddingLeft: 40, paddingTop: 18, paddingRight: 12, justifyContent: "center" },
    inputIcon: { position: "absolute", left: 12, top: 20, zIndex: 0 },
    input: { fontSize: 15, color: "#000", paddingVertical: 12, top: -10, zIndex: 0 },
    featuresContainer: { marginBottom: 14, backgroundColor: "#fff", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#c8e6c9" },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#1b5e20" },
    featureItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8 },
    featureItemSelected: { backgroundColor: "#e8f5e9" },
    featureText: { marginLeft: 10, fontSize: 15, color: "#444" },
    uploadBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#e8f5e9", padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: "#a5d6a7" },
    uploadText: { marginLeft: 10, color: "#2e7d32", fontWeight: "600" },
    submitBtn: { borderRadius: 16, overflow: "hidden", elevation: 3, marginTop: 20, marginBottom: 40, opacity: 1 },
    submitGradient: { padding: 16, alignItems: "center", borderRadius: 16 },
    submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});