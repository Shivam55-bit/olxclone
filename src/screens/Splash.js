import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------------- PARTICLE COMPONENT ---------------- */
const Particle = ({ delay }) => {
  const moveY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      moveY.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(moveY, {
          toValue: -700,
          duration: 9000,
          easing: Easing.linear,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateY: moveY }, { scale }],
        },
      ]}
    />
  );
};

/* ---------------- SPLASH SCREEN ---------------- */
const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const moveUpAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const versionFade = useRef(new Animated.Value(0)).current;
  const versionScale = useRef(new Animated.Value(0.8)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo intro
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(moveUpAnim, {
        toValue: -220,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        Animated.stagger(400, [
          Animated.parallel([
            Animated.timing(taglineFade, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(taglineSlide, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(versionFade, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.spring(versionScale, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(async () => {
              // Check if user has a valid token
              try {
                const accessToken = await AsyncStorage.getItem("access_token");
                if (accessToken) {
                  // User is logged in, go to HomeScreen
                  navigation.replace("HomeScreen");
                } else {
                  // No token, go to LoginScreen
                  navigation.replace("LoginScreen");
                }
              } catch (error) {
                console.error("Error checking auth status:", error);
                navigation.replace("LoginScreen");
              }
            }, 1200);
          });
        });
      });
    });
  }, []);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-90deg", "0deg"],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, 250],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a4c36" />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#1a4c36", "#2e7d32", "#43a047", "#66bb6a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Particles */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={{ position: "absolute", left: Math.random() * 400, bottom: -50 }}
          >
            <Particle delay={i * 600} />
          </View>
        ))}
      </View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.centerBox,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: moveUpAnim },
              { rotateY },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: pulseScale }] },
          ]}
        />

        <View style={styles.logoContainer}>
          <Image 
            source={require('../images/sellbuytm_logo-Photoroom.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Animated.View
          style={[
            styles.shine,
            { transform: [{ translateX: shineTranslate }, { rotate: "25deg" }] },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.7)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineBox,
          { opacity: taglineFade, transform: [{ translateY: taglineSlide }] },
        ]}
      >
        <Text style={styles.tagline}>Buy & Sell Everything</Text>
      </Animated.View>

      {/* Version */}
      <Animated.View
        style={[
          styles.bottomNote,
          { opacity: versionFade, transform: [{ scale: versionScale }] },
        ]}
      >
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a4c36" },

  centerBox: { flex: 1, alignItems: "center", justifyContent: "center" },

  logoContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 140,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImage: {
    width: 180,
    height: 180,
  },

  pulseCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  shine: {
    position: "absolute",
    width: 200,
    height: 260,
  },

  taglineBox: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    width: "100%",
  },

  tagline: {
    fontSize: 16,
    color: "#fff",
    letterSpacing: 1.5,
    fontWeight: "600",
  },

  bottomNote: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },

  versionText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  particle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(129,199,132,0.8)",
  },
});
