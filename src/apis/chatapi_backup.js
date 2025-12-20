// FILE 1: src/apis/chatapi.js
// ============================================================

import api from './api';

/**
 * Get all chat users (conversations list)
 * Endpoint: GET /api/messages/chat-users/
 */
export const getChatUsers = async () => {
    try {
        const response = await api.get('/api/messages/chat-users/');
        const users = response.data?.data || response.data || [];
        return users;
    } catch (error) {
        console.error('Get Chat Users Error:', error);
        throw error;
    }
};

/**
 * Get messages for a conversation with a specific user
 * Endpoint: GET /api/messages/conversation-with/{user_id}
 */
export const fetchMessages = async (userId, skip = 0, limit = 50) => {
    try {
        const response = await api.get(`/api/messages/conversation-with/${userId}`, {
            params: { skip, limit }
        });

        const data = response.data?.data || response.data;
        
        return {
            messages: data.messages || [],
            skip: data.skip || 0,
            limit: data.limit || 50,
            total: data.total || 0,
        };
    } catch (error) {
        console.error('Fetch Messages Error:', error);
        throw error;
    }
};

/**
 * Send a message to a user
 * Endpoint: POST /api/messages/send
 */
export const sendMessage = async (receiverId, content, productId = null) => {
    try {
        const payload = {
            receiver_id: receiverId,
            content: content,
        };
        
        if (productId) {
            payload.product_id = productId;
        }

        const response = await api.post('/api/messages/send', payload);
        return response.data?.data || response.data;
    } catch (error) {
        console.error('Send Message Error:', error);
        throw error;
    }
};

/**
 * Mark messages as read
 * Endpoint: PUT /api/messages/mark-read/{user_id}
 */
export const markAsRead = async (userId) => {
    try {
        await api.put(`/api/messages/mark-read/${userId}`);
    } catch (error) {
        console.error('Mark As Read Error:', error);
        throw error;
    }
};

/**
 * Get unread message count
 * Endpoint: GET /api/messages/unread-count
 */
export const getUnreadCount = async () => {
    try {
        const response = await api.get('/api/messages/unread-count');
        return response.data?.count || response.data?.data?.count || 0;
    } catch (error) {
        console.error('Get Unread Count Error:', error);
        throw error;
    }
};

/**
 * Search chat users by name (client-side filtering)
 */
export const searchChats = (query, users) => {
    if (!query || !users) return users;
    
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
        user.name?.toLowerCase().includes(lowerQuery) ||
        user.last_message?.content?.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Delete a conversation with a user
 * Endpoint: DELETE /api/messages/conversation-with/{user_id}
 */
export const deleteConversation = async (userId) => {
    try {
        await api.delete(`/api/messages/conversation-with/${userId}`);
    } catch (error) {
        console.error('Delete Conversation Error:', error);
        throw error;
    }
};

/**
 * Format ISO timestamp to readable time
 */
export const formatMessageTime = (isoTime) => {
    try {
        if (!isoTime) return '';
        
        const date = new Date(isoTime);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
        console.error('Error formatting time:', e);
        return '';
    }
};

/**
 * Format message data from API response
 */
export const formatMessage = (msg, currentUserId) => {
    return {
        id: msg.id || msg._id,
        text: msg.content || '',
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        sender: msg.sender_id === currentUserId ? 'me' : 'other',
        created_at: msg.created_at,
        time: formatMessageTime(msg.created_at),
        is_read: msg.is_read || false,
        product_id: msg.product_id || null,
    };
};

/**
 * API Endpoint 10: Search messages (GET /api/messages/search/)
 * @param {string} query - Search query string
 * @param {number} skip - Pagination skip
 * @param {number} limit - Pagination limit
 */
export const searchMessages = async (query, skip = 0, limit = 50) => {
  try {
    const response = await api.get(
      `/api/messages/search/?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`,
      {
        headers: {
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
 * API Endpoint 11: Get chat users list (GET /api/messages/chat-users/)
 * Alternative endpoint to get users you've chatted with
 */
export const getChatUsersList = async () => {
  try {
    const response = await api.get('/api/messages/chat-users/', {
      headers: {
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
 * API Endpoint 12: Get conversation with a specific user (GET /api/messages/conversation-with/{user_id})
 * @param {string} userId - User ID to get conversation with
 * @param {number} skip - Pagination skip
 * @param {number} limit - Pagination limit
 */
export const getConversationWith = async (userId, skip = 0, limit = 50) => {
  try {
    const response = await api.get(
      `/api/messages/conversation-with/${userId}?skip=${skip}&limit=${limit}`,
      {
        headers: {
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
 * API Endpoint 13: Get new messages since timestamp (GET /api/messages/new-messages/{user_id})
 * @param {string} userId - User ID to check new messages from
 * @param {number} since - Unix timestamp to get messages after
 */
export const getNewMessages = async (userId, since) => {
  try {
    const response = await api.get(
      `/api/messages/new-messages/${userId}?since=${since}`,
      {
        headers: {
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
    getChatUsers,
    fetchMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
    searchChats,
    deleteConversation,
    formatMessageTime,
    formatMessage,
    searchMessages,
    getChatUsersList,
    getConversationWith,
    getNewMessages,
};