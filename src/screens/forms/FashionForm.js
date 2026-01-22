// src/screens/forms/FashionForm.js
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

// --- Color Palette (Green) ---
const COLORS = {
    primaryGreen: "#28a745", 
    darkGreen: "#218838",    
    lightGreen: "#d4edda",   // Very light background for buttons
    textGreen: "#155724",    
    gray: "#e0e0e0",         
    darkGray: "#999",        
    white: "#fff",
    black: "#000",
    red: "#dc3545",          
};

// --- Fashion Field Configuration (UPDATED with detailKey) ---
const fashionFields = {
    default: [
        { key: "item_title", label: "Ad Title", icon: "tag", required: true },
        { key: "brand", label: "Brand (e.g., Nike, Zara)", icon: "tshirt-crew-outline", required: false, detailKey: "Brand" },
        { key: "size", label: "Size (e.g., S, M, 32)", icon: "ruler", type: "size_selector", required: true, detailKey: "Size" }, 
        { key: "material", label: "Material (e.g., Cotton, Silk, Leather)", icon: "texture", required: false, detailKey: "Material" },
        { key: "condition", label: "Condition", icon: "star-half-full", type: "condition_selector", required: true, detailKey: "Condition" }, 
    ],
    jewelry: [
        { key: "item_title", label: "Ad Title", icon: "tag", required: true },
        { key: "type", label: "Type (Ring, Necklace, Bracelet)", icon: "ring", required: true, detailKey: "Type" },
        { key: "material", label: "Material (Gold, Silver, Platinum)", icon: "gold", required: true, detailKey: "Material" },
        { key: "weight_grams", label: "Weight (Grams)", icon: "weight-kilogram", keyboardType: "numeric", required: false, detailKey: "Weight (Grams)" },
        { key: "condition", label: "Condition", icon: "star-half-full", type: "condition_selector", required: true, detailKey: "Condition" }, 
    ],
};

// --- API Constants ---
const DEFAULT_BRAND = "NA";
const DEFAULT_MODEL = "NA";
const DEFAULT_YEAR = new Date().getFullYear();

