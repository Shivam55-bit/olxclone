// ✅ src/screens/MoreItemForm.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function MoreItemForm({ route, navigation }) {
  const { category } = route.params;

  // ✅ Render different form sections based on category
  const renderForm = () => {
    switch (category.id) {
      case "services":
        return (
          <>
            <FloatingLabelInput label="Service Title" icon="briefcase" />
            <FloatingLabelInput label="Description" icon="text" multiline />
            <FloatingLabelInput label="Experience (Years)" icon="calendar" keyboardType="numeric" />
            <FloatingLabelInput label="Price / Hour or Fixed" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Service Features"
              options={["Home Delivery", "Online Support", "Free Consultation", "24/7 Availability"]}
            />
          </>
        );
      case "furniture":
        return (
          <>
            <FloatingLabelInput label="Furniture Name" icon="sofa" />
            <FloatingLabelInput label="Material (Wood/Metal/Plastic)" icon="cube" />
            <FloatingLabelInput label="Condition (New/Used)" icon="tag" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Furniture Features"
              options={["Foldable", "Warranty Included", "Lightweight", "Custom Made"]}
            />
          </>
        );
      case "fashion":
        return (
          <>
            <FloatingLabelInput label="Item Name" icon="tshirt-crew" />
            <FloatingLabelInput label="Brand" icon="star" />
            <FloatingLabelInput label="Size" icon="ruler" />
            <FloatingLabelInput label="Condition (New/Used)" icon="tag" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Fashion Features"
              options={["Unisex", "Limited Edition", "Eco Friendly Fabric", "Handmade"]}
            />
          </>
        );
      case "sports":
        return (
          <>
            <FloatingLabelInput label="Sports Item Name" icon="basketball" />
            <FloatingLabelInput label="Category (Cricket, Football, etc.)" icon="trophy" />
            <FloatingLabelInput label="Condition (New/Used)" icon="tag" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Sports Features"
              options={["Professional Grade", "Beginner Friendly", "Warranty Included", "Portable"]}
            />
          </>
        );
      case "pets":
        return (
          <>
            <FloatingLabelInput label="Pet Type (Dog, Cat, etc.)" icon="paw" />
            <FloatingLabelInput label="Breed" icon="dog" />
            <FloatingLabelInput label="Age (Months/Years)" icon="calendar" />
            <FloatingLabelInput label="Vaccination Status" icon="needle" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Pet Features"
              options={["Trained", "Vaccinated", "With Papers", "Healthy Check-up"]}
            />
          </>
        );
      case "books":
        return (
          <>
            <FloatingLabelInput label="Book Title" icon="book" />
            <FloatingLabelInput label="Author" icon="account" />
            <FloatingLabelInput label="Genre" icon="library" />
            <FloatingLabelInput label="Condition (New/Used)" icon="tag" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Book Features"
              options={["Signed Copy", "Collector Edition", "Limited Print", "Free Bookmark"]}
            />
          </>
        );
      case "others":
        return (
          <>
            <FloatingLabelInput label="Item Name" icon="cube" />
            <FloatingLabelInput label="Description" icon="text" multiline />
            <FloatingLabelInput label="Condition (New/Used)" icon="tag" />
            <FloatingLabelInput label="Price" icon="currency-usd" keyboardType="numeric" />

            <FeatureSection
              title="Other Item Features"
              options={["Limited Edition", "Rare Item", "Warranty Included", "Handmade"]}
            />
          </>
        );
      default:
        return <Text>No form available</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ✅ Green Gradient Header */}
      <LinearGradient
        colors={["#43a047", "#2e7d32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.title} Form</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      {/* ✅ Form Container */}
      <ScrollView style={styles.formContainer} contentContainerStyle={{ padding: 16 }}>
        {renderForm()}

        {/* ✅ Submit Button */}
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Floating Label Input with Icon
const FloatingLabelInput = ({ label, icon, multiline, keyboardType }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const animated = new Animated.Value(value ? 1 : 0);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 40,
    top: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: animated.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#2e7d32"],
    }),
    backgroundColor: "#fff",
    paddingHorizontal: 4,
  };

  return (
    <View
      style={[
        styles.inputContainer,
        { borderColor: isFocused ? "#2e7d32" : "#e0e0e0" },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={isFocused ? "#2e7d32" : "#999"}
          style={styles.inputIcon}
        />
      )}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
      />
    </View>
  );
};

// ✅ Feature Section with checkboxes
const FeatureSection = ({ title, options }) => {
  const [selected, setSelected] = useState([]);

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  return (
    <View style={{ marginTop: 20, marginBottom: 10 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      {options.map((opt, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.featureItem}
          onPress={() => toggleOption(opt)}
        >
          <Icon
            name={selected.includes(opt) ? "checkbox-marked" : "checkbox-blank-outline"}
            size={22}
            color="#2e7d32"
          />
          <Text style={styles.featureText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { padding: 4 },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -12,
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingLeft: 40,
    paddingTop: 18,
    paddingRight: 12,
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 20,
  },
  input: {
    fontSize: 15,
    color: "#000",
    paddingVertical: 12,
    top: -10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1b5e20",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  submitBtn: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
