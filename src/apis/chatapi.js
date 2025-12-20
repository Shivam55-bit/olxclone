import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://bhoomi.dinahub.live/api/messages/';

// Get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * API Endpoint 1: Send a message (POST /api/messages/)
 */
export const sendMessage = async (content, receiverId, productId = null) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${BASE_URL}`,
      {
        content,
        receiver_id: receiverId,
        product_id: productId,
      },
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
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * API Endpoint 2: Get a specific message
 */
export const getMessage = async (messageId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}${messageId}`, {
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
    const response = await axios.delete(`${BASE_URL}${messageId}`, {
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
      `${BASE_URL}conversation/${userId1}/${userId2}?skip=${skipNum}&limit=${limitNum}`,
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
 * API Endpoint 5: Get all conversations
 */
export const getChatUsers = async (skip = 0, limit = 20) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    const response = await axios.get(
      `${BASE_URL}conversations/?skip=${skipNum}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
      `${BASE_URL}${messageId}/read`,
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
      `${BASE_URL}conversation/${userId1}/${userId2}/read`,
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
    const response = await axios.get(`${BASE_URL}unread/count`, {
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
      `${BASE_URL}product/${productId}?skip=${skipNum}&limit=${limitNum}`,
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
      `${BASE_URL}search/?q=${encodeURIComponent(query)}&skip=${skipNum}&limit=${limitNum}`,
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
    const response = await axios.get(`${BASE_URL}chat-users/`, {
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
 * API Endpoint 12: Get conversation with a specific user
 */
export const getConversationWith = async (userId, skip = 0, limit = 50) => {
  try {
    const token = await getAuthToken();
    const skipNum = Number(skip);
    const limitNum = Number(limit);
    const response = await axios.get(
      `${BASE_URL}conversation-with/${userId}?skip=${skipNum}&limit=${limitNum}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
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
      `${BASE_URL}new-messages/${userId}?since=${sinceNum}`,
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
