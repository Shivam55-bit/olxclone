// src/screens/ChangePasswordScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

// Import API
import { changePassword } from "../apis/userApi";

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match!");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert("✅ Success", "Password changed successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("❌ changePassword error:", err.response?.data || err.message);

      // Show API error message if available
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to change password";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#222"  />
        </TouchableOpacity>
        <Text style={styles.header}>Change Password</Text>
      </View>

      {/* Current Password */}
      <Text style={styles.label}>Current Password</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrent}
          placeholder="Enter current password"
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Icon
            name={showCurrent ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <Text style={styles.label}>New Password</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNew}
          placeholder="Enter new password"
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <Icon
            name={showNew ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          placeholder="Confirm new password"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Icon
            name={showConfirm ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingTop:"23",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#222",
  },
  saveButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
