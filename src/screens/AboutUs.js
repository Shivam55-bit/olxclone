import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutUs = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About Us</Text>

      <Text style={styles.text}>
        Welcome to our SellBuyTM app – a simple and trusted platform to buy and sell products locally.
      </Text>

      <Text style={styles.text}>
        Our app allows users to list their products, explore nearby deals, and connect directly
        with buyers or sellers without any middlemen.
      </Text>

      <Text style={styles.subTitle}>What We Offer</Text>

      <Text style={styles.text}>
        • Easy product listing with images and details{"\n"}
        • Buy and sell new or used items{"\n"}
        • Direct chat between buyers and sellers{"\n"}
        • Safe and user-friendly experience
      </Text>

      <Text style={styles.subTitle}>Our Mission</Text>

      <Text style={styles.text}>
        Our mission is to make local buying and selling fast, secure, and accessible for everyone.
        We believe in giving products a second life and helping users save money while earning from unused items.
      </Text>
    </ScrollView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#2e7d32', // 🌿 green
  },
  subTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#2e7d32', // 🌿 green
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
});
