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
    Platform,
    StatusBar,
    Image,
    FlatList,
    KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import * as ImagePicker from 'react-native-image-picker'; 
import { createAd } from "../../apis/adsService"; 

// --- Color Palette (Refined Green) ---
const COLORS = {
    primaryGreen: "#28a745", // A vibrant green
    darkGreen: "#218838", // Slightly darker for gradients
    lightGreen: "#d4edda", // Very light green for backgrounds/accents
    textGreen: "#155724", // Dark green for text on light backgrounds
    gray: "#e0e0e0", // Border color
    darkGray: "#999", // Icon color
    blue: "#1e88e5", // Accent blue (if needed, but keeping green focused)
    white: "#fff",
    black: "#000",
    red: "#dc3545", // For errors
};

// --- Dynamic Field Configuration (UPDATED for rich property details) ---
const propertyFields = {
    apartment: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "carpet_area_sqft", label: "Carpet Area (Sq. Ft.)", icon: "ruler-square", keyboardType: "numeric", required: true },
        { key: "super_area_sqft", label: "Super Built-up Area (Sq. Ft.)", icon: "ruler-square-compass", keyboardType: "numeric", required: false },
        { key: "bedrooms", label: "Bedrooms (BHK)", icon: "bed-king-outline", keyboardType: "numeric", required: true },
        { key: "bathrooms", label: "Bathrooms", icon: "shower", keyboardType: "numeric", required: true },
        { key: "floor_no", label: "Floor Number", icon: "stairs", keyboardType: "numeric", required: true },
        { key: "total_floors", label: "Total Floors in Building", icon: "layers-triple", keyboardType: "numeric", required: false },
        { key: "furnishing", label: "Furnishing (Furnished/Unfurnished)", icon: "sofa", required: true },
        { key: "construction_status", label: "Construction Status", icon: "hammer-screwdriver", required: true },
        { key: "listed_by", label: "Listed By (Owner/Agent/Builder)", icon: "account-box", required: true },
        { key: "maintenance_fee", label: "Maintenance (Monthly INR)", icon: "currency-inr", keyboardType: "numeric", required: false },
        { key: "car_parking", label: "Car Parking (Yes/No)", icon: "car-multiple", required: false },
        { key: "facing", label: "Facing Direction (e.g., East)", icon: "compass", required: false },
    ],
    house: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "carpet_area_sqft", label: "Carpet Area (Sq. Ft.)", icon: "ruler-square", keyboardType: "numeric", required: true },
        { key: "super_area_sqft", label: "Super Built-up Area (Sq. Ft.)", icon: "ruler-square-compass", keyboardType: "numeric", required: true },
        { key: "bedrooms", label: "Bedrooms (BHK)", icon: "bed-king-outline", keyboardType: "numeric", required: true },
        { key: "bathrooms", label: "Bathrooms", icon: "shower", keyboardType: "numeric", required: true },
        { key: "total_floors", label: "Total Floors in House", icon: "layers-triple", keyboardType: "numeric", required: true },
        { key: "floor_no", label: "Floor Number", icon: "stairs", keyboardType: "numeric", required: false },
        { key: "furnishing", label: "Furnishing (Furnished/Unfurnished)", icon: "sofa", required: true },
        { key: "construction_status", label: "Construction Status", icon: "hammer-screwdriver", required: true },
        { key: "possession", label: "Possession Status (Ready/Under Construction)", icon: "home-city", required: true },
        { key: "listed_by", label: "Listed By (Owner/Agent/Builder)", icon: "account-box", required: true },
        { key: "maintenance_fee", label: "Maintenance (Monthly INR)", icon: "currency-inr", keyboardType: "numeric", required: false },
        { key: "car_parking", label: "Car Parking (Yes/No)", icon: "car-multiple", required: false },
        { key: "facing", label: "Facing Direction (e.g., East)", icon: "compass", required: false },
    ],
    land: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "plot_area_sqft", label: "Plot Area (Sq. Ft.)", icon: "ruler-square", keyboardType: "numeric", required: true },
        { key: "locality", label: "Locality/Zone", icon: "map-marker-path", required: true },
        { key: "boundary", label: "Boundary Wall Status (Yes/No)", icon: "fence", required: false },
        { key: "listed_by", label: "Listed By (Owner/Agent/Builder)", icon: "account-box", required: true },
        { key: "facing", label: "Facing Direction (e.g., East)", icon: "compass", required: false },
    ],
    rentresidential: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "carpet_area_sqft", label: "Carpet Area (Sq. Ft.)", icon: "ruler-square", keyboardType: "numeric", required: true },
        { key: "bedrooms", label: "Bedrooms (BHK)", icon: "bed-king-outline", keyboardType: "numeric", required: true },
        { key: "bathrooms", label: "Bathrooms", icon: "shower", keyboardType: "numeric", required: true },
        { key: "furnishing", label: "Furnishing (Furnished/Unfurnished)", icon: "sofa", required: true },
        { key: "maintenance_fee", label: "Maintenance (Monthly INR)", icon: "currency-inr", keyboardType: "numeric", required: true },
        { key: "preferred_tenants", label: "Preferred Tenants (Family/Bachelors/Any)", icon: "account-group", required: false },
        { key: "listed_by", label: "Listed By (Owner/Agent)", icon: "account-box", required: true },
    ],
    commercialsale: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "super_area_sqft", label: "Super Area (Sq. Ft.)", icon: "ruler-square-compass", keyboardType: "numeric", required: true },
        { key: "property_type", label: "Property Type (Shop/Office/Showroom)", icon: "store-outline", required: true },
        { key: "washrooms", label: "Total Washrooms", icon: "toilet", keyboardType: "numeric", required: true },
        { key: "pantry", label: "Pantry Status (Available/Not Available)", icon: "coffee", required: false },
        { key: "parking_spots", label: "Reserved Parking Spots", icon: "car-multiple", keyboardType: "numeric", required: false },
        { key: "possession", label: "Possession Status (Ready/Under Construction)", icon: "home-city", required: true },
        { key: "listed_by", label: "Listed By (Owner/Agent/Builder)", icon: "account-box", required: true },
    ],
    commercialrent: [
        { key: "title", label: "Ad Title", icon: "pencil", required: true },
        { key: "super_area_sqft", label: "Super Area (Sq. Ft.)", icon: "ruler-square-compass", keyboardType: "numeric", required: true },
        { key: "property_type", label: "Property Type (Shop/Office/Showroom)", icon: "store-outline", required: true },
        { key: "washrooms", label: "Total Washrooms", icon: "toilet", keyboardType: "numeric", required: true },
        { key: "pantry", label: "Pantry Status (Available/Not Available)", icon: "coffee", required: false },
        { key: "parking_spots", label: "Reserved Parking Spots", icon: "car-multiple", keyboardType: "numeric", required: false },
        { key: "lease_period", label: "Minimum Lease Period (Months)", icon: "calendar-clock", keyboardType: "numeric", required: false },
        { key: "maintenance_fee", label: "Maintenance (Monthly INR)", icon: "currency-inr", keyboardType: "numeric", required: true },
        { key: "listed_by", label: "Listed By (Owner/Agent)", icon: "account-box", required: true },
    ],
};

