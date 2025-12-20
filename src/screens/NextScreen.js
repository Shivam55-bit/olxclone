import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

export default function NextScreen({ route, navigation }) {
  const { data } = route.params; // form data from previous screen
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);

  // Pick images from gallery
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 5, // allows multiple images (max 5)
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled picker");
        } else if (response.errorMessage) {
          Alert.alert("Error", response.errorMessage);
        } else {
          const uris = response.assets.map((a) => a.uri);
          setImages([...images, ...uris]);
        }
      }
    );
  };

  // Open camera
  const openCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera");
        } else if (response.errorMessage) {
          Alert.alert("Error", response.errorMessage);
        } else {
          setImages([...images, response.assets[0].uri]);
        }
      }
    );
  };

  // Pick location (dummy for now)
  const pickLocation = () => {
    setLocation("📍 New York, USA"); // later use react-native-maps / geolocation
  };

  // Final post
  const handlePostAd = () => {
    const finalData = {
      ...data,
      photos: images,
      location: location,
    };
    console.log("FINAL AD DATA:", finalData);
    Alert.alert("✅ Success", "Ad Posted Successfully!");
    navigation.popToTop();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📸 Upload Photos</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadText}>+ From Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtn} onPress={openCamera}>
          <Text style={styles.uploadText}>📷 Open Camera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageGrid}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.imageThumb} />
        ))}
      </View>

      <Text style={styles.header}>📍 Select Location</Text>
      <TouchableOpacity style={styles.locationBtn} onPress={pickLocation}>
        <Text style={styles.locationText}>
          {location ? location : "Choose Location"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.postBtn} onPress={handlePostAd}>
        <Text style={styles.postText}>🚀 Post Ad</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  uploadBtn: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  imageThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    margin: 5,
  },
  locationBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 25,
    elevation: 2,
  },
  locationText: {
    color: "#444",
    fontWeight: "500",
  },
  postBtn: {
    backgroundColor: "green",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  postText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
