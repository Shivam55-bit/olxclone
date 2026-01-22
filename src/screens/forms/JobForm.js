// src/screens/JobForm.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Switch,
  Animated,
  Alert, // 🔑 NEW: For displaying alerts
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { createAd } from "../../apis/adsService"; // 🔑 NEW: API Service Import - Adjust path as needed

// --- Constants ---
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aXQlMjBjb21wYW55fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600";
const DEFAULT_CONDITION = "new"; // As per cURL
const DEFAULT_BRAND = "Job Ad";
const DEFAULT_MODEL = "Standard";
const DEFAULT_YEAR = 2024;
const DEFAULT_PRICE_IF_SALARY_MISSING = 1; // API requires 'price' > 0.

// ✅ FloatingLabelInput Component (Updated with `required` prop)
const FloatingLabelInput = ({ label, value, onChangeText, keyboardType, multiline, icon, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
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
      outputRange: [16, 12],
    }),
    color: animated.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", isFocused ? "#2e7d32" : "#aaa"], // Focus color applied to label
    }),
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    zIndex: 1, // Ensure label is above TextInput
  };

  return (
    <View style={[styles.inputContainer, { borderColor: isFocused ? "#2e7d32" : "#e0e0e0" }]}> 
      {icon && (
        <Icon name={icon} size={20} color={isFocused ? "#2e7d32" : "#999"} style={styles.inputIcon} />
      )}
      <Animated.Text style={labelStyle}>{label}{required && ' *'}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
};