// --- API Constants ---
const DEFAULT_BRAND = "Property";
const DEFAULT_MODEL = "NA";
const DEFAULT_YEAR = new Date().getFullYear();
// FIX 1: Change 'used' to a valid condition from the error message.
const DEFAULT_CONDITION = "good"; 

// Helper function to convert a file URI to a base64 string
// NOTE: In a real React Native app, you would use 'react-native-fs' 
// or access the 'base64' property directly if provided by the image picker.
// This implementation uses standard fetch/Blob/FileReader which works in some RN environments,
// but might require polyfills or an alternative library depending on the setup.
// We include it here as the conceptual fix for the API error.
const uriToBase64 = async (uri) => {
    if (!uri) return null;
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Error converting URI to Base64:", e, "for URI:", uri);
        return uri; // Fallback to URI if conversion fails (will likely cause API error)
    }
};


// ✅ FloatingLabelInput Component (UPDATED STYLING)
const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, multiline, icon, required = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    // Initialize animated value based on whether there's content
    const animated = new Animated.Value(value ? 1 : 0);

    useEffect(() => {
        Animated.timing(animated, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    // Style for the floating label
    const labelStyle = {
        position: "absolute",
        left: 45, // Adjusted to clear the icon better
        top: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -8], // Unfocused (18) vs. Focused/Filled (-8)
        }),
        fontSize: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.darkGray, isFocused ? COLORS.primaryGreen : COLORS.darkGray], 
        }),
        backgroundColor: COLORS.white,
        paddingHorizontal: 4,
        zIndex: 1,
    };

    return (
        <View 
            style={[
                styles.inputContainer, 
                { borderColor: isFocused ? COLORS.primaryGreen : COLORS.gray }, 
                multiline && { minHeight: 120 }
            ]}
        >
            {icon && (
                <Icon 
                    name={icon} 
                    size={20} 
                    color={isFocused ? COLORS.primaryGreen : COLORS.darkGray} 
                    style={styles.inputIcon} 
                />
            )}
            <Animated.Text style={labelStyle}>{label}{required && ' *'}</Animated.Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                // Removed the fixed top: -10 offset and paddingVertical: 12 for better vertical alignment
                style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                multiline={multiline}
                placeholderTextColor={COLORS.darkGray}
            />
        </View>
    );
};

