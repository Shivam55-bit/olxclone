//App.js
import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/AppNavigator';
const App = () => {
  try {
    return <AppNavigator/>;
  } catch (error) {
    console.error('❌ App Error:', error);
    return null;
  }
};

export default App;