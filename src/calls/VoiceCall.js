import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";

const VoiceCall = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { name } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Calling...</Text>
      <Text style={styles.subtitle}>{name}</Text>

      <TouchableOpacity
        style={styles.endCallBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="call" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#222" },
  title: { fontSize: 22, color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#aaa" },
  endCallBtn: {
    marginTop: 40,
    backgroundColor: "red",
    padding: 20,
    borderRadius: 50,
  },
});

export default VoiceCall;
