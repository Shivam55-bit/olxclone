import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatApi from '../apis/chatapi'; 
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL } from '../apis/api';
import { getProfile } from '../apis/profile';

// --- Constants (Adjust as necessary) ---
const IMAGE_BASE_URL = BASE_URL;

const ChatDetailScreen = ({ route, navigation }) => {
    const { conversationId, receiverId, name, avatar, online, productId: initialProductId, lastMessageId } = route.params || {};

    // Debug: Log received params
    console.log('📱 ChatDetail params:', { conversationId, receiverId, name, initialProductId, lastMessageId });

    // Validate required params
    if (!receiverId) {
        console.error('❌ ChatDetail: receiverId is required. Received params:', route.params);
    }

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [productId, setProductId] = useState(initialProductId);
    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const lastMessageTimeRef = useRef(Date.now());

    // Fetch product_id from last message if not provided
    useEffect(() => {
        const fetchProductId = async () => {
            if (productId) return; // Already have product_id
            
            if (lastMessageId) {
                try {
                    console.log('🔍 Fetching product_id from message:', lastMessageId);
                    const message = await ChatApi.getMessage(lastMessageId);
                    if (message?.product_id) {
                        setProductId(message.product_id);
                        console.log('✅ Got product_id from message:', message.product_id);
                    } else if (message?.data?.product_id) {
                        setProductId(message.data.product_id);
                        console.log('✅ Got product_id from message.data:', message.data.product_id);
                    }
                } catch (error) {
                    console.error('❌ Error fetching product_id:', error);
                }
            }
        };
        fetchProductId();
    }, [lastMessageId, productId]);

    // Fetch current user ID on mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const profile = await getProfile();
                if (profile?.id) {
                    setCurrentUserId(String(profile.id));
                    console.log('👤 Current user ID:', profile.id);
                }
            } catch (error) {
                console.error('❌ Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    // --- Message Handling ---

    // 1. Initial/Paginated Fetch
    const fetchChatMessages = useCallback(async (pageToFetch) => {
        if (!receiverId || !productId) {
            console.log('⚠️ Missing receiverId or productId:', { receiverId, productId });
            setLoading(false);
            return;
        }

        if (pageToFetch === 1) {
            setLoading(true);
            setError(null);
        }

        // Fetch messages from API
        try {
            const skip = (pageToFetch - 1) * 50;
            // API: GET /api/messages/conversation/{otherUserId}/{productId}?skip=0&limit=50
            const response = await ChatApi.getConversationWith(receiverId, productId, skip, 50);
            console.log('📥 Fetched messages from API:', response);
            
            // Handle response format: { status: "success", data: [...] } or { messages: [...] } or direct array
            let apiMessages = [];
            if (response?.data && Array.isArray(response.data)) {
                apiMessages = response.data;
            } else if (response?.data?.messages && Array.isArray(response.data.messages)) {
                apiMessages = response.data.messages;
            } else if (Array.isArray(response)) {
                apiMessages = response;
            } else if (response?.messages && Array.isArray(response.messages)) {
                apiMessages = response.messages;
            }
            
            console.log('📝 Parsed messages count:', apiMessages.length);
            
            if (apiMessages.length > 0) {
                // Map API response to expected format
                const mappedMessages = apiMessages.map(msg => ({
                    id: msg.id || msg._id,
                    content: msg.content || msg.message || '',
                    sender_id: msg.sender_id || msg.sender || msg.from,
                    created_at: msg.created_at || msg.timestamp || msg.createdAt,
                    is_temp: false,
                }));
                
                if (pageToFetch === 1) {
                    setMessages(mappedMessages);
                } else {
                    setMessages(prev => [...mappedMessages, ...prev]);
                }
                setHasMore(apiMessages.length === 50);
                
                // Save to AsyncStorage as cache
                const savedKey = `chat_messages_${receiverId}`;
                await AsyncStorage.setItem(savedKey, JSON.stringify(mappedMessages));
            } else {
                if (pageToFetch === 1) {
                    setMessages([]);
                }
                setHasMore(false);
            }
        } catch (error) {
            console.error('❌ Error fetching messages from API:', error);
            // Fallback to AsyncStorage cache
            try {
                const savedKey = `chat_messages_${receiverId}`;
                const savedMessages = await AsyncStorage.getItem(savedKey);
                if (savedMessages && pageToFetch === 1) {
                    setMessages(JSON.parse(savedMessages));
                }
            } catch (storageErr) {
                console.log('Storage error:', storageErr);
            }
            setHasMore(false);
        }
        
        setPageNum(pageToFetch);
        setLoading(false);
    }, [receiverId, productId]);

    // Load first page when productId is available
    useEffect(() => {
        if (productId && receiverId) {
            fetchChatMessages(1);
        }
    }, [productId, receiverId, fetchChatMessages]);

    // Real-time polling for new messages
    const pollNewMessages = useCallback(async () => {
        if (!receiverId) return;
        
        try {
            const since = lastMessageTimeRef.current;
            const newMsgs = await ChatApi.getNewMessages(receiverId, since);
            
            if (newMsgs && newMsgs.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m.id));
                    
                    if (uniqueNewMsgs.length > 0) {
                        // Update last message time
                        const latestTime = Math.max(...uniqueNewMsgs.map(m => new Date(m.created_at).getTime()));
                        lastMessageTimeRef.current = latestTime;
                        
                        // Save to AsyncStorage
                        const savedKey = `chat_messages_${receiverId}`;
                        const updatedMessages = [...prev, ...uniqueNewMsgs];
                        AsyncStorage.setItem(savedKey, JSON.stringify(updatedMessages));
                        
                        return updatedMessages;
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.log('Polling error:', error);
        }
    }, [receiverId]);

    // Start/Stop polling
    useEffect(() => {
        // Start polling every 3 seconds
        pollingIntervalRef.current = setInterval(pollNewMessages, 3000);
        
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [pollNewMessages]);

    // 2. Load More (Pagination)
    const handleLoadMore = () => {
        if (!loading && !sending && hasMore) {
            fetchChatMessages(pageNum + 1);
        }
    };


    // --- Send Message Handler ---
    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || sending) return;
        
        if (!receiverId) {
            console.error('❌ Cannot send message: receiverId is undefined');
            setError('Cannot send message: missing receiver');
            return;
        }
        
        if (!productId) {
            console.error('❌ Cannot send message: productId is undefined');
            setError('Cannot send message: missing product context');
            return;
        }

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);
        setError(null);

        // Create optimistic message
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            content: content,
            sender_id: currentUserId || 'current_user',
            created_at: new Date().toISOString(),
            is_temp: true,
        };
        
        // Add to messages immediately for instant UI feedback
        setMessages(prev => [...prev, optimisticMessage]);
        
        // Use REST API directly
        try {
            const sentMessage = await ChatApi.sendMessage(content, receiverId, productId);
            console.log('📥 Send message response:', sentMessage);
            
            // Map API response to expected format
            const mappedMessage = {
                id: sentMessage.id || sentMessage._id || tempId,
                content: sentMessage.content || sentMessage.message || content,
                sender_id: sentMessage.sender_id || sentMessage.sender || currentUserId,
                created_at: sentMessage.created_at || sentMessage.timestamp || new Date().toISOString(),
                is_temp: false,
            };
            
            // Replace temp message with real one
            setMessages(prev => prev.map(msg => 
                msg.id === tempId ? mappedMessage : msg
            ));
            
            // Save to AsyncStorage
            const savedKey = `chat_messages_${receiverId}`;
            const currentMessages = [...messages, mappedMessage];
            await AsyncStorage.setItem(savedKey, JSON.stringify(currentMessages));
            
            // Update chat list
            const chatListKey = 'chat_users_list';
            const chatListData = await AsyncStorage.getItem(chatListKey);
            let chatUsers = chatListData ? JSON.parse(chatListData) : [];
            
            const chatIndex = chatUsers.findIndex(chat => chat.user_id === receiverId || chat.id === receiverId);
            if (chatIndex !== -1) {
                chatUsers[chatIndex].last_message = {
                    content: content,
                    created_at: new Date().toISOString()
                };
                const updatedChat = chatUsers.splice(chatIndex, 1)[0];
                chatUsers.unshift(updatedChat);
            } else {
                chatUsers.unshift({
                    id: receiverId,
                    user_id: receiverId,
                    name: name,
                    avatar: avatar,
                    online: online,
                    last_message: {
                        content: content,
                        created_at: new Date().toISOString()
                    },
                    unread_count: 0,
                });
            }
            
            await AsyncStorage.setItem(chatListKey, JSON.stringify(chatUsers));
            
        } catch (err) {
            console.error("❌ REST Send Message Error:", err);
            // Remove temp message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setError('Message failed to send. Please check your connection.');
        } finally {
            setSending(false);
        }
    }, [newMessage, sending, messages, receiverId, name, avatar, online, productId, currentUserId]);
    
    // --- UI Rendering Functions ---

    const renderMessage = ({ item }) => {
        // Compare sender_id with current user ID (handle both string and number)
        const isCurrentUser = currentUserId && (
            String(item.sender_id) === String(currentUserId) ||
            item.sender_id === currentUserId
        );
        
        // Handle invalid date gracefully
        let timeString = '';
        if (item.created_at) {
            const messageTime = new Date(item.created_at);
            if (!isNaN(messageTime.getTime())) {
                timeString = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }
        
        return (
            <View style={isCurrentUser ? styles.myContainer : styles.otherContainer}>
                <View style={[
                  styles.messageBubble, 
                  isCurrentUser ? styles.myMessage : styles.otherMessage,
                  item.is_temp && styles.tempMessage
                ]}>
                    <Text style={isCurrentUser ? styles.myText : styles.otherText}>
                      {item.content || ''}
                    </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timestamp}>{timeString}</Text>
                  {item.is_temp && isCurrentUser && (
                    <Icon name="time-outline" size={12} color="#9e9e9e" style={styles.statusIcon} />
                  )}
                  {!item.is_temp && isCurrentUser && (
                    <Icon name="checkmark-done" size={14} color="#2e7d32" style={styles.statusIcon} />
                  )}
                </View>
            </View>
        );
    };
    
    const renderHeader = () => {
        if (loading && pageNum === 1) return null; // Main loader covers this

        if (loading) {
            // Loader for 'Load More'
            return (
                <View style={styles.loadMoreLoader}>
                    <ActivityIndicator size="small" color="#11a86b" />
                </View>
            );
        }

        if (!hasMore && messages.length > 0 && pageNum > 1) {
             return (
                <View style={styles.endOfChatContainer}>
                    <Text style={styles.endOfChatText}>--- Conversation Started ---</Text>
                </View>
            );
        }
        
        return null;
    }

    // --- Main Component Render ---

    if (loading && pageNum === 1) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.loadingText}>Loading Messages...</Text>
            </View>
        );
    }
    
    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
            
            {/* Custom Header */}
            <LinearGradient 
              colors={['#2e7d32', '#43a047']} 
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Image 
                  source={{ uri: avatar }} 
                  style={styles.headerAvatar}
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.headerStatus}>
                    {online ? '● Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.headerRight}>
                <Icon name="ellipsis-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            {/* Error Message Display */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={() => setError(null)} style={styles.dismissButton}>
                         <Icon name="close-circle-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Message List */}
            <FlatList
                ref={listRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item.id ? item.id.toString() : `msg-${index}`}
                contentContainerStyle={styles.listContent}
                inverted={false} // Display newest message at bottom
                // Pagination props
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderHeader}
                initialNumToRender={20}
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton}>
                  <Icon name="add-circle-outline" size={28} color="#2e7d32" />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#9e9e9e"
                    multiline
                    maxLength={500}
                    editable={!sending}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]} 
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Icon name="send" size={22} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e5ddd5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: '#2e7d32',
        fontSize: 15,
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 45,
        paddingBottom: 12,
        paddingHorizontal: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#e0e0e0',
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerInfo: {
        marginLeft: 10,
        flex: 1,
    },
    headerName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    headerStatus: {
        fontSize: 12,
        color: '#e8f5e9',
        marginTop: 2,
    },
    typingIndicator: {
        fontSize: 11,
        color: '#90ee90',
        fontStyle: 'italic',
        marginTop: 2,
    },
    headerRight: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    // Message Styles
    myContainer: {
        alignItems: 'flex-end',
        marginVertical: 3,
    },
    otherContainer: {
        alignItems: 'flex-start',
        marginVertical: 3,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
    },
    myMessage: {
        backgroundColor: '#dcf8c6',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    tempMessage: {
        opacity: 0.6,
    },
    myText: {
        color: '#1a1a1a',
        fontSize: 15,
        lineHeight: 20,
    },
    otherText: {
        color: '#1a1a1a',
        fontSize: 15,
        lineHeight: 20,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        paddingHorizontal: 4,
    },
    timestamp: {
        fontSize: 11,
        color: '#757575',
    },
    statusIcon: {
        marginLeft: 4,
    },
    // Input Area
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    attachButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#1a1a1a',
        marginHorizontal: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        elevation: 2,
        shadowColor: '#2e7d32',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    sendButtonDisabled: {
        backgroundColor: '#a5d6a7',
        elevation: 0,
    },
    // Header/Footer/Error
    loadMoreLoader: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    endOfChatContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    endOfChatText: {
        fontSize: 12,
        color: '#9e9e9e',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    errorBanner: {
        backgroundColor: '#f44336',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    errorBannerText: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    dismissButton: {
        paddingLeft: 12,
    }
});

export default ChatDetailScreen;

