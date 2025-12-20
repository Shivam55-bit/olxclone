// src/screens/PropertyDetails.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { propertyForms } from "./forms/propertyForms";

export default function PropertyDetails({ route, navigation }) {
  const { category } = route.params || {};

  if (!category) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient
          colors={["#27ae60", "#1e8449"]}
          style={styles.headerContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Error</Text>
            <View style={{ width: 26 }} />
          </View>
        </LinearGradient>

        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>
            ⚠️ Category not found. Please go back and select again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formFields = propertyForms[category.id] || [];
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    navigation.navigate("NextStep", { formData, category });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ✅ Gradient Header */}
      <LinearGradient
        colors={["#27ae60", "#1e8449"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {category.title}
          </Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* ✅ Dynamic Form Fields */}
        {formFields.map((field, index) => (
          <View key={index} style={styles.fieldWrapper}>
            <Text style={styles.label}>{field.label}</Text>

            {field.type === "dropdown" ? (
              <View style={styles.choiceWrapper}>
                {field.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.choiceBtn,
                      formData[field.key] === opt && styles.choiceSelected,
                    ]}
                    onPress={() => handleChange(field.key, opt)}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        formData[field.key] === opt && { color: "#fff" },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder={`Enter ${field.label}`}
                placeholderTextColor="#888"
                keyboardType={field.type === "number" ? "numeric" : "default"}
                value={formData[field.key] || ""}
                onChangeText={(text) => handleChange(field.key, text)}
              />
            )}
          </View>
        ))}

        {/* ✅ Upload Section (Unified Media Upload) */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload Media</Text>
          <TouchableOpacity style={styles.mediaUploadBtn}>
            <Icon name="image-multiple" size={28} color="#fff" />
            <Text style={styles.uploadText}>Add Photos / Videos</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Location Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationBtn}>
            <Icon name="map-marker" size={26} color="#fff" />
            <Text style={styles.locationText}>Add Location</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Next Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },

  // ✅ Header
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { padding: 6 },

  errorWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },

  // ✅ Form
  fieldWrapper: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 12,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    elevation: 1,
  },

  // ✅ Choice Buttons
  choiceWrapper: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  choiceBtn: {
    borderWidth: 1,
    borderColor: "#27ae60",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#f0fdf4",
  },
  choiceSelected: { backgroundColor: "#27ae60", borderColor: "#27ae60" },
  choiceText: { fontSize: 14, color: "#27ae60", fontWeight: "500" },

  // ✅ Upload Section
  uploadSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#333" },

  // ✅ Unified Media Upload Button
  mediaUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  uploadText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10, // ✅ spacing between icon & text
  },

  // ✅ Location Button
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  locationText: { color: "#fff", fontSize: 15, fontWeight: "700", marginLeft: 8 },

  // ✅ Next Button
  nextBtn: {
    backgroundColor: "#1e8449",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
