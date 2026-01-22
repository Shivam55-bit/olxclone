import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';

const ContactUs = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <Text style={styles.text}>
        Need help with buying or selling a product?  
        Our support team is here to assist you.
      </Text>

      <Text style={styles.subText}>
        Feel free to reach out to us for any queries, issues, or feedback.
      </Text>

      <View style={styles.contactBox}>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@SellBuyTM.com')}>
          <Text style={styles.link}>📧 support@SellBuyTM.com</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('tel:+911234567890')}>
          <Text style={styles.link}>📞 +91 12345 67890</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        We usually respond within 24 hours.
      </Text>
    </ScrollView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2e7d32',
  },
  text: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  subText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactBox: {
    marginBottom: 20,
    alignItems: 'center',
  },
  link: {
    fontSize: 16,
    color: '#1976d2',
    marginVertical: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});
