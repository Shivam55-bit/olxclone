// src/screens/EditProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView, // ✅ Improvement for better UX
  Platform,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
// Use a local image for a solid fallback (you need to ensure this path is correct)
import DefaultAvatar from "../images/user_placeholder.png"; 

// Import APIs
import { getProfile, updateProfile, uploadAvatar } from "../apis/userApi";
import { BASE_URL } from "../apis/api"; // ✅ Use the centralized BASE_URL

/**
 * Helper function to construct full image URL
 * @param {string} imagePath - The image path from the backend (can be absolute URL or relative path)
 * @returns {string} - Full absolute URL
 */
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    const trimmedPath = imagePath.trim();
    
    // If it's already an absolute URL, return as-is
    if (trimmedPath.startsWith("http")) {
        return trimmedPath;
    }
    
    // If it's a relative path, construct the full URL
    // Remove leading slashes to avoid double slashes
    const cleanedPath = trimmedPath.replace(/^\/+/, "");
    const cleanedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    
    return `${cleanedBase}/${cleanedPath}`;
};

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
  });
  // State now holds EITHER the public URL OR the new Base64 string
  const [avatar, setAvatar] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // State to track if a new image was selected
  const [newAvatarSelected, setNewAvatarSelected] = useState(false); 

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
      });

      if (data.avatar) {
        const avatarUrl = getFullImageUrl(data.avatar);
        setAvatar(avatarUrl);
      } else {
        setAvatar(null); // Set to null if no avatar is available
      }
    } catch (err) {
      console.error("❌ fetchProfile error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.7,
        includeBase64: true, // Request Base64 data
        selectionLimit: 1, // Ensure only one image is picked
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Error", response.errorMessage);
          return;
        }
        
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          // 🔑 FIX: Store the full Base64 string with the data URI prefix for display and upload
          // The data will look like: "data:image/jpeg;base64,..."
          // NOTE: The asset.type might sometimes be null, use 'image/jpeg' as a fallback
          const mimeType = asset.type || 'image/jpeg';
          const base64Data = `data:${mimeType};base64,${asset.base64}`;
          
          setAvatar(base64Data);
          setNewAvatarSelected(true); // Mark that a new avatar has been selected
        }
      }
    );
  };

  const saveProfile = async () => {
    setSaving(true);

    // Basic Validation (Add more as necessary)
    if (!profile.full_name.trim()) {
        Alert.alert("Validation", "Full Name cannot be empty.");
        setSaving(false);
        return;
    }
    
    try {
      const updatedTextData = {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
      };

      // 1️⃣ Update text info
      const profileUpdateResult = await updateProfile(updatedTextData);
      console.log("✅ Profile text updated:", profileUpdateResult);

      // 2️⃣ Upload avatar if a new one was selected
      if (newAvatarSelected) {
        // We know 'avatar' state holds the full Base64 string
        console.log("📤 Attempting avatar upload...");
        console.log("🔍 Avatar data length:", avatar?.length || "no data");
        
        // 🔑 FIX: Pass the FULL Base64 string, which is already in the 'avatar' state.
        const res = await uploadAvatar(avatar); // <-- Pass the full string
        
        console.log("✅ Avatar upload response:", res);
        console.log("📦 Response keys:", Object.keys(res || {}));
        
        // Check if upload was successful
        if (res?.avatar) {
          setNewAvatarSelected(false); // Reset selection flag
          console.log("✅ Avatar uploaded successfully. Path:", res.avatar);
          // Don't try to preview the URL here - let the Account tab fetch fresh data
        } else {
            console.warn("⚠️ Avatar upload succeeded but returned no avatar path. Response:", res);
            throw new Error("Avatar upload failed - no path returned");
        }
      }

      // 3️⃣ Notify success and navigate back
      Alert.alert("✅ Success", "Profile updated successfully");
      navigation.goBack();
      
    } catch (err) {
      console.error("❌ saveProfile error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save profile.";
      Alert.alert(
        "Error",
        errorMessage
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  // Determine the image source: Base64 string, public URL, or default placeholder
  const imageSource = avatar 
    ? { uri: avatar } // Works for both 'http://...' and 'data:image/...'
    : DefaultAvatar; // Uses the local import

  return (
    <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -50}
    >
        <ScrollView contentContainerStyle={styles.container}>
            {/* Back Button - Increased top padding to accommodate status bar */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>

            <Text style={styles.header}>Edit Your Profile</Text>

            {/* Avatar Section */}
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
                <Image
                    source={imageSource}
                    style={styles.avatar}
                    // ✅ FIX: Use DefaultAvatar as the final fallback in state
                    onError={() => {
                        console.warn("⚠️ Avatar load failed for URL/Base64.");
                        // Set avatar to null, which causes imageSource to use DefaultAvatar
                        setAvatar(null); 
                    }}
                />
                <View style={styles.editIconContainer}>
                    <Icon name="camera" size={20} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={styles.changeText}>
                {newAvatarSelected ? "Avatar ready to upload" : "Tap to change avatar"}
            </Text>

            {/* Inputs */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
            />
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
            />
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
            />
            <Text style={styles.inputLabel}>Bio (Optional)</Text>
            <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell us about yourself..."
                multiline
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
            />

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: "#f9f9f9",
    paddingTop: 80, // Increased for back button clearance
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 40, // Adjusted top position
    left: 15,
    zIndex: 10,
    padding: 5,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120, // Slightly larger avatar
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4caf50',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4caf50',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  changeText: {
    textAlign: "center",
    marginBottom: 30,
    color: "#4caf50",
    fontWeight: '600',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  saveText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' },
});