import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { registerUser } from "../apis/authApi";

const { width, height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  // ================= STATES =================
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= ANIMATION =================
  const bgAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#11a86b", "#0f2027"],
  });

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("⚠️ Error", "Full Name is required");
      return false;
    }
    if (!username.trim()) {
      Alert.alert("⚠️ Error", "Username is required");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("⚠️ Error", "Email is required");
      return false;
    }
    if (!mobileNumber.trim()) {
      Alert.alert("⚠️ Error", "Mobile number is required");
      return false;
    }
    if (!password || !confirmPassword) {
      Alert.alert("⚠️ Error", "Password fields are required");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("⚠️ Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        full_name: fullName.trim(),          // ✅ REQUIRED
        phone_number: mobileNumber.trim(),   // ✅ REQUIRED
        password,
      };

      console.log("📦 REGISTER PAYLOAD:", payload);

      await registerUser(payload);

      Alert.alert("✅ Success", "Account created successfully!");
      navigation.replace("LoginScreen");
    } catch (error) {
      Alert.alert("❌ Error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Icon name="account-circle-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Icon name="phone-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="number-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={22} color="#2e7d32" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Register Button */}
            <TouchableWithoutFeedback onPress={handleRegister}>
              <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>

            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("LoginScreen")}
              >
                Login
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default RegisterScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#217908",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 15,
    color: "#444",
  },
  loginLink: {
    color: "#217908",
    fontWeight: "600",
  },
});
