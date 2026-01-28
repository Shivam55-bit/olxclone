import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// ✅ FIXED: Import BASE_URL for consistency
import { BASE_URL } from './api';
// ✅ FIXED: Import getAccessToken from authApi for correct token retrieval
import { getAccessToken } from './authApi';

// Messages endpoint base
const MESSAGES_BASE = '/api/messages/';

// Get auth token from AsyncStorage - using the correct key 'access_token'
const getAuthToken = async () => {
  try {
    const token = await getAccessToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * API Endpoint 1: Send a message (POST /api/messages/)
 * Based on curl:
 * POST https://olx.fixsservices.com/api/messages/
 * Body: { "content": "string", "product_id": "string", "receiver_id": "string" }
 */
export const sendMessage = async (content, receiverId, productId) => {
  try {
    console.log('📤 Sending message:', { content, receiverId, productId });
    
    if (!content) {
      throw new Error('Content is required');
    }
    if (!receiverId) {
      throw new Error('receiverId is required');
    }
    if (!productId) {
      throw new Error('productId is required');
    }
    
    const token = await getAuthToken();
    
    // All fields are required strings
    const body = {
      content: String(content),
      product_id: String(productId),
      receiver_id: String(receiverId),
    };
    
    console.log('📤 Request body:', body);
    
    const response = await axios.post(
      `${BASE_URL}${MESSAGES_BASE}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ REST Send Message Error:', error.message || error);
    console.error('❌ Error Response:', error.response?.data);
    console.error('❌ Error Status:', error.response?.status);
    throw error;
  }
};

/**
 * API Endpoint 2: Get a specific message
 */
export const getMessage = async (messageId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}${MESSAGES_BASE}${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

/**
 * API Endpoint 3: Delete a message
 */
export const deleteMessage = async (messageId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(`${BASE_URL}${MESSAGES_BASE}${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * API Endpoint 4: Get conversation messages
 */
export const fetchMessages = async (userId1, userId2, skip = 0, limit = 50) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    const response = await axios.get(
      `${BASE_URL}${MESSAGES_BASE}conversation/${userId1}/${userId2}?skip=${skipNum}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

/**
 * API Endpoint 5: Get all chat users
 * curl: GET https://olx.fixsservices.com/api/messages/chat-users/
 */
export const getChatUsers = async (skip = 0, limit = 20) => {
  try {
    const token = await getAuthToken();
    console.log('🔑 Token for getChatUsers:', token ? 'Token exists' : 'No token');
    
    const url = `${BASE_URL}${MESSAGES_BASE}chat-users/`;
    console.log('📡 Fetching chat users from:', url);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    console.log('✅ Chat users response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching chat users:', error.message);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};

/**
 * API Endpoint 6: Mark a specific message as read
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.put(
      `${BASE_URL}${MESSAGES_BASE}${messageId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * API Endpoint 7: Mark all messages in conversation as read
 */
export const markConversationAsRead = async (userId1, userId2) => {
  try {
    const token = await getAuthToken();
    const response = await axios.put(
      `${BASE_URL}${MESSAGES_BASE}conversation/${userId1}/${userId2}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * API Endpoint 8: Get unread message count
 */
export const getUnreadCount = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}${MESSAGES_BASE}unread/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * API Endpoint 9: Get messages for a specific product
 */
export const getProductMessages = async (productId, skip = 0, limit = 50) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    const response = await axios.get(
      `${BASE_URL}${MESSAGES_BASE}product/${productId}?skip=${skipNum}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product messages:', error);
    throw error;
  }
};

/**
 * API Endpoint 10: Search messages
 */
export const searchMessages = async (query, skip = 0, limit = 50) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    const response = await axios.get(
      `${BASE_URL}${MESSAGES_BASE}search/?q=${encodeURIComponent(query)}&skip=${skipNum}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

/**
 * API Endpoint 11: Get chat users list
 */
export const getChatUsersList = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}${MESSAGES_BASE}chat-users/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat users list:', error);
    throw error;
  }
};

/**
 * API Endpoint 12: Get conversation with a specific user for a product
 * curl: GET /api/messages/conversation/{otherUserId}/{productId}?skip=0&limit=50
 */
export const getConversationWith = async (otherUserId, productId, skip = 0, limit = 50) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    
    // Use conversation endpoint with other user ID and product ID
    const url = `${BASE_URL}${MESSAGES_BASE}conversation/${otherUserId}/${productId}?skip=${skipNum}&limit=${limitNum}`;
    console.log('📡 Fetching conversation from:', url);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'accept': 'application/json',
      },
    });
    console.log('✅ Conversation response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching conversation:', error.message);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

/**
 * API Endpoint 13: Get new messages since timestamp
 */
export const getNewMessages = async (userId, since) => {
  try {
    const token = await getAuthToken();
    const sinceNum = Number(since);
    const response = await axios.get(
      `${BASE_URL}${MESSAGES_BASE}new-messages/${userId}?since=${sinceNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching new messages:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getMessage,
  deleteMessage,
  fetchMessages,
  getChatUsers,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadCount,
  getProductMessages,
  searchMessages,
  getChatUsersList,
  getConversationWith,
  getNewMessages,
};
