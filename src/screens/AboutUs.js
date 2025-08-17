import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AboutUs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.text}>
        This app helps users buy and sell products easily. 
        Our goal is to connect sellers with buyers in a safe and simple way.
      </Text>
    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 16, color: '#555', textAlign: 'center' },
});
