// src/screens/OTPScreen.js
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const OTPScreen = ({ navigation, route }) => {
  const { mobile } = route.params || {}; // ✅ prevent crash if no params
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState('');
  const inputRefs = useRef([]);
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      setErrors('');

      if (index < 5) {
        inputRefs.current[index + 1]?.focus(); // ✅ safe focus
      } else {
        Keyboard.dismiss();
      }
    }
  };

  const handleBackspace = (index) => {
    if (index > 0) {
      const newOtp = [...otp];
      newOtp[index] = ''; // clear current box
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus(); // ✅ safe focus
    }
  };

  const validateOtp = () => {
    const enteredOtp = otp.join('');
    if (!/^\d{6}$/.test(enteredOtp)) {
      setErrors('Please enter a valid 6-digit OTP');
      return false;
    }
    return true;
  };

  const handleVerify = () => {
    if (!validateOtp()) {
      Alert.alert('⚠️ Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    // ✅ Simulate success
    Alert.alert('🎉 Success', 'OTP Verified!');
    navigation.replace('HomeScreen');
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(new Array(6).fill(''));
    inputRefs.current[0]?.focus();
    Alert.alert('ℹ️ Info', 'A new OTP has been sent (simulation).');
  };

  return (
    <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: cardAnim }], opacity: cardAnim },
          ]}
        >
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{' '}
            <Text style={{ fontWeight: 'bold' }}>{mobile}</Text>
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[styles.otpBox, errors ? { borderColor: 'red' } : null]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !otp[index]) {
                    handleBackspace(index);
                  }
                }}
                ref={(ref) => (inputRefs.current[index] = ref)}
              />
            ))}
          </View>
          {errors ? <Text style={styles.errorText}>{errors}</Text> : null}

          {/* Verify Button */}
          <TouchableOpacity onPress={handleVerify} style={{ width: '100%' }}>
            <LinearGradient colors={['#56ab2f', '#a8e063']} style={styles.button}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend OTP */}
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: '90%',
    padding: 25,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#217908', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 25, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 5,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 15,
    shadowColor: '#56ab2f',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  timerText: { color: '#666', marginTop: 8 },
  resendText: { color: '#217908', fontWeight: '600', marginTop: 8 },
  errorText: { color: 'red', fontSize: 13, marginTop: -10, marginBottom: 15 },
});