// --- Select Button Component for Condition ---
const SelectButton = ({ options, selectedValue, onSelect, label, required = false }) => (
    <View style={formStyles.selectContainer}>
        <Text style={formStyles.selectLabel}>{label}{required && ' *'}</Text>
        <View style={formStyles.optionWrapper}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        formStyles.optionButton,
                        selectedValue === option.value && formStyles.optionButtonSelected,
                    ]}
                    onPress={() => onSelect(option.value)}
                >
                    <Text style={[
                        formStyles.optionText,
                        selectedValue === option.value && formStyles.optionTextSelected,
                    ]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// --- Size Input Group Component ---
const SizeInputGroup = ({ value, onChangeText, required = false }) => {
    const commonSizes = ["S", "M", "L", "XL"];
    const [isCustom, setIsCustom] = useState(!commonSizes.includes(value) && value !== "");

    useEffect(() => {
        // Automatically switch to custom input if the user types something not in the standard list
        if (value && !commonSizes.includes(value.toUpperCase()) && !isCustom) {
             setIsCustom(true);
        }
        if (value && commonSizes.includes(value.toUpperCase()) && isCustom) {
             setIsCustom(false);
        }
    }, [value, isCustom]);


    return (
        <View style={formStyles.selectContainer}>
            <Text style={formStyles.selectLabel}>Size{required && ' *'}</Text>
            
            <View style={formStyles.sizeOptionsContainer}>
                {/* Standard Size Buttons */}
                {commonSizes.map((size) => (
                    <TouchableOpacity
                        key={size}
                        style={[
                            formStyles.sizeButton,
                            value.toUpperCase() === size && formStyles.sizeButtonSelected,
                        ]}
                        onPress={() => {
                            onChangeText(size);
                            setIsCustom(false);
                        }}
                    >
                        <Text style={[
                            formStyles.sizeText,
                            value.toUpperCase() === size && formStyles.sizeTextSelected,
                        ]}>
                            {size}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Custom Size Button/Input Toggle */}
                   <TouchableOpacity
                        style={[
                            formStyles.sizeButton,
                            isCustom && formStyles.sizeButtonSelected,
                            {minWidth: 60}
                        ]}
                        onPress={() => {
                            setIsCustom(true);
                            // Clear value if selecting custom input for the first time
                            if (!isCustom) onChangeText(""); 
                        }}
                    >
                        <Text style={[
                            formStyles.sizeText,
                            isCustom && formStyles.sizeTextSelected,
                        ]}>
                            {isCustom && value ? "Custom" : "Other"}
                        </Text>
                    </TouchableOpacity>

            </View>

            {/* Custom Input Field */}
            {isCustom && (
                <View style={[formStyles.customInputContainer]}>
                    <Icon name="ruler" size={20} color={COLORS.darkGray} style={formStyles.customInputIcon} />
                    <TextInput
                        value={value}
                        onChangeText={(t) => onChangeText(t.trim())}
                        placeholder="Enter custom size (e.g. 32, 7 US)"
                        style={formStyles.customTextInput}
                        placeholderTextColor={COLORS.darkGray}
                        autoFocus={true}
                    />
                </View>
            )}

        </View>
    );
};


// FloatingLabelInput Component 
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
            outputRange: [COLORS.darkGray, isFocused ? COLORS.primaryGreen : COLORS.darkGray], 
        }),
        backgroundColor: COLORS.white,
        paddingHorizontal: 4,
        zIndex: 1,
    };

    return (
        <View style={[formStyles.inputContainer, { borderColor: isFocused ? COLORS.primaryGreen : COLORS.gray }, multiline && { height: 120 }]}>
            {icon && (
                <Icon name={icon} size={20} color={isFocused ? COLORS.primaryGreen : COLORS.darkGray} style={formStyles.inputIcon} />
            )}
            <Animated.Text style={labelStyle}>{label}{required && ' *'}</Animated.Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={[formStyles.input, multiline && { height: 100, textAlignVertical: "top" }]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                multiline={multiline}
                placeholderTextColor={COLORS.darkGray}
            />
        </View>
    );
};

