// src/screens/Splash.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Splash = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

    // Animate title + subtitle
    Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#0f9d58', '#34a853', '#b2f2bb']} // green gradient
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f9d58" />

      {/* Animated Logo */}
      <Animated.Image
        source={require('../images/logo.png')}
        style={[styles.logo, { transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />

      {/* Animated Title */}
      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
        GreenGo App
      </Animated.Text>

      {/* Animated Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Connecting Nature with Technology
      </Animated.Text>
    </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0ffe0',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
