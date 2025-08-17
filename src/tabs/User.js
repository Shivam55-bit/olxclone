// User.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const User = () => {
  const navigation = useNavigation();

  const handlePress = (tab) => {
    switch (tab) {
      case 'settings':
        navigation.navigate('AccountSettings');
        break;
      case 'ads':
        navigation.navigate('MyAdds');
        break;
      case 'wishlist':
        navigation.navigate('Wishlist');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'about':
        navigation.navigate('AboutUs');
        break;
      case 'contact':
        navigation.navigate('ContactUs');
        break;
      case 'share':
        Alert.alert('Share App', 'You can share the app link here.');
        break;
      case 'logout':
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Samantha Smith</Text>
          <Text style={styles.location}>Mumbai, Maharashtra</Text>
        </View>
        <TouchableOpacity onPress={() => handlePress('settings')}>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem icon="albums-outline" label="My Ads" onPress={() => handlePress('ads')} />
        <MenuItem icon="heart-outline" label="Favorites" onPress={() => handlePress('wishlist')} />
        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => handlePress('notifications')} />
        <MenuItem icon="information-circle-outline" label="About Us" onPress={() => handlePress('about')} />
        <MenuItem icon="mail-outline" label="Contact Us" onPress={() => handlePress('contact')} />
        <MenuItem icon="share-social-outline" label="Share App" onPress={() => handlePress('share')} />
        <MenuItem icon="log-out-outline" label="Logout" color="#e63946" onPress={() => handlePress('logout')} />
      </View>
    </ScrollView>
  );
};

const MenuItem = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={color} style={{ marginRight: 12 }} />
    <Text style={[styles.menuText, { color }]}>{label}</Text>
    <View style={{ flex: 1 }} />
    <Ionicons name="chevron-forward-outline" size={18} color="#999" />
  </TouchableOpacity>
);

export default User;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    padding: 15,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#217908',
    padding: 18,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  location: {
    fontSize: 13,
    color: '#e0e0e0',
    marginTop: 2,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