export default function FashionForm({ route, navigation }) {
    const { category } = route.params; 
    const categoryKey = category.id.toLowerCase();

    const [loading, setLoading] = useState(false);
    // State now stores Base64 strings for images, or local URIs for videos
    const [mediaUris, setMediaUris] = useState([]); 
    
    const [formData, setFormData] = useState({
        item_title: "", price: "", location: "", description: "", contact: "",
        brand: "", size: "", material: "", 
        // 🟢 FIXED: Use API-friendly condition value
        condition: "like_new", 
        type: "", weight_grams: "",
    });

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    // 🟢 FIXED: Use API-friendly condition values
    const conditionOptions = [
        { label: "New", value: "new" },
        { label: "Used - Like New", value: "like_new" },
        { label: "Used - Good", value: "good" },
       
        
    ];

    const renderDynamicFields = () => {
        const fields = fashionFields[categoryKey] || fashionFields.default;
        
        return fields.map((field) => {
            if (field.type === "condition_selector") {
                return (
                    <SelectButton
                        key={field.key}
                        label={field.label}
                        options={conditionOptions}
                        selectedValue={formData[field.key]}
                        onSelect={(v) => handleChange(field.key, v)}
                        required={field.required}
                    />
                );
            }
            
            if (field.type === "size_selector") {
                 return (
                    <SizeInputGroup
                        key={field.key}
                        value={formData[field.key]}
                        onChangeText={(v) => handleChange(field.key, v)}
                        required={field.required}
                    />
                );
            }

            return (
                <FloatingLabelInput
                    key={field.key}
                    label={field.label}
                    value={formData[field.key]}
                    onChangeText={(t) => {
                        const cleanText = field.keyboardType === 'numeric' ? t.replace(/[^0-9.]/g, '') : t;
                        handleChange(field.key, cleanText);
                    }}
                    icon={field.icon}
                    keyboardType={field.keyboardType}
                    required={field.required}
                />
            );
        });
    };

    // 🟢 UPDATED: Function to include Base64 data
    const pickMedia = async () => { 
        const options = {
            mediaType: 'mixed', 
            selectionLimit: 5 - mediaUris.length, 
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
            // ⭐️ CRITICAL ADDITION: Request Base64 encoding for images
            includeBase64: true, 
        };
        
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                // User cancelled
            } else if (response.errorCode) {
                Alert.alert("Error picking media", response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const newMedia = response.assets.map(asset => {
                    // For images, return the Base64 string prefixed with the mime type
                    if (asset.type && asset.type.startsWith('image/') && asset.base64) {
                        return `data:${asset.type};base64,${asset.base64}`;
                    }
                    // For videos, return the local URI
                    return asset.uri; 
                });

                setMediaUris(prevUris => [...prevUris, ...newMedia]);
            }
        });
    };

    const removeMedia = (uriToRemove) => { 
        setMediaUris(prevUris => prevUris.filter(uri => uri !== uriToRemove));
    };


    const handleSubmit = async () => { 
        const fields = fashionFields[categoryKey] || fashionFields.default;
        const { item_title, price, location, description, contact } = formData;
        
        let validationErrors = [];
        
        if (!item_title || item_title.length < 5) validationErrors.push("Title is required (min 5 chars).");
        if (!price || Number(price) <= 0 || isNaN(Number(price))) validationErrors.push("Price must be a valid number > 0.");
        if (!location) validationErrors.push("Location is required.");
        if (!description || description.length < 20) validationErrors.push("Description is required (min 20 chars).");
        if (!contact) validationErrors.push("Contact is required.");
        if (mediaUris.length === 0) validationErrors.push("At least one image or video is required.");

        fields.forEach(field => {
            if (field.required && !formData[field.key]) {
                validationErrors.push(`${field.label} is required.`);
            }
        });

        if (validationErrors.length > 0) {
            Alert.alert("Validation Failed", validationErrors.join('\n'));
            return;
        }

        setLoading(true);

        try {
            const details = {};
            const allFields = fields;

            Object.keys(formData).forEach(key => {
                // Exclude main payload fields like title, price, location, description, contact
                if (formData[key] && !["item_title", "price", "location", "description", "contact"].includes(key)) { 
                    const field = allFields.find(f => f.key === key);
                    
                    let detailKey;
                    if (field && field.detailKey) {
                        detailKey = field.detailKey;
                    } else if (field) {
                        detailKey = field.label.replace(/\(.*\)/, '').trim(); 
                    } else {
                        detailKey = key.replace(/_/g, ' '); 
                    }
                    
                    details[detailKey] = formData[key];
                }
            });
            
            // Add contact separately using the key shown in your cURL
            details["Contact Email / Phone"] = contact;


            const payload = {
                category_name: category.title,
                title: item_title,
                description,
                price: Number(price),
                location,
                condition: formData.condition,
                brand: formData.brand || DEFAULT_BRAND,
                model: DEFAULT_MODEL,
                year: DEFAULT_YEAR,
                // mediaUris now contains Base64 strings (for images) or URIs (for videos)
                images: mediaUris, 
                details: details,
            };

            await createAd(payload); 

            Alert.alert("Success", `${category.title} ad data saved successfully! ✅`);
            navigation.goBack(); 

        } catch (error) {
            const errorMessage = error.message || "An unexpected error occurred while saving the ad.";
            Alert.alert("Error Saving Ad", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: COLORS.white }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={[COLORS.primaryGreen, COLORS.darkGreen]} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={formStyles.headerContainer}
            >
                <View style={formStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={formStyles.backBtn}>
                        <Icon name="arrow-left" size={26} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={formStyles.headerTitle}>Post Ad: {category.title}</Text>
                    <View style={{ width: 26 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={formStyles.formContainer}>
                
                {/* Dynamic/Item Specific Fields */}
                <Text style={formStyles.sectionHeader}>Item Details</Text>
                {renderDynamicFields()}

                <FloatingLabelInput label="Price" value={formData.price} onChangeText={(t) => handleChange("price", t.replace(/[^0-9]/g, ''))} keyboardType="numeric" icon="currency-inr" required />
                <FloatingLabelInput label="Location (City, State)" value={formData.location} onChangeText={(t) => handleChange("location", t)} icon="map-marker" required />
                
                {/* Description */}
                <Text style={formStyles.sectionHeader}>Description & Contact</Text>
                <FloatingLabelInput 
                    label="Item Description" 
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

                {/* Single Upload Media Button Section */}
                <Text style={formStyles.sectionHeader}>Photos / Videos *</Text>
                <TouchableOpacity 
                    style={[formStyles.uploadMediaButton, mediaUris.length >= 5 && formStyles.uploadMediaButtonDisabled]} 
                    onPress={pickMedia}
                    disabled={mediaUris.length >= 5}
                >
                    <Icon name="camera" size={24} color={COLORS.textGreen} />
                    <Text style={formStyles.uploadMediaButtonText}>
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
                            <View style={formStyles.mediaPreview}>
                                {item.startsWith('data:video/') || item.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/) ? (
                                    // It's a video URI
                                    <Icon name="play-circle" size={50} color={COLORS.darkGray} style={formStyles.videoIconOverlay} />
                                ) : (
                                    // 🟢 FIXED: Display Base64 images
                                    <Image 
                                        source={{ uri: item }} 
                                        style={formStyles.mediaThumbnail} 
                                    />
                                )}
                                <TouchableOpacity onPress={() => removeMedia(item)} style={formStyles.removeMediaButton}>
                                    <Icon name="close-circle" size={24} color={COLORS.red} />
                                </TouchableOpacity>
                            </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={formStyles.mediaPreviewList}
                    />
                )}


                {/* Submit */}
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={formStyles.submitBtn}
                    disabled={loading} 
                >
                    <Text style={formStyles.submitText}>{loading ? 'Saving Data...' : 'Post Ad'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const formStyles = StyleSheet.create({
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
    formContainer: { padding: 16 },
    
    // --- Section Header ---
    sectionHeader: {
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 12,
        color: COLORS.primaryGreen,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.lightGreen,
        alignSelf: "flex-start",
        paddingBottom: 4,
    },

    // --- Select/Option Styles (NEW/IMPROVED) ---
    selectContainer: {
        marginBottom: 20,
        paddingVertical: 8,
    },
    selectLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginBottom: 8,
        marginLeft: 4,
    },
    optionWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    optionButton: {
        flex: 1, 
        minWidth: 90,
        backgroundColor: COLORS.gray,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginHorizontal: 4,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray,
    },
    optionButtonSelected: {
        backgroundColor: COLORS.primaryGreen,
        borderColor: COLORS.darkGreen,
    },
    optionText: {
        color: COLORS.black,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
    
    // --- Size Selector Styles (NEW) ---
    sizeOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    sizeButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.gray,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    sizeButtonSelected: {
        borderColor: COLORS.primaryGreen,
        backgroundColor: COLORS.lightGreen,
    },
    sizeText: {
        color: COLORS.black,
        fontWeight: '500',
    },
    sizeTextSelected: {
        color: COLORS.textGreen,
        fontWeight: '700',
    },
    customInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        marginTop: 5,
    },
    customInputIcon: {
        marginRight: 8,
    },
    customTextInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.black,
        paddingVertical: 12,
    },
    
    // --- Input Styles (Floating Label) ---
    inputContainer: {
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: COLORS.white,
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
        color: COLORS.black,
        paddingVertical: 12,
        top: -10,
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
    // --- Submit Button ---
    submitBtn: {
        backgroundColor: COLORS.primaryGreen,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
        elevation: 3,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700",
    },
});