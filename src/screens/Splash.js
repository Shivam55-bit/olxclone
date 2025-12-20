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

const Particle = ({ delay }) => {
  const moveY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loopAnim = () => {
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
      ]).start(() => loopAnim());
    };
    loopAnim();
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

const SplashScreen = ({ navigation }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const moveUpAnim = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const versionFade = useRef(new Animated.Value(0)).current;
  const versionScale = useRef(new Animated.Value(0.8)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse loop around logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo intro animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Bounce + move up
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(moveUpAnim, {
          toValue: -220,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start(() => {
          // Reveal tagline + version
          Animated.stagger(500, [
            Animated.parallel([
              Animated.timing(taglineFade, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(taglineSlide, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(versionFade, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.spring(versionScale, {
                toValue: 1,
                friction: 4,
                tension: 50,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            // Shine sweep across logo
            Animated.timing(shineAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              setTimeout(() => {
                navigation.replace("LoginScreen");
              }, 1200);
            });
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
    outputRange: [-300, 300],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a7f54" />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#0a7f54", "#11a86b", "#72d48a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: Math.random() * 400, // random X position
              bottom: -50, // start below screen
            }}
          >
            <Particle delay={i * 600} />
          </View>
        ))}
      </View>

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.12,
            transform: [
              {
                translateX: bgAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 300],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", "white", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Logo pulse + shine */}
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
        {/* Pulsing circle */}
        <Animated.View
          style={[
            styles.pulseCircle,
            { transform: [{ scale: pulseScale }] },
          ]}
        />
        {/* Logo */}
        <Image
          source={require("../images/Blogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Shine sweep */}
        <Animated.View
          style={[
            styles.shine,
            {
              transform: [{ translateX: shineTranslate }, { rotate: "25deg" }],
            },
          ]}
        >
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.7)", "transparent"]}
            style={styles.shine}
          />
        </Animated.View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineBox,
          {
            opacity: taglineFade,
            transform: [{ translateY: taglineSlide }],
          },
        ]}
      >
        <Text style={styles.tagline}>Developed By Shivam Shishodia</Text>
      </Animated.View>

      {/* Version */}
      <Animated.View
        style={[
          styles.bottomNote,
          {
            opacity: versionFade,
            transform: [{ scale: versionScale }],
          },
        ]}
      >
        <Text style={styles.versionText}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a7f54" },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logo: {
    width: 240,
    height: 240,
    tintColor: "#ffffff",
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
    height: 240,
  },
  taglineBox: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  bottomNote: {
    alignItems: "center",
    paddingBottom: 28,
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  particle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
