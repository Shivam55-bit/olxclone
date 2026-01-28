import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    Alert,
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

// Import your API functions
import { BASE_URL } from '../apis/api';
// 🔑 Import the updateAd and uploadAdImages functions
import { updateAd, uploadAdImages } from '../apis/adApi'; 

const { width } = Dimensions.get('window');

// --- Color Palette (Slightly Refined) ---
const COLORS = {
    background: "#F8F9FA",
    surface: "#FFFFFF",
    primary: "#369a3bff", // Accent
    primaryDark: "#2d7f32",
    textDark: "#1A1A1A",
    textLight: "#FFFFFF",
    textSecondary: "#6C757D",
    error: "#FF3B30",
    success: "#28A745",
    border: "#E9ECEF",
    cardShadow: 'rgba(0, 0, 0, 0.08)',
};

// -------------------------------------------------------------------
// --- Custom Hook for Input Focus Animation ---
// -------------------------------------------------------------------
const useInputFocus = (initialBorderColor = COLORS.border, focusedBorderColor = COLORS.primary) => {
    const focusAnim = useRef(new Animated.Value(0)).current;

    const [isFocused, setIsFocused] = useState(false);

    const onFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const onBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const animatedBorderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [initialBorderColor, focusedBorderColor],
    });

    return {
        animatedStyle: { borderColor: animatedBorderColor },
        onFocus,
        onBlur,
        isFocused,
    };
};

