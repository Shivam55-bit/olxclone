// src/screens/RegisterScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [createpassword, setCreatePassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, []);

  const handleRegister = () => {
    if (!email || !name || !mobile || !createpassword || !confirmpassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (createpassword !== confirmpassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Account created!');
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        {/* Animated Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: cardAnim }],
              opacity: cardAnim,
            },
          ]}
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey</Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color="#217908" />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color="#217908" />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone-outline" size={20} color="#217908" />
            <TextInput
              placeholder="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password with toggle */}
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#217908" />
            <TextInput
              placeholder="Create Password"
              value={createpassword}
              onChangeText={setCreatePassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-check-outline" size={20} color="#217908" />
            <TextInput
              placeholder="Confirm Password"
              value={confirmpassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} style={{ width: '100%' }}>
            <LinearGradient colors={['#56ab2f', '#a8e063']} style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Social buttons */}
          <Text style={styles.orText}>Or sign up with</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="google" size={22} color="#db4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="facebook" size={22} color="#1877F2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Link to login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#217908', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 20, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,245,245,0.9)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
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
  orText: { textAlign: 'center', marginVertical: 10, color: '#666' },
  socialRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
  },
  socialText: { marginLeft: 8, fontWeight: '600', color: '#333' },
  link: { textAlign: 'center', color: '#444', marginTop: 10 },
  linkBold: { color: '#217908', fontWeight: '600' },
});

export default RegisterScreen;
