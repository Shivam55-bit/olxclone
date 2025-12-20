import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import Toast from "react-native-toast-message";
// Assuming 'login' function is correctly imported and uses POST method internally
import { login } from "../apis/authApi"; // Updated path for this example

const { width, height } = Dimensions.get("window");

// Floating Label Input (kept as is)
const FloatingLabelInput = ({
  label,
  icon,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  showToggle,
  onToggle,
  fadeAnim,
  slideAnim,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 5,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [8, -20],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [17, 12],
    }),
    color: isFocused ? "#217908" : "#777",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
  };

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Icon
        name={icon}
        size={20}
        color={isFocused ? "#217908" : "#53604d"}
        style={{ marginRight: 6 }}
      />
      <View style={{ flex: 1 }}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {showToggle && (
        <TouchableOpacity onPress={onToggle}>
          <Icon
            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={isFocused ? "#217908" : "#777"}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations (kept as is)
  const bgAnim = useRef(new Animated.Value(0)).current;
  const cardTilt = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(15)).current;
  const inputFadeAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const inputSlideAnims = [useRef(new Animated.Value(40)).current, useRef(new Animated.Value(40)).current];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 5000, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 5000, useNativeDriver: false }),
      ])
    ).start();

    // Card tilt
    Animated.parallel([
      Animated.spring(cardTilt, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();

    // Inputs stagger
    Animated.stagger(
      250,
      inputFadeAnims.map((fadeAnim, i) =>
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(inputSlideAnims[i], { toValue: 0, friction: 6, useNativeDriver: true }),
        ])
      )
    ).start();
  }, []);

  // Ripple
  const triggerRipple = () => {
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  };
  const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
  const rippleOpacity = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  // Background gradient
  const bgColor1 = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ["#11a86b", "#0f2027"] });

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

  // ✅ Centralized login API with robust error handling
  const handleLogin = async () => {
    if (loading) return; // Prevent multiple clicks

    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "⚠️ Missing Input",
        text2: "Username and password both are required.",
        visibilityTime: 2000,
        topOffset: 50,
      });
      return;
    }

    setLoading(true);
    try {
      // Call the login API function, passing username and password
      const res = await login({ username: username.trim(), password });

      // Check for a successful response and the presence of the access_token
      if (res && res.access_token) {
        // Here you would save the access_token and refresh_token (e.g., using AsyncStorage)
        Toast.show({ type: "success", text1: "🎉 Login Successful", text2: `Welcome back!` });
        // Navigate to the next screen after a short delay for the toast to show
        setTimeout(() => navigation.replace("HomeScreen"), 1000);
      } else {
        // This block handles a successful API call but failed authorization (e.g., status 200 but message "User not found")
        const message = res?.message || "Invalid credentials or token missing.";
        Toast.show({ type: "error", text1: "❌ Login Failed", text2: message });
      }

    } catch (error) {
      console.error("Login API Error:", error);

      // --- Detailed Error Handling ---
      let errorText = "Login failed due to an unknown issue.";

      // 1. Axios/Fetch Error Object (e.g., Network, Timeout)
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        const status = error.response.status;

        if (status === 405) {
          // 🚨 CRITICAL FIX for Method Not Allowed (Confirm POST method is used)
          errorText = "Method Not Allowed (405). Check if your 'login' API uses POST.";
        } else if (status === 401 || status === 403) {
          errorText = "Invalid Credentials. Please check your username and password.";
        } else if (status === 404) {
          errorText = "API Endpoint Not Found (404). Check the login URL.";
        } else {
          errorText = `Server Error (${status}). Try again later.`;
        }
      } else if (error.request) {
        // The request was made but no response was received (e.g., network error)
        errorText = "Network Error. Please check your internet connection.";
      } else if (error.message) {
        // Generic error message
        errorText = error.message;
      }

      Toast.show({ type: "error", text1: "🚨 Login Error", text2: errorText });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor1 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100} // Adjust if needed
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={{ width: "100%", alignItems: "center" }}>
            {/* Card */}
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { scale: cardTilt },
                    { rotate: rotateAnim.interpolate({ inputRange: [0, 15], outputRange: ["0deg", "15deg"] }) },
                  ],
                },
              ]}
            >
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to continue</Text>

              <FloatingLabelInput
                label="Username"
                icon="account-outline"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address" // Use email-address if username is an email
                fadeAnim={inputFadeAnims[0]}
                slideAnim={inputSlideAnims[0]}
              />
              <FloatingLabelInput
                label="Password"
                icon="lock-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                fadeAnim={inputFadeAnims[1]}
                slideAnim={inputSlideAnims[1]}
              />

              {/* Login Button */}
              <TouchableWithoutFeedback
                onPressIn={() => {
                  onPressIn();
                  triggerRipple();
                }}
                onPressOut={onPressOut}
                onPress={handleLogin}
                disabled={loading}
              >
                <Animated.View style={{ width: "100%", transform: [{ scale: scaleAnim }] }}>
                  <LinearGradient
                    colors={loading ? ["#a8e063", "#56ab2f"] : ["#56ab2f", "#a8e063"]}
                    style={[styles.button, loading && styles.buttonLoading]}
                  >
                    <Text style={styles.buttonText}>{loading ? "⏳ LOGGING IN..." : "🚀 LOGIN"}</Text>
                    <Animated.View style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
                  </LinearGradient>
                </Animated.View>
              </TouchableWithoutFeedback>

              <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
                <Text style={styles.link}>
                  Don’t have an account? <Text style={styles.linkBold}>Register</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </Animated.View>
  );
};

export default LoginScreen;

// Styles (Minor additions for loading state)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: height * 0.05 },
  card: {
    width: "90%",
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.05,
    borderRadius: 25,
    backgroundColor: "#fff",
    shadowColor: "#56ab2f",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  title: { fontSize: width * 0.08, fontWeight: "bold", color: "#217908", textAlign: "center" },
  subtitle: { fontSize: width * 0.04, color: "#444", marginBottom: height * 0.02, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  input: { fontSize: 16, color: "#333", padding: 0, height: 40 },
  button: {
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: height * 0.02,
    shadowColor: "#56ab2f",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: width * 0.045 },
  link: { textAlign: "center", color: "#444", marginTop: height * 0.01 },
  linkBold: { color: "#56ab2f", fontWeight: "600" },
  ripple: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    top: "50%",
    left: "50%",
    marginLeft: -50,
    marginTop: -50,
    zIndex: 0,
  },
});
