// FILE 3: src/screens/Chat.js
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatApi from '../apis/chatapi';

const IMAGE_BASE_URL = 'https://bhoomi.dinahub.live/';

// Dummy data for testing when API fails
const DUMMY_CHATS = [
  {
    user_id: '1',
    name: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=12',
    online: true,
    last_message: { content: 'Is this still available?', created_at: new Date().toISOString() },
    unread_count: 2,
  },
  {
    user_id: '2',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=5',
    online: false,
    last_message: { content: 'What is the best price?', created_at: new Date(Date.now() - 3600000).toISOString() },
    unread_count: 0,
  },
  {
    user_id: '3',
    name: 'Amit Patel',
    avatar: 'https://i.pravatar.cc/150?img=33',
    online: true,
    last_message: { content: 'Can we meet tomorrow?', created_at: new Date(Date.now() - 7200000).toISOString() },
    unread_count: 1,
  },
  {
    user_id: '4',
    name: 'Sneha Reddy',
    avatar: 'https://i.pravatar.cc/150?img=9',
    online: false,
    last_message: { content: 'Thanks for the info!', created_at: new Date(Date.now() - 86400000).toISOString() },
    unread_count: 0,
  },
  {
    user_id: '5',
    name: 'Vikas Singh',
    avatar: 'https://i.pravatar.cc/150?img=15',
    online: true,
    last_message: { content: 'I am interested in buying', created_at: new Date(Date.now() - 172800000).toISOString() },
    unread_count: 3,
  },
];

const ChatScreen = ({ navigation }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChatUsers();
    
    // Refresh chat list when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChatUsers();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchChatUsers = async () => {
    setLoading(true);
    setError(null);
    
    // Load saved chat list from AsyncStorage
    try {
      const chatListKey = 'chat_users_list';
      const savedChatList = await AsyncStorage.getItem(chatListKey);
      
      if (savedChatList) {
        const allChats = JSON.parse(savedChatList);
        // Filter: only show chats that have at least one message
        const chatsWithMessages = [];
        
        for (const chat of allChats) {
          const messagesKey = `chat_messages_${chat.user_id || chat.id}`;
          const messages = await AsyncStorage.getItem(messagesKey);
          
          if (messages && JSON.parse(messages).length > 0) {
            chatsWithMessages.push(chat);
          }
        }
        
        setChatUsers(chatsWithMessages);
      } else {
        setChatUsers([]);
      }
    } catch (err) {
      console.log("Error loading chats:", err);
      setChatUsers([]);
    } finally {
      setLoading(false);
    }
    
    /* Uncomment when backend is ready:
    try {
      const conversations = await ChatApi.getChatUsers(0, 20);
      setChatUsers(conversations && conversations.length > 0 ? conversations : []);
    } catch (err) {
      console.log("API not available");
      setChatUsers([]);
    } finally {
      setLoading(false);
    }
    */
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return ''; 
    const date = new Date(timestamp);
    if (new Date().toDateString() === date.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredChats = chatUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderChatUser = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 80} useNativeDriver>
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('ChatDetail', {
            conversationId: item.conversation_id || item.user_id || 'temp-conv-' + item.user_id, 
            receiverId: item.user_id,
            name: item.name,
            avatar: `${IMAGE_BASE_URL}${item.avatar}`,
            online: item.online,
            productId: item.product_id || null, 
          });
        }}
      >
        <LinearGradient colors={['#1FA055', '#16C27B']} style={styles.avatarBorder}>
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${item.avatar}` }}
            style={styles.avatar}
          />
          {item.online && <View style={styles.onlineDot} />}
        </LinearGradient>

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.last_message && (
              <Text style={styles.timestamp}>
                {formatTime(item.last_message.created_at)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.last_message ? item.last_message.content : 'No messages yet'}
            </Text>
            {item.unread_count > 0 && (
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                easing="ease-out"
                style={styles.unreadBadge}
              >
                <Text style={styles.unreadText}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </Animatable.View>
            )}
          </View>
        </View>

        <Icon name="chevron-right" size={22} color="#16A34A" />
      </TouchableOpacity>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
        <LinearGradient colors={['#0C8643', '#16C27B']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <ActivityIndicator size="large" color="#16A34A" style={{ marginTop: 60 }} />
        <Text style={styles.loadingText}>Loading your chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
        <LinearGradient colors={['#0E6C3B', '#17A854']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <Icon name="close-circle-outline" size={80} color="#FF5252" style={{ marginTop: 60 }} />
        <Text style={styles.errorText}>{'Failed to load chats.' + (error ? `\nDetails: ${error}` : '')}</Text>
        <TouchableOpacity onPress={fetchChatUsers} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredChats.length === 0 && search === '') {
    return (
      <LinearGradient colors={['#E8F5E9', '#FFFFFF']} style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
        <LinearGradient colors={['#0F8C4A', '#14B56D']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <Icon name="message-text-outline" size={100} color="#16A34A" />
        <Text style={styles.emptyTitle}>No Conversations Yet</Text>
        <Text style={styles.emptySubtitle}>Start chatting to see messages here!</Text>
      </LinearGradient>
    );
  } else if (filteredChats.length === 0 && search !== '') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
        <LinearGradient colors={['#0C8643', '#16C27B']} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#777" style={{ marginLeft: 10 }} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.emptySearchContainer}>
          <Icon name="magnify-remove-outline" size={60} color="#999" />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>Try a different name or keyword.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />

      <LinearGradient colors={['#0C8643', '#16C27B']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={22} color="#777" style={{ marginLeft: 10 }} />
        <TextInput
          placeholder="Search conversations..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.user_id}
        renderItem={renderChatUser}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  flatList: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
    color: '#1A1A1A',
  },
  listContent: { padding: 16 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E0E0E0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  timestamp: { fontSize: 12, color: '#757575' },
  messageRow: { flexDirection: 'row', alignItems: 'center' },
  lastMessage: { flex: 1, fontSize: 14, color: '#616161' },
  unreadBadge: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#555' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 10, color: '#777', textAlign: 'center', fontSize: 15, paddingHorizontal: 20 },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  }
});

export default ChatScreen;
