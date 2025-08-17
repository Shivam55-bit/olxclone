import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function AddScreen() {
  const navigation = useNavigation();

  const [images, setImages] = useState([
    { id: 1, uri: 'https://via.placeholder.com/100', type: 'cover' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  // Controlled form states
  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');

  const addPhoto = () => {
    if (images.length >= 8) {
      Alert.alert('Limit Reached', 'You can only add up to 8 photos.');
      return;
    }
    setModalVisible(true);
  };

  const pickImage = async (type) => {
    let result;
    const options = { mediaType: 'photo', quality: 0.7 };

    if (type === 'camera') {
      result = await launchCamera(options);
    } else {
      result = await launchImageLibrary(options);
    }

    if (result?.assets?.length > 0) {
      const newImage = {
        id: Date.now(),
        uri: result.assets[0].uri,
        type: 'normal',
      };
      setImages([...images, newImage]);
    }
    setModalVisible(false);
  };

  const handleNext = () => {
    if (!brand || !title || !price || !condition || !location) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }

    const formData = { images, brand, title, price, purchaseDate, condition, location };
    navigation.navigate('PreviewAd', { formData });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <Text style={styles.header}>Create Your Ad</Text>

        {/* Photos Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upload Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              {images.map((img) => (
                <View key={img.id} style={styles.photoBox}>
                  <Image source={{ uri: img.uri }} style={styles.photo} />
                  <Text style={styles.photoLabel}>
                    {img.type === 'cover' ? 'Cover photo' : 'Item picture'}
                  </Text>
                </View>
              ))}

              {/* Add photo button */}
              <TouchableOpacity style={[styles.photoBox, styles.addPhoto]} onPress={addPhoto}>
                <Icon name="camera" size={26} color="#4caf50" />
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Text style={styles.hint}>Add up to 8 photos</Text>
        </View>

        {/* Item Info Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          {/* Brand */}
          <View style={styles.inputRow}>
            <Icon name="pricetag" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Brand (e.g., Apple, Nike)"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          {/* Title */}
          <View style={styles.inputRow}>
            <Icon name="document-text" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Ad Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          {/* Price */}
          <View style={styles.inputRow}>
            <Icon name="cash" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Price (in $)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          {/* Purchase Date */}
          <View style={styles.inputRow}>
            <MIcon name="date-range" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Purchase Date (mm-dd-yyyy)"
              value={purchaseDate}
              onChangeText={setPurchaseDate}
            />
          </View>
          {/* Condition */}
          <View style={styles.inputRow}>
            <MIcon name="check-circle-outline" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Condition (New, Used, etc.)"
              value={condition}
              onChangeText={setCondition}
            />
          </View>
          {/* Location */}
          <View style={styles.inputRow}>
            <Icon name="location-sharp" size={18} color="#4caf50" />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating ADD button with gradient */}
      <View style={styles.nextWrapper}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.9}>
          <LinearGradient colors={['#66bb6a', '#43a047']} style={styles.nextButton}>
            <Text style={styles.nextText}>POST AD</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Photo</Text>

            <TouchableOpacity style={styles.option} onPress={() => pickImage('camera')}>
              <Icon name="camera" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => pickImage('gallery')}>
              <Icon name="image" size={24} color="#34C759" />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { fontSize: 22, fontWeight: '700', margin: 18, color: '#2e7d32', letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  photoBox: { marginRight: 12, alignItems: 'center' },
  photo: { width: 95, height: 95, borderRadius: 12, backgroundColor: '#eee' },
  photoLabel: { fontSize: 12, marginTop: 6, color: '#666' },
  addPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf7ea',
    width: 95,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  addText: { fontSize: 12, color: '#4caf50', marginTop: 4 },
  hint: { fontSize: 12, color: '#888', marginTop: 10 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  input: { flex: 1, fontSize: 14, padding: 10, color: '#333' },
  nextWrapper: { position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center' },
  nextButton: { paddingVertical: 14, paddingHorizontal: 100, borderRadius: 28, elevation: 5 },
  nextText: { fontSize: 16, color: '#fff', fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionText: { fontSize: 16, marginLeft: 10 },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  cancelText: { color: 'red', fontSize: 16 },
});
