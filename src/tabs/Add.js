// Add.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Add({ navigation }) {
  useEffect(() => {
    // Redirect to SellCategories as soon as "Sell" tab is clicked
    navigation.replace('SellCategories');
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2e7d32" />
    </View>
  );
}
