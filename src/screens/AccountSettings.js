import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AccountSettings = () => {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Account Settings</Text>

            <Text style={styles.text}>Here you can update your account details.</Text>
        </View>
    );
};

export default AccountSettings;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    text: { fontSize: 16, color: '#555' },
});
