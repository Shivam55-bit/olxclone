// SellForm.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

// ✅ Category field definitions
const categoryFields = {
  electronics: [
    { label: "Brand", type: "text", key: "brand" },
    { label: "Model", type: "text", key: "model" },
    { label: "Warranty (months)", type: "number", key: "warranty" },
  ],
  fashion: [
    { label: "Size", type: "dropdown", key: "size", options: ["S", "M", "L", "XL"] },
    { label: "Color", type: "text", key: "color" },
    { label: "Material", type: "text", key: "material" },
  ],
  car: [
    { label: "Mileage (km)", type: "number", key: "mileage" },
    { label: "Year", type: "number", key: "year" },
    { label: "Fuel Type", type: "dropdown", key: "fuelType", options: ["Petrol", "Diesel", "Electric"] },
  ],
};

const SellForm = ({ route }) => {
  const { category } = route.params;
  console.log("Selected Category: ", category); // 👈 check what comes
  const fields = categoryFields[category] || [];


  const [formData, setFormData] = useState({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("Form Data Submitted:", formData);
    alert("Item Posted Successfully 🚀");
  };

  // ✅ Renders each input field
  const renderField = ({ item }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{item.label}</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter ${item.label}`}
        keyboardType={item.type === "number" ? "numeric" : "default"}
        value={formData[item.key] || ""}
        onChangeText={(value) => handleChange(item.key, value)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sell Your {category}</Text>

      <FlatList
        data={fields}
        renderItem={renderField}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Post Item</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SellForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
