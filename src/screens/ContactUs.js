import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';

const ContactUs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.text}>Have questions? Reach us at:</Text>

      <TouchableOpacity onPress={() => Linking.openURL('mailto:support@example.com')}>
        <Text style={styles.link}>support@example.com</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL('tel:+911234567890')}>
        <Text style={styles.link}>+91 12345 67890</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, color: '#555', marginBottom: 10 },
  link: { fontSize: 16, color: '#1976d2', marginTop: 5 },
});