export default function JobForm({ route, navigation }) {
  const { category } = route.params;
  const [loading, setLoading] = useState(false); // 🔑 NEW: Loading state

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    salary: "", // Will be mapped to API 'price'
    location: "",
    jobType: "", // Mapped to "Job Type (...)"
    experience: "", // Mapped to "Experience Level (...)"
    remote: false, // Mapped to "Remote Work Allowed?"
    description: "",
    contact: "", // Mapped to "Contact Email / Phone"
    extra: "", // Mapped to category-specific detail
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const getExtraFieldName = (categoryId) => {
    switch (categoryId) {
      case "it": return "Required Skills (React, Python)";
      case "marketing": return "Marketing Focus (SEO, Ads, Social Media)";
      case "finance": return "Required Certifications (CPA, CFA)";
      case "education": return "Subject / Grade Level";
      case "healthcare": return "Specialization (Nurse, Surgeon)";
      default: return "Extra Detail";
    }
  };

  const handleSubmit = async () => {
    const { title, company, salary, location, jobType, experience, remote, description, contact, extra } = formData;
    
    // 1. Client-Side Validation 
    let validationErrors = [];
    if (!title) validationErrors.push("Job Title is required.");
    if (!company) validationErrors.push("Company Name is required.");
    if (!location) validationErrors.push("Location is required.");
    if (!jobType) validationErrors.push("Job Type is required.");
    if (!experience) validationErrors.push("Experience Level is required.");
    if (!description || description.length < 20) validationErrors.push("Job Description is required (min 20 chars).");
    if (!contact) validationErrors.push("Contact Email or Phone is required.");
    
    const numericSalary = salary ? Number(salary) : null;
    if (salary && (isNaN(numericSalary) || numericSalary < 0)) {
        validationErrors.push("Salary must be a valid number or left blank.");
    }

    if (validationErrors.length > 0) {
      Alert.alert("Validation Failed", validationErrors.join('\n'));
      return;
    }
    
    setLoading(true);

    try {
        // 2. Construct API Payload
        const payload = {
            category_name: category.title,
            title: title, // Use the user-provided title
            description: description,
            
            // The API uses 'price' for salary. If salary is blank, use a minimal non-zero value.
            price: numericSalary > 0 ? numericSalary : DEFAULT_PRICE_IF_SALARY_MISSING, 
            
            location: location,
            condition: DEFAULT_CONDITION,
            
            // Fields to satisfy API requirements, using defaults or placeholders
            brand: DEFAULT_BRAND,
            model: DEFAULT_MODEL,
            year: DEFAULT_YEAR,
            
            // The cURL uses a single image. We will hardcode this since the form has no image uploader yet.
            images: [DEFAULT_IMAGE_URL],
            
            // ⭐️ CRITICAL FIX: Nested 'details' object matching cURL keys
            details: {
                "Job Type (Full-time, Part-time, Internship)": jobType,
                "Experience Level (Junior, Mid, Senior)": experience,
                "Remote Work Allowed?": remote ? "true" : "false", // Convert boolean to string "true"/"false"
                "Contact Email / Phone": contact,
                "Company Name": company,
                // Include the extra field only if it was rendered/used
                ...(extra && { [getExtraFieldName(category.id)]: extra }),
            },
        };

        // 3. API Call
        await createAd(payload); 

        Alert.alert("Success", `Job posted in ${category.title} successfully! ✅`);
        navigation.goBack();
        
    } catch (error) {
        const errorMessage = error.message || "An unexpected error occurred while posting the job ad.";
        Alert.alert("Error Posting Job", errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const renderExtraField = () => {
    switch (category.id) {
      case "it":
        return (
          <FloatingLabelInput
            label="Required Skills (React, Python, etc.)"
            value={formData.extra}
            onChangeText={(t) => handleChange("extra", t)}
            icon="code-tags"
          />
        );
      case "marketing":
        return (
          <FloatingLabelInput
            label="Marketing Focus (SEO, Ads, Social Media)"
            value={formData.extra}
            onChangeText={(t) => handleChange("extra", t)}
            icon="bullhorn"
          />
        );
      case "finance":
        return (
          <FloatingLabelInput
            label="Required Certifications (CPA, CFA, etc.)"
            value={formData.extra}
            onChangeText={(t) => handleChange("extra", t)}
            icon="certificate"
          />
        );
      case "education":
        return (
          <FloatingLabelInput
            label="Subject / Grade Level"
            value={formData.extra}
            onChangeText={(t) => handleChange("extra", t)}
            icon="book-open"
          />
        );
      case "healthcare":
        return (
          <FloatingLabelInput
            label="Specialization (Nurse, Surgeon, etc.)"
            value={formData.extra}
            onChangeText={(t) => handleChange("extra", t)}
            icon="hospital"
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#2e7d32", "#227a27ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post in {category.title}</Text>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Updated Inputs with required prop */}
        <FloatingLabelInput label="Job Title" value={formData.title} onChangeText={(t) => handleChange("title", t)} icon="briefcase" required />
        <FloatingLabelInput label="Company Name" value={formData.company} onChangeText={(t) => handleChange("company", t)} icon="office-building" required />
        <FloatingLabelInput 
            label="Salary (Optional)" 
            value={formData.salary} 
            onChangeText={(t) => handleChange("salary", t.replace(/[^0-9]/g, ''))} // Ensure only numbers
            keyboardType="numeric" 
            icon="currency-usd" 
        />

        <FloatingLabelInput label="Job Type (Full-time, Part-time, Internship)" value={formData.jobType} onChangeText={(t) => handleChange("jobType", t)} icon="clock-outline" required />
        <FloatingLabelInput label="Experience Level (Junior, Mid, Senior)" value={formData.experience} onChangeText={(t) => handleChange("experience", t)} icon="star" required />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Remote Work Allowed?</Text>
          <Switch
            value={formData.remote}
            onValueChange={(val) => handleChange("remote", val)}
            trackColor={{ false: "#ccc", true: "#2e7d32" }}
            thumbColor={formData.remote ? "#fff" : "#f4f3f4"}
          />
        </View>

        <FloatingLabelInput label="Location (City, State)" value={formData.location} onChangeText={(t) => handleChange("location", t)} icon="map-marker" required />

        {renderExtraField()}

        <FloatingLabelInput 
            label="Job Description" 
            value={formData.description} 
            onChangeText={(t) => handleChange("description", t)} 
            multiline 
            icon="file-document" 
            required
        />

        <FloatingLabelInput label="Contact Email / Phone" value={formData.contact} onChangeText={(t) => handleChange("contact", t)} icon="email" required />

        <TouchableOpacity style={styles.uploadBtn}>
          <Icon name="paperclip" size={20} color="#2e7d32" />
          <Text style={styles.uploadText}>Attach File (Optional)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={handleSubmit} 
            style={styles.submitBtn}
            disabled={loading} // Disable button while loading
        >
          <Text style={styles.submitText}>{loading ? 'Posting...' : 'Post Job'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === "android" ? StatusBar.currentHeight : 20;

const styles = StyleSheet.create({
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
  formContainer: { padding: 16 },

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

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 14,
  },
  switchLabel: { fontSize: 15, color: "#333" },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e3f2fd",
    marginBottom: 20,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#1565c0",
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});