// -------------------------------------------------------------------
// --- Main Component: EditAd ---
// -------------------------------------------------------------------
export default function EditAd({ route, navigation }) {
    const adId = route?.params?.adId || null;
    const adData = route?.params?.adData || null;

    // Form state
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [condition, setCondition] = useState("Used");
    const [category, setCategory] = useState(""); // Category is often required for posting/editing
    const [images, setImages] = useState([]); // New images to be uploaded (Asset objects from picker)
    const [existingImages, setExistingImages] = useState([]); // Full URLs of images already on server
    const [status, setStatus] = useState("Active");
    const [errors, setErrors] = useState({});

    // Animation
    const [fadeAnim] = useState(new Animated.Value(0));

    // Input Focus Hooks
    const titleFocus = useInputFocus();
    const descriptionFocus = useInputFocus();
    const priceFocus = useInputFocus();
    const locationFocus = useInputFocus();

    useEffect(() => {
        if (!adId) {
            Alert.alert("Error", "No ad ID provided", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
            return;
        }

        if (adData) {
            loadAdData(adData);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        }
    }, [adId, adData]);

    const loadAdData = (ad) => {
        try {
            setTitle(ad.title || "");
            setDescription(ad.description || "");
            setPrice(ad.price?.toString() || "");
            setLocation(ad.location || "");
            
            // Status may be lowercase from API, normalize to Title Case for UI
            const normalizedStatus = ad.status ? ad.status.charAt(0).toUpperCase() + ad.status.slice(1) : "Active";
            
            setCondition(ad.condition || "Used");
            setCategory(ad.category || "");
            setStatus(normalizedStatus);
            
            // Image mapping logic
            if (ad.images && ad.images.length > 0) {
                const imageUrls = ad.images.map(img => {
                    // Normalize the path from the server into a full URL
                    const path = typeof img === 'string' ? img : img.path || img.url; // Use 'path' or 'url' if objects are used
                    if (path && path.startsWith('http')) return path; 
                    return path ? `${BASE_URL}${path.startsWith('/') ? path : '/' + path}` : null;
                }).filter(url => url !== null);
                setExistingImages(imageUrls);
            } else if (ad.imageUrl) {
                // Fallback for single image URL if provided in route params
                setExistingImages([ad.imageUrl]);
            }
        } catch (error) {
            console.error("Load Ad Data Error:", error);
            Alert.alert("Error", "Failed to load ad details");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = "Title is required";
        } else if (title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required";
        } else if (description.trim().length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }

        if (!price.trim()) {
            newErrors.price = "Price is required";
        } else if (isNaN(price) || parseFloat(price) <= 0) {
            newErrors.price = "Enter a valid price";
        }

        if (!location.trim()) {
            newErrors.location = "Location is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImagePicker = () => {
        const maxSelection = 5 - existingImages.length - images.length;
        if (maxSelection <= 0) {
             Alert.alert("Limit Reached", "You can upload a maximum of 5 photos.");
             return;
        }

        const options = {
            mediaType: 'photo',
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.8,
            selectionLimit: maxSelection,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                Alert.alert('Error', response.errorMessage);
            } else if (response.assets) {
                // Ensure the image object has a valid uri property
                const validAssets = response.assets.filter(a => a.uri);
                setImages([...images, ...validAssets]);
            }
        });
    };

    const removeNewImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const removeExistingImage = (index) => {
        Alert.alert(
            "Remove Image",
            "Are you sure you want to remove this image? This change will be saved when you update the ad.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        const newExisting = [...existingImages];
                        newExisting.splice(index, 1);
                        setExistingImages(newExisting);
                    },
                },
            ]
        );
    };

    // 🔑 UPDATED handleSave FUNCTION
    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fill all required fields correctly");
            return;
        }
        
        // Ensure there is at least one image remaining
        if (existingImages.length + images.length === 0) {
             Alert.alert("Error", "Your ad must have at least one photo.");
             return;
        }

        try {
            setSaving(true);
            
            // Get existing image paths (relative paths for the server)
            // existingImages might be full URLs or already relative paths
            const keptImagePaths = existingImages.map(url => {
                if (!url) return null;
                // If it's already a relative path (doesn't start with http)
                if (!url.startsWith('http')) {
                    return url.replace(/^\/+/, ''); // Just clean leading slashes
                }
                // Remove BASE_URL to get the relative path
                let path = url.replace(BASE_URL, '');
                // Also try without trailing slash variants
                path = path.replace(/^\/+/, ''); // Remove leading slashes
                return path || null;
            }).filter(path => path && path.length > 0);

            console.log('📷 Existing images (full URLs):', existingImages);
            console.log('📷 Kept image paths (relative):', keptImagePaths);

            // Start with existing images
            let allImagePaths = [...keptImagePaths];

            // Upload NEW images first if any
            if (images.length > 0) {
                console.log('📤 Uploading', images.length, 'new images...');
                
                const uploadResult = await uploadAdImages(images);
                console.log('📥 Upload result:', JSON.stringify(uploadResult, null, 2));
                
                if (uploadResult.success && uploadResult.paths && uploadResult.paths.length > 0) {
                    // paths are already extracted as strings in uploadAdImages
                    allImagePaths = [...allImagePaths, ...uploadResult.paths];
                    console.log('✅ All image paths after adding new:', allImagePaths);
                } else {
                    // Show raw response for debugging if paths extraction failed
                    console.log('⚠️ Raw upload response:', JSON.stringify(uploadResult.raw, null, 2));
                    Alert.alert("Error", uploadResult.error || "Failed to upload new images - no paths returned");
                    setSaving(false);
                    return;
                }
            }

            console.log('📷 Final all image paths to save:', allImagePaths);

            // Build the JSON payload matching API schema
            const updatePayload = {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                location: location.trim(),
                condition: condition.toLowerCase(),
                status: status.toLowerCase(),
                images: allImagePaths, // Array of string paths
            };

            console.log('📤 Sending update payload:', JSON.stringify(updatePayload, null, 2));

            // API call using the centralized updateAd function (sends JSON)
            const result = await updateAd(adId, updatePayload);

            console.log('📥 Update result:', result);

            if (result && !result.error && result.success !== false) {
                Alert.alert(
                    "Success! 🎉", 
                    "Your ad has been updated successfully!", 
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            } else {
                // Handle 401 Unauthorized
                if (result.status === 401) {
                    Alert.alert("Session Expired", "Please login again.", 
                        [{ text: "OK", onPress: () => navigation.navigate('Login') }]);
                } else {
                    Alert.alert("Error", result.error || `Failed to update ad (Status: ${result.status || 'N/A'})`);
                }
            }
        } catch (error) {
            console.error("Update Ad Error:", error);
            Alert.alert("Error", "Could not update ad. Please check your connection or server status.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <View style={styles.headerContainer}>
                    <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-back" size={24} color={COLORS.textLight} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Ad</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading ad details...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

            {/* Enhanced Header with Gradient Effect */}
            <LinearGradient
                colors={[COLORS.primaryDark, COLORS.primary]} // Darker top, lighter bottom
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.headerContainer}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Ad</Text>
                    <TouchableOpacity 
                        onPress={handleSave} 
                        disabled={saving}
                        style={styles.saveButtonHeader}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={COLORS.textLight} />
                        ) : (
                            <Icon name="cloud-upload" size={24} color={COLORS.textLight} />
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <Animated.ScrollView 
                style={[styles.scrollView, { opacity: fadeAnim }]} 
                showsVerticalScrollIndicator={false}
            >
                {/* Images Section with Card Style */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="images" size={24} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Photos</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{existingImages.length + images.length}/5</Text>
                        </View>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {/* Existing Images */}
                        {existingImages.map((uri, index) => (
                            <View key={`existing-${index}`} style={styles.imageWrapper}>
                                <Image 
                                    source={{ uri: uri }} 
                                    style={styles.imagePreview} 
                                    // Use onError to handle broken BASE_URL paths gracefully
                                    onError={(e) => console.log("Image load failed:", e.nativeEvent.error)}
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeExistingImage(index)}
                                >
                                    <Icon name="close-circle" size={30} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* New Images */}
                        {images.map((image, index) => (
                            <View key={`new-${index}`} style={styles.imageWrapper}>
                                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeNewImage(index)}
                                >
                                    <Icon name="close-circle" size={30} color={COLORS.error} />
                                </TouchableOpacity>
                                <View style={styles.newBadge}>
                                    <Text style={styles.newBadgeText}>NEW</Text>
                                </View>
                            </View>
                        ))}

                        {/* Add Image Button */}
                        {(existingImages.length + images.length) < 5 && (
                            <TouchableOpacity 
                                style={styles.addImageButton} 
                                onPress={handleImagePicker}
                                activeOpacity={0.7}
                            >
                                <Icon name="add-circle" size={50} color={COLORS.primary} />
                                <Text style={styles.addImageText}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                {/* Title Input Card */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Icon name="text" size={20} color={COLORS.primary} />
                            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
                        </View>
                        <Animated.View style={[styles.inputBox, titleFocus.animatedStyle, errors.title && { borderColor: COLORS.error }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., iPhone 13 Pro Max 256GB"
                                placeholderTextColor={COLORS.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                                onFocus={titleFocus.onFocus}
                                onBlur={titleFocus.onBlur}
                                maxLength={100}
                            />
                        </Animated.View>
                        {errors.title && (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle" size={14} color={COLORS.error} />
                                <Text style={styles.errorText}>{errors.title}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description Input Card */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Icon name="document-text" size={20} color={COLORS.primary} />
                            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                        </View>
                        <Animated.View style={[styles.inputBox, descriptionFocus.animatedStyle, errors.description && { borderColor: COLORS.error }]}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe your item in detail (e.g., condition, accessories, reason for selling)..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                onFocus={descriptionFocus.onFocus}
                                onBlur={descriptionFocus.onBlur}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={1000}
                            />
                        </Animated.View>
                        <View style={styles.characterCountContainer}>
                            {errors.description && (
                                <View style={styles.errorContainer}>
                                    <Icon name="alert-circle" size={14} color={COLORS.error} />
                                    <Text style={styles.errorText}>{errors.description}</Text>
                                </View>
                            )}
                            <Text style={styles.characterCount}>{description.length}/1000</Text>
                        </View>
                    </View>
                </View>

                {/* Price & Location Row */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfCard}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Icon name="pricetag" size={20} color={COLORS.primary} />
                                <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
                            </View>
                            <Animated.View style={[styles.priceInputBox, priceFocus.animatedStyle, errors.price && { borderColor: COLORS.error }]}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={price}
                                    onChangeText={setPrice}
                                    onFocus={priceFocus.onFocus}
                                    onBlur={priceFocus.onBlur}
                                    keyboardType="numeric"
                                />
                            </Animated.View>
                            {errors.price && (
                                <View style={styles.errorContainer}>
                                    <Icon name="alert-circle" size={14} color={COLORS.error} />
                                    <Text style={styles.errorText}>{errors.price}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.halfCard}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Icon name="location" size={20} color={COLORS.primary} />
                                <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
                            </View>
                            <Animated.View style={[styles.inputBox, locationFocus.animatedStyle, errors.location && { borderColor: COLORS.error }]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Delhi, India"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={location}
                                    onChangeText={setLocation}
                                    onFocus={locationFocus.onFocus}
                                    onBlur={locationFocus.onBlur}
                                />
                            </Animated.View>
                            {errors.location && (
                                <View style={styles.errorContainer}>
                                    <Icon name="alert-circle" size={14} color={COLORS.error} />
                                    <Text style={styles.errorText}>{errors.location}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Condition Selector Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Condition</Text>
                    </View>
                    <View style={styles.conditionContainer}>
                        {[
                            { label: 'New', icon: 'sparkles' },
                            { label: 'Like New', icon: 'star' },
                            { label: 'Used', icon: 'time' },
                            { label: 'For Parts', icon: 'construct' }
                        ].map((cond) => (
                            <TouchableOpacity
                                key={cond.label}
                                style={[
                                    styles.conditionButton,
                                    condition === cond.label && styles.conditionButtonActive,
                                ]}
                                onPress={() => { setCondition(cond.label); }}
                                activeOpacity={0.8}
                            >
                                <Icon 
                                    name={cond.icon} 
                                    size={18} 
                                    color={condition === cond.label ? COLORS.textLight : COLORS.primary}
                                />
                                <Text
                                    style={[
                                        styles.conditionText,
                                        condition === cond.label && styles.conditionTextActive,
                                    ]}
                                >
                                    {cond.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Status Selector Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="radio-button-on" size={24} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Listing Status</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        {[
                            { label: 'Active', icon: 'flash', color: COLORS.success },
                            { label: 'Pending', icon: 'eye-off', color: '#FFC107' },
                            { label: 'Sold', icon: 'archive', color: COLORS.textSecondary }
                        ].map((stat) => (
                            <TouchableOpacity
                                key={stat.label}
                                style={[
                                    styles.statusButton,
                                    status === stat.label && { 
                                        backgroundColor: stat.color,
                                        borderColor: stat.color,
                                    },
                                ]}
                                onPress={() => { setStatus(stat.label); }}
                                activeOpacity={0.8}
                            >
                                <Icon
                                    name={stat.icon}
                                    size={20}
                                    color={status === stat.label ? COLORS.textLight : stat.color}
                                />
                                <Text
                                    style={[
                                        styles.statusText,
                                        status === stat.label && styles.statusTextActive,
                                        { color: status === stat.label ? COLORS.textLight : stat.color }
                                    ]}
                                >
                                    {stat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButtonLarge, saving && styles.saveButtonLargeDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <>
                            <ActivityIndicator color={COLORS.textLight} />
                            <Text style={styles.saveButtonText}>Updating...</Text>
                        </>
                    ) : (
                        <>
                            <Icon name="cloud-upload" size={26} color={COLORS.textLight} />
                            <Text style={styles.saveButtonText}>Update Ad</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
}

// -------------------------------------------------------------------
// --- Styles ---
// -------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        backgroundColor: COLORS.primary, // Fallback for no gradient
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 20,
        elevation: 8,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "900",
        color: COLORS.textLight,
        letterSpacing: 0.5,
    },
    saveButtonHeader: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        elevation: 4, 
        shadowColor: COLORS.cardShadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.textDark,
        marginLeft: 10,
        flex: 1,
    },
    badge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    inputGroup: {
        marginBottom: 4,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textDark,
        marginLeft: 8,
    },
    required: {
        color: COLORS.error,
    },
    
    // Animated Input Boxes
    inputBox: {
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        paddingHorizontal: 15,
        minHeight: 55,
        justifyContent: 'center',
        borderColor: COLORS.border,
    },
    input: {
        fontSize: 16,
        color: COLORS.textDark,
        padding: 0, // Reset default padding
    },
    textArea: {
        fontSize: 16,
        color: COLORS.textDark,
        padding: 0,
        minHeight: 120,
        paddingTop: 10, // Adjust for top-align
        paddingBottom: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 5,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginLeft: 5,
        fontWeight: '500',
    },
    characterCountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    characterCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 'auto',
    },

    // Price specific styling
    priceInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        paddingHorizontal: 15,
        minHeight: 55,
        borderColor: COLORS.border,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primaryDark,
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
        padding: 0,
    },

    // Row containers for 2-column layout
    rowContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    halfCard: {
        width: '48.5%', // Slightly less than half to accommodate margin/space
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        elevation: 4,
        shadowColor: COLORS.cardShadow,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },

    // Image/Photo styles
    imageScroll: {
        paddingBottom: 10,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        zIndex: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
    },
    newBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopRightRadius: 8,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addImageText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 4,
    },

    // Condition Selector Styles
    conditionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    conditionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        marginTop: 8,
    },
    conditionButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    conditionText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    conditionTextActive: {
        color: COLORS.textLight,
    },

    // Status Selector Styles
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginHorizontal: 4,
    },
    statusText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '700',
    },
    statusTextActive: {
        color: COLORS.textLight,
    },
    
    // Large Save Button at the bottom
    saveButtonLarge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 24,
        elevation: 5,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
    },
    saveButtonLargeDisabled: {
        backgroundColor: COLORS.textSecondary,
        shadowColor: 'rgba(0,0,0,0.1)',
    },
    saveButtonText: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: '800',
        marginLeft: 10,
    },
});