export default function PropertyForm({ route, navigation }) {
    const { category } = route.params;
    const categoryKey = category.id.toLowerCase().replace(/[^a-z0-9]/g, '');

    const [loading, setLoading] = useState(false);
    const [mediaUris, setMediaUris] = useState([]); 
    
    // Initial state includes all potential dynamic fields from the new structure
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        description: "",
        contact: "",
        carpet_area_sqft: "", 
        super_area_sqft: "", 
        plot_area_sqft: "",
        bedrooms: "",
        bathrooms: "",
        floor_no: "",
        furnishing: "",
        total_floors: "",
        possession: "",
        locality: "",
        boundary: "",
        construction_status: "", 
        listed_by: "",          
        maintenance_fee: "",    
        car_parking: "",        
        facing: "",             
        property_type: "",
        washrooms: "",
        pantry: "",
        parking_spots: "",
        lease_period: "",
        preferred_tenants: "",
    });

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const renderDynamicFields = () => {
        const fields = propertyFields[categoryKey] || [];
        // Filter out 'title' since it's rendered separately as a common field
        const fieldsToRender = fields.filter(field => field.key !== 'title');
        
        return fieldsToRender.map((field) => (
            <FloatingLabelInput
                key={field.key}
                label={field.label}
                value={formData[field.key]}
                onChangeText={(t) => {
                    const cleanText = field.keyboardType === 'numeric' ? t.replace(/[^0-9]/g, '') : t;
                    handleChange(field.key, cleanText);
                }}
                icon={field.icon}
                keyboardType={field.keyboardType}
                required={field.required}
            />
        ));
    };

    const pickMedia = async () => {
        const options = {
            mediaType: 'mixed', 
            selectionLimit: 5 - mediaUris.length, 
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
            // Requesting base64 directly often simplifies things, but not all image pickers support it easily.
            // For now, we rely on the URI and convert it later, but we can try to improve media handling later.
        };
        
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled media picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert("Error picking media", response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                // If assets.base64 is available (often requires specific configuration), use that directly
                const newUris = response.assets.map(asset => 
                     asset.base64 ? `data:${asset.type};base64,${asset.base64}` : asset.uri
                );
                setMediaUris(prevUris => [...prevUris, ...newUris]);
            }
        });
    };

    const removeMedia = (uriToRemove) => {
        setMediaUris(prevUris => prevUris.filter(uri => uri !== uriToRemove));
    };


    const handleSubmit = async () => {
        const fields = propertyFields[categoryKey] || [];
        const { title, price, location, description, contact } = formData;
        
        let validationErrors = [];
        
        if (!title || title.length < 5) validationErrors.push("Title is required (min 5 chars).");
        if (!price || Number(price) <= 0 || isNaN(Number(price))) validationErrors.push("Price must be a valid number > 0.");
        if (!location) validationErrors.push("Location is required.");
        if (!description || description.length < 20) validationErrors.push("Description is required (min 20 chars).");
        if (!contact) validationErrors.push("Contact is required.");
        if (mediaUris.length === 0) validationErrors.push("At least one image or video is required."); 

        // Validate dynamic fields
        fields.forEach(field => {
            if (field.required && field.key !== 'title' && !formData[field.key]) {
                validationErrors.push(`${field.label} is required.`);
            }
            if (field.keyboardType === 'numeric' && formData[field.key] && isNaN(Number(formData[field.key]))) {
                 validationErrors.push(`${field.label} must be a valid number.`);
            }
        });

        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        setLoading(true);

        try {
            // FIX 2: Convert all local URIs to Base64 strings before submission.
            // This is a necessary step if the image picker only returns local URIs 
            // and the API requires a public URL or base64.
            const base64Images = [];
            for (const uri of mediaUris) {
                if (uri.startsWith('data:')) {
                    // Already a base64 string (if picker returned it)
                    base64Images.push(uri);
                } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
                    // Public URL (should be fine, but unlikely for newly uploaded images)
                    base64Images.push(uri);
                } else {
                    // Local file URI - attempt conversion
                    const base64 = await uriToBase64(uri);
                    if (base64) {
                        base64Images.push(base64);
                    } else {
                        // If conversion fails, use the original URI as a fallback, but log error
                        base64Images.push(uri);
                        console.warn(`Failed to convert URI ${uri} to Base64. Sending URI directly.`);
                    }
                }
            }
            
            // Build the 'details' object required by the backend
            const details = {};
            // Populate details object with all non-empty dynamic fields using their labels
            fields.forEach(field => {
                const value = formData[field.key];
                if (value) {
                    details[field.label] = value;
                }
            });
            
            // Add other mandatory fields to details for completeness
            details["Location"] = location;
            details["Price"] = price;
            details["Contact Email / Phone"] = contact;


            // Construct the final payload matching the backend API structure
            const payload = {
                category_name: category.title, // e.g., "For Sale: Houses & Apartments"
                title,
                description,
                price: Number(price),
                location,
                condition: DEFAULT_CONDITION, // Now 'good'
                brand: DEFAULT_BRAND,
                model: DEFAULT_MODEL,
                year: DEFAULT_YEAR,
                images: base64Images, // Use the converted base64 array
                details: details,
            };

            // API call is now integrated here
            await createAd(payload); 

            Alert.alert("Success", `${category.title} ad posted successfully! ✅`);
            navigation.goBack(); 

        } catch (error) {
            // The service now throws a specific error message
            const errorMessage = error.message || "An unexpected error occurred while posting the ad.";
            Alert.alert("Error Posting Ad", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Header */}
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
                    <Text style={styles.headerTitle}>Post Property: {category.title}</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.formContainer}>
                
                {/* Fixed Common Inputs (Required for all ads) */}
                <FloatingLabelInput label="Ad Title" value={formData.title} onChangeText={(t) => handleChange("title", t)} icon="pencil" required />
                <FloatingLabelInput label="Price" value={formData.price} onChangeText={(t) => handleChange("price", t.replace(/[^0-9]/g, ''))} keyboardType="numeric" icon="currency-inr" required />
                <FloatingLabelInput label="Location (City, State)" value={formData.location} onChangeText={(t) => handleChange("location", t)} icon="map-marker" required />

                {/* Dynamic Fields */}
                <Text style={styles.sectionHeader}>Property Details</Text>
                {renderDynamicFields()}
                
                {/* Description */}
                <Text style={styles.sectionHeader}>Description & Contact</Text>
                <FloatingLabelInput 
                    label="Property Description" 
                    value={formData.description} 
                    onChangeText={(t) => handleChange("description", t)} 
                    multiline 
                    icon="file-document" 
                    required
                />
                
                {/* Contact */}
                <FloatingLabelInput 
                    label="Contact Email / Phone" 
                    value={formData.contact} 
                    onChangeText={(t) => handleChange("contact", t)} 
                    icon="phone" 
                    required
                />

                {/* Media Upload Section */}
                <Text style={styles.sectionHeader}>Photos / Videos *</Text>
                <TouchableOpacity 
                    style={[styles.uploadMediaButton, mediaUris.length >= 5 && styles.uploadMediaButtonDisabled]} 
                    onPress={pickMedia}
                    disabled={mediaUris.length >= 5}
                >
                    <Icon name="camera" size={24} color={COLORS.textGreen} />
                    <Text style={styles.uploadMediaButtonText}>
                        Upload Media ({mediaUris.length} selected)
                    </Text>
                </TouchableOpacity>

                {/* Display Selected Media */}
                {mediaUris.length > 0 && (
                    <FlatList
                        data={mediaUris}
                        horizontal
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => (
                            <View style={styles.mediaPreview}>
                                {/* Check if item is a base64 data URL or a regular URI */}
                                {item.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/) || item.includes('video') ? (
                                    <Icon name="play-circle" size={50} color={COLORS.darkGray} style={styles.videoIconOverlay} />
                                ) : (
                                    // Use the full URI, whether it's local or data URL
                                    <Image source={{ uri: item }} style={styles.mediaThumbnail} />
                                )}
                                <TouchableOpacity onPress={() => removeMedia(item)} style={styles.removeMediaButton}>
                                    <Icon name="close-circle" size={24} color={COLORS.red} />
                                </TouchableOpacity>
                            </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.mediaPreviewList}
                    />
                )}


                {/* Submit */}
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    disabled={loading} 
                >
                    <Text style={styles.submitText}>{loading ? 'Posting...' : 'Post Ad'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
    // --- Header ---
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
        color: COLORS.white,
        flex: 1,
        textAlign: "center",
    },
    backBtn: { padding: 4 },
    formContainer: { 
        padding: 16, 
        paddingBottom: 40,
    },
    
    // --- Section Header ---
    sectionHeader: {
        fontSize: 20,
        fontWeight: "800",
        marginVertical: 18,
        color: COLORS.textGreen,
        alignSelf: "flex-start",
    },

    // --- Input Fields (Refined) ---
    inputContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        paddingLeft: 50,
        paddingRight: 12,
        minHeight: 56,
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    inputIcon: {
        position: "absolute",
        left: 14,
        top: 18,
    },
    input: {
        fontSize: 15,
        color: COLORS.black,
        paddingVertical: 0,
        height: 40,
    },
    
    // --- Media Upload Styles ---
    uploadMediaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.lightGreen,
        borderWidth: 1,
        borderColor: COLORS.primaryGreen,
        paddingVertical: 15,
        borderRadius: 10,
        marginVertical: 10,
        gap: 8,
    },
    uploadMediaButtonDisabled: {
        opacity: 0.6,
    },
    uploadMediaButtonText: {
        color: COLORS.textGreen,
        fontSize: 16,
        fontWeight: "600",
    },
    mediaPreviewList: {
        paddingVertical: 10,
    },
    mediaPreview: {
        marginRight: 15,
        width: 100,
        height: 100,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    videoIconOverlay: {
        position: 'absolute',
        alignSelf: 'center',
    },
    removeMediaButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.white, 
        borderRadius: 12,
        padding: 2,
    },
    
    // --- Submit Button (Enhanced) ---
    submitBtn: {
        backgroundColor: COLORS.primaryGreen,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.darkGreen,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    submitBtnDisabled: {
        backgroundColor: COLORS.darkGray,
    },
    submitText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "700",
    },
});
