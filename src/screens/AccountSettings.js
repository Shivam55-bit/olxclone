// AccountSettings.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  deleteAccount,
  uploadAvatar,
  changePassword,
} from "../apis/userApi"; // ✅ import from your userApi.js

const AccountSettings = () => {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangeAvatar = () => {
    Alert.alert("Change Avatar", "Open Image Picker to select new avatar.");
    // 👉 later: call uploadAvatar(formData) after picking image
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePasswordScreen");
    // 👉 inside that screen, call changePassword({ old_password, new_password })
  };

  const handleTwoFactorAuth = () => {
    Alert.alert("Two-Factor Authentication", "Enable/Disable 2FA settings.");
  };

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              // ✅ use correct API call
              await deleteAccount();
              setLoading(false);
              Alert.alert("Account Deleted", "Your account has been removed.");
              navigation.reset({
                index: 0,
                routes: [{ name: "RegisterScreen" }],
              });
            } catch (error) {
              setLoading(false);
              console.error("❌ Delete account error:", error);
              Alert.alert(
                "Error",
                error.response?.data?.detail || "Failed to delete account."
              );
            }
          },
        },
      ]
    );
  };

  // Dynamic styles
  const themeStyles = {
    container: { backgroundColor: darkMode ? "#121212" : "#f9f9f9" },
    header: { color: darkMode ? "#fff" : "#222" },
    section: { backgroundColor: darkMode ? "#1f1f1f" : "#fff" },
    sectionTitle: { color: darkMode ? "#ccc" : "#555" },
    rowText: { color: darkMode ? "#fff" : "#333" },
  };

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#e63946" />
        </View>
      )}

      {/* Profile Section */}
      <View style={[styles.section, themeStyles.section]}>
        <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>
          Profile
        </Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("EditProfileScreen")}
        >
          <Icon
            name="person-outline"
            size={22}
            color={darkMode ? "#fff" : "#333"}
          />
          <Text style={[styles.rowText, themeStyles.rowText]}>Edit Profile</Text>
          <Icon
            name="chevron-forward"
            size={20}
            color={darkMode ? "#888" : "#999"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleChangeAvatar}>
          <Icon
            name="image-outline"
            size={22}
            color={darkMode ? "#fff" : "#333"}
          />
          <Text style={[styles.rowText, themeStyles.rowText]}>
            Change Avatar
          </Text>
          <Icon
            name="chevron-forward"
            size={20}
            color={darkMode ? "#888" : "#999"}
          />
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={[styles.section, themeStyles.section]}>
        <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>
          Security
        </Text>
        <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
          <Icon
            name="lock-closed-outline"
            size={22}
            color={darkMode ? "#fff" : "#333"}
          />
          <Text style={[styles.rowText, themeStyles.rowText]}>
            Change Password
          </Text>
          <Icon
            name="chevron-forward"
            size={20}
            color={darkMode ? "#888" : "#999"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleTwoFactorAuth}>
          <Icon
            name="shield-checkmark-outline"
            size={22}
            color={darkMode ? "#fff" : "#333"}
          />
          <Text style={[styles.rowText, themeStyles.rowText]}>
            Two-Factor Authentication
          </Text>
          <Icon
            name="chevron-forward"
            size={20}
            color={darkMode ? "#888" : "#999"}
          />
        </TouchableOpacity>
      </View>

      {/* Delete Account */}
      <View style={[styles.section, themeStyles.section]}>
        <TouchableOpacity
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={handleDeleteAccount}
        >
          <Icon name="log-out-outline" size={22} color="red" />
          <Text style={[styles.rowText, { color: "red" }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AccountSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    position: "absolute",
    top: "40%",
    left: "45%",
    zIndex: 999,
  },
  section: {
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  rowText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
});
