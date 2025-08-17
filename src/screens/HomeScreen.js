// HomeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import all tab screens
import Home from '../tabs/Home';
import Chat from '../screens/Chat'; // ✅ Import Chat screen
import Search from '../tabs/Search';
import Add from '../tabs/Add';
import MyAdds from '../tabs/MyAdds'; // ✅ Correct import for My Ads
import User from '../tabs/User';

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState(0);

  const renderScreen = () => {
    switch (selectedTab) {
      case 0:
        return <Home />;
      case 1:
        return <Chat />; // ✅ Show Chat screen here
      case 2:
        return <Add />;
      case 3:
        return <MyAdds />; // ✅ Now showing My Ads
      case 4:
        return <User />;
      default:
        return <Home />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab(0)}>
          <Icon name="home" size={28} color={selectedTab === 0 ? '#2e7d32' : '#222'} />
          <Text style={[styles.tabLabel, selectedTab === 0 && { color: '#2e7d32' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab(1)}>
          <Icon name="chatbubble-outline" size={28} color={selectedTab === 1 ? '#2e7d32' : '#222'} />
          <Text style={[styles.tabLabel, selectedTab === 1 && { color: '#2e7d32' }]}>Chats</Text>
        </TouchableOpacity>

        {/* Sell/Add Button */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => setSelectedTab(2)}
          activeOpacity={0.8}
        >
          <View style={styles.sellButtonCircle}>
            <Icon name="add" size={32} color="white" />
          </View>
          <Text style={styles.sellLabel}>Sell</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab(3)}>
          <Icon name="list-outline" size={28} color={selectedTab === 3 ? '#2e7d32' : '#222'} />
          <Text style={[styles.tabLabel, selectedTab === 3 && { color: '#2e7d32' }]}>My Ads</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab(4)}>
          <Icon name="person-outline" size={28} color={selectedTab === 4 ? '#2e7d32' : '#222'} />
          <Text style={[styles.tabLabel, selectedTab === 4 && { color: '#2e7d32' }]}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bottomTabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    color: '#222',
  },
  sellButton: {
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 20,
  },

  sellButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: 'linear-gradient(45deg, #2e7d32, #66bb6a)', // if expo-linear-gradient used
    backgroundColor: '#2e7d32', // fallback if not using gradient
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  sellLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    color: '#2e7d32',
  },

});
