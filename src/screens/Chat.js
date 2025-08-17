// src/screens/Chat.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const chats = [
  {
    id: '1',
    name: 'John Doe',
    message: 'Hey! How are you?',
    time: '10:30 AM',
    unread: true,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    message: 'Let’s meet tomorrow.',
    time: '09:15 AM',
    unread: false,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Mark Wilson',
    message: 'Got the files.',
    time: 'Yesterday',
    unread: true,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

const Chat = () => {
  const navigation = useNavigation();

  const renderItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', {name: item.name})}>
      <Image source={{uri: item.avatar}} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.chatMessage,
              item.unread && {fontWeight: '600', color: '#111'},
            ]}
            numberOfLines={1}>
            {item.message}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#217908', '#4CAF50']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Image
          source={{uri: 'https://randomuser.me/api/portraits/men/5.jpg'}}
          style={styles.headerAvatar}
        />
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="search-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 90}}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('NewChat')}>
        <LinearGradient
          colors={['#4CAF50', '#217908']}
          style={styles.fabGradient}>
          <Icon name="chatbubble-ellipses-outline" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9f9f9'},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerActions: {flexDirection: 'row'},
  headerIcon: {marginLeft: 20},

  // Chat Items
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chatInfo: {flex: 1},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    maxWidth: '75%',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#217908',
    marginLeft: 6,
  },

  // Floating Button
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    borderRadius: 35,
    elevation: 6,
    shadowColor: '#217908',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
