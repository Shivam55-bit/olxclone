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
import { registerUser } from "../apis/authApi"; // ✅ centralized auth API

const { width, height } = Dimensions.get("window");

// Helper to generate a random 4-digit OTP for simulation
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const RegisterScreen = ({ navigation }) => {
    // --- Registration Fields State ---
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // --- Verification State ---
    const [loading, setLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [emailOTPSent, setEmailOTPSent] = useState(false); // New: Tracks if OTP was requested
    const [phoneOTPSent, setPhoneOTPSent] = useState(false); // New: Tracks if OTP was requested
    const [emailCode, setEmailCode] = useState(""); // The simulated correct OTP
    const [phoneCode, setPhoneCode] = useState(""); // The simulated correct OTP
    const [inputEmailCode, setInputEmailCode] = useState(""); // User input for email OTP
    const [inputPhoneCode, setInputPhoneCode] = useState(""); // User input for phone OTP
    const [otpLoading, setOtpLoading] = useState(false); // For OTP send/verify button

    // Animations (Kept from original code)
    const bgAnim = useRef(new Animated.Value(0)).current;
    const cardTilt = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(15)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Background color loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(bgAnim, { toValue: 1, duration: 5000, useNativeDriver: false }),
                Animated.timing(bgAnim, { toValue: 0, duration: 5000, useNativeDriver: false }),
            ])
        ).start();

        // Card Entry Animation
        Animated.parallel([
            Animated.spring(cardTilt, { toValue: 1, useNativeDriver: true }),
            Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true }),
        ]).start();
    }, []);

    const bgColor1 = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#11a86b", "#0f2027"],
    });

    // Button Animation Helpers
    const triggerRipple = () => {
        rippleAnim.setValue(0);
        Animated.timing(rippleAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    };
    const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
    const rippleOpacity = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
    const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

    // ----------------------------------------------------
    // Validation
    // ----------------------------------------------------
    const validatePreRegistration = () => {
        if (!fullName || !username || !password || !confirmPassword) {
            Alert.alert("⚠️ Error", "Please fill in all general fields.");
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert("⚠️ Error", "Passwords do not match.");
            return false;
        }
        return true;
    };

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobile = () => {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobileNumber);
    };


    // ----------------------------------------------------
    // Send Email OTP Handler (Step 1)
    // ----------------------------------------------------
    const handleSendEmailOTP = async () => {
        if (!validateEmail()) {
             Alert.alert("⚠️ Error", "Please enter a valid email address.");
             return;
        }
        if (emailOTPSent) return; 

        setOtpLoading(true);

        const newEmailCode = generateOtp();
        setEmailCode(newEmailCode);
        setInputEmailCode(''); 
        setEmailOTPSent(true); 

        Alert.alert(
            "🔑 Email OTP Sent (Simulated)",
            `Please enter the code ${newEmailCode} to verify your email ${email}.`
        );
        
        setOtpLoading(false);
    };

    // ----------------------------------------------------
    // Verify Email OTP Handler (Step 2)
    // ----------------------------------------------------
    const handleVerifyEmailOTP = async () => {
        if (emailVerified) return;
        
        if (inputEmailCode.length !== 4) {
            Alert.alert("⚠️ Error", "Please enter the 4-digit code.");
            return;
        }

        setOtpLoading(true);

        if (inputEmailCode === emailCode) {
            Alert.alert("✅ Success", "Email verified!");
            setEmailVerified(true);
        } else {
            Alert.alert("⚠️ Verification Failed", "Incorrect Email code. Please try again.");
        }
        setOtpLoading(false);
    };


    // ----------------------------------------------------
    // Send Phone OTP Handler (Step 1)
    // ----------------------------------------------------
    const handleSendPhoneOTP = async () => {
        if (!emailVerified) {
            Alert.alert("⚠️ Hold On", "Please verify your email first.");
            return;
        }
        if (!validateMobile()) {
            Alert.alert("⚠️ Error", "Please enter a valid 10-digit mobile number.");
            return;
        }
        if (phoneOTPSent) return; 

        setOtpLoading(true);

        const newPhoneCode = generateOtp();
        setPhoneCode(newPhoneCode);
        setInputPhoneCode(''); 
        setPhoneOTPSent(true); 

        Alert.alert(
            "🔑 Phone OTP Sent (Simulated)",
            `Please enter the code ${newPhoneCode} to verify your phone number ${mobileNumber}.`
        );
        
        setOtpLoading(false);
    };

    // ----------------------------------------------------
    // Verify Phone OTP Handler (Step 2)
    // ----------------------------------------------------
    const handleVerifyPhoneOTP = async () => {
        if (phoneVerified) return;
        
        if (inputPhoneCode.length !== 4) {
            Alert.alert("⚠️ Error", "Please enter the 4-digit code.");
            return;
        }

        setOtpLoading(true);

        if (inputPhoneCode === phoneCode) {
            Alert.alert("✅ Success", "Phone number verified! You can now complete registration.");
            setPhoneVerified(true);
        } else {
            Alert.alert("⚠️ Verification Failed", "Incorrect Phone code. Please try again.");
        }
        setOtpLoading(false);
    };

    // ----------------------------------------------------
    // Final Registration Handler
    // ----------------------------------------------------
    const handleFinalRegister = async () => {
        if (!validatePreRegistration()) return;
        if (!emailVerified || !phoneVerified) {
            Alert.alert("⚠️ Verification Required", "Please verify both your email and phone number to continue.");
            return;
        }

        setLoading(true);
        try {
            // API call uses only necessary fields
            const res = await registerUser({
                email,
                username,
                full_name: fullName,
                phone_number: mobileNumber,
                password,
            });
            Alert.alert("✅ Success", res.message || "Account created successfully!");
            navigation.replace("LoginScreen");
        } catch (error) {
            console.log("Register error:", error);

            const message = error.detail?.msg || error.message || "Something went wrong. Please try again.";

            Alert.alert("⚠️ Error", message);
        } finally {
            setLoading(false);
        }
    };


    // ----------------------------------------------------
    // Helper Component for Standard Inputs
    // ----------------------------------------------------
    const renderInput = (icon, placeholder, value, setter, type = "default", secure = false, editable = true, maxLength) => (
        <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
            <Icon name={icon} size={22} color={editable ? "#2e7d32" : "#a3a3a3"} style={{ marginRight: 8 }} />
            <TextInput
                style={[styles.input, !editable && { color: '#a3a3a3' }]}
                placeholder={placeholder}
                value={value}
                onChangeText={setter}
                keyboardType={type}
                secureTextEntry={secure}
                placeholderTextColor="#999"
                editable={editable}
                maxLength={maxLength}
            />
        </View>
    );
    
    // ----------------------------------------------------
    // Helper Component for Verifiable Inputs (Email/Phone)
    // ----------------------------------------------------
    const renderVerifiableInput = (icon, placeholder, value, setter, type, editable, isVerified, isOTPSent, handleSendOTP, isValid) => {
        const isPhone = type === "phone-pad";
        
        // Determine if the Send OTP button should be visible/active
        const showSendButton = editable && !isVerified && !isOTPSent && isValid;

        return (
            <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
                <Icon name={icon} size={22} color={editable ? "#2e7d32" : "#a3a3a3"} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.input, !editable && { color: '#a3a3a3' }]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={setter}
                    keyboardType={type}
                    placeholderTextColor="#999"
                    editable={editable}
                    maxLength={isPhone ? 10 : undefined}
                />

                {/* Inline Status/Button */}
                {isVerified ? (
                    <Icon name="check-circle" size={24} color="#4CAF50" style={{ marginLeft: 10 }} />
                ) : showSendButton ? (
                    <TouchableOpacity 
                        style={styles.inlineSendButton} 
                        onPress={handleSendOTP}
                        disabled={otpLoading}
                    >
                        {otpLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.inlineSendButtonText}>Send OTP</Text>
                        )}
                    </TouchableOpacity>
                ) : isOTPSent && editable ? (
                    <Text style={styles.otpSentStatus}>OTP Sent</Text>
                ) : null}
            </View>
        );
    };


    // ----------------------------------------------------
    // Helper Component for OTP Verification Section
    // ----------------------------------------------------
    const renderOTPSection = (isVerified, isOTPSent, codeValue, setCodeValue, handleVerify, isPhone = false) => {
        // Only render the OTP field and Verify button if OTP is sent and not yet verified
        if (isVerified || !isOTPSent) {
            return null;
        }
        
        const isInputComplete = codeValue.length === 4;

        return (
            <View style={styles.otpSection}> 
                <View style={[styles.inputContainer, styles.otpInputContainer, { borderColor: '#1976D2' }]}>
                    <Icon name="key-outline" size={22} color="#1976D2" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.input}
                        placeholder={`Enter ${isPhone ? 'Phone' : 'Email'} OTP (4 digits)`}
                        value={codeValue}
                        onChangeText={setCodeValue}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholderTextColor="#999"
                        editable={true} // Always editable until verified
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.verifyButton, !isInputComplete && { opacity: 0.5 }]}
                    onPress={handleVerify}
                    disabled={otpLoading || !isInputComplete}
                >
                    {otpLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // ----------------------------------------------------
    // Main Render
    // ----------------------------------------------------
    const isEmailValid = validateEmail();
    const isMobileValid = validateMobile();

    return (
        <Animated.View style={[styles.container, { backgroundColor: bgColor1 }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
                        <Text style={styles.title}>Create Account ✨</Text>
                        <Text style={styles.subtitle}>Sign up to explore dream homes</Text>

                        {/* Full Name */}
                        {renderInput("account-outline", "Full Name", fullName, setFullName)}
                        {renderInput("account-circle-outline", "Username", username, setUsername)}

                        {/* Email Address */}
                        {renderVerifiableInput(
                            "email-outline", 
                            "Email Address", 
                            email, 
                            setEmail, 
                            "email-address", 
                            !emailVerified, // Editable only if not verified
                            emailVerified, 
                            emailOTPSent, 
                            handleSendEmailOTP, 
                            isEmailValid
                        )}
                        {/* Email Verification Section */}
                        {renderOTPSection(emailVerified, emailOTPSent, inputEmailCode, setInputEmailCode, handleVerifyEmailOTP, false)}

                        {/* Mobile Number - Enabled only after email verification */}
                        {renderVerifiableInput(
                            "phone-outline", 
                            "Mobile Number (10 digits)", 
                            mobileNumber, 
                            setMobileNumber, 
                            "phone-pad", 
                            !phoneVerified && emailVerified, // Editable only if not verified AND email is verified
                            phoneVerified, 
                            phoneOTPSent, 
                            handleSendPhoneOTP, 
                            isMobileValid
                        )}
                        {/* Phone Verification Section */}
                        {renderOTPSection(phoneVerified, phoneOTPSent, inputPhoneCode, setInputPhoneCode, handleVerifyPhoneOTP, true)}
                        
                        {/* Password Fields */}
                        {renderInput("lock-outline", "Password", password, setPassword, "default", true)}
                        {renderInput("lock-check-outline", "Confirm Password", confirmPassword, setConfirmPassword, "default", true)}

                        <TouchableWithoutFeedback
                            onPressIn={() => { onPressIn(); triggerRipple(); }}
                            onPressOut={onPressOut}
                            onPress={handleFinalRegister}
                            disabled={loading || !emailVerified || !phoneVerified}
                        >
                            <Animated.View style={{ width: "100%", transform: [{ scale: scaleAnim }] }}>
                                <LinearGradient colors={["#56ab2f", "#a8e063"]} style={[styles.button, (!emailVerified || !phoneVerified) && styles.disabledButton]}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                                    <Animated.View
                                        style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]}
                                    />
                                </LinearGradient>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        <Text style={styles.loginText}>
                            Already have an account?{" "}
                            <Text style={styles.loginLink} onPress={() => navigation.navigate("LoginScreen")}>
                                Login
                            </Text>
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

export default RegisterScreen;

// Styles
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: height * 0.05 },
    card: {
        width: "90%",
        paddingVertical: height * 0.04,
        paddingHorizontal: width * 0.05,
        borderRadius: 25,
        backgroundColor: "#fff",
        shadowColor: "#217908",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    title: { fontSize: width * 0.07, fontWeight: "bold", color: "#217908", textAlign: "center" },
    subtitle: { fontSize: width * 0.04, color: "#444", marginBottom: height * 0.02, textAlign: "center" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5, // Reduced border for a cleaner look
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 10, // Adjust padding for mobile look
        marginBottom: 16,
        backgroundColor: "#fff",
        borderColor: "#e0e0e0",
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
    },
    input: { flex: 1, fontSize: 16, color: "#333", padding: 0 },
    
    // --- New Inline Send OTP Styles ---
    inlineSendButton: {
        backgroundColor: '#1976D2',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 10,
    },
    inlineSendButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: width * 0.035,
    },
    otpSentStatus: {
        color: '#444',
        fontSize: width * 0.035,
        fontWeight: '500',
        marginLeft: 10,
    },
    // --- OTP Verification Section Styles (rendered conditionally below the input) ---
    otpSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: -10, // Adjust spacing to move it closer to the input field
    },
    otpInputContainer: {
        flex: 0.6, 
        marginBottom: 0,
        borderColor: "#1976D2", // Blue border to indicate active verification step
        backgroundColor: '#F3F8FF',
    },
    verifyButton: {
        flex: 0.35,
        height: Platform.OS === 'ios' ? 50 : 45, 
        borderRadius: 12,
        backgroundColor: '#4CAF50', // Green for final verification action
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    verifiedButton: {
        backgroundColor: '#4CAF50', 
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: width * 0.04,
    },
    // --- End OTP Specific Styles ---

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
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: width * 0.045 },
    loginText: { textAlign: "center", color: "#444", marginTop: height * 0.01 },
    loginLink: { color: "#217908", fontWeight: "600" },
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
