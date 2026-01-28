import React, { useState, useEffect, useCallback, useMemo, memo, useReducer } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useDerivedValue } from 'react-native-reanimated';

// 🔑 Import the API functions
import { fetchFollowers, fetchFollowing } from '../apis/followApi';
import { BASE_URL } from '../apis/api'; 

// 🚨 CONCEPTUAL: Haptic Feedback Utility (Requires a separate library for real implementation)
const HapticFeedback = {
  impact: (style = 'light') => {
    if (Platform.OS === 'ios') {
      // Logic for triggering Haptic Feedback goes here
    }
  },
};

// 🎨 Centralized Theme & Constants
const theme = {
  colors: {
    primary: '#2e7d32', 
    secondary: '#4caf50',
    white: '#ffffff',
    background: '#f8fafc',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
    accent: '#fcd34d', // Yellow for mutuals
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
};

const TABS = {
  FOLLOWING: 'following',
  FOLLOWERS: 'followers',
};

// --- useReducer for Clean State Management ---

const initialState = {
  followers: [],
  following: [],
  isLoading: true,
  error: null,
};

const connectionReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, followers: action.payload.followers, following: action.payload.following };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------
// 🔹 Helper function to safely extract the user array (The Core Fix)
// ----------------------------------------------------------------------
const extractUserArray = (apiResponseData, key) => {
    // 💡 FIX: Access the array using the specific structure: apiResponseData.data.[key]
    // apiResponseData here is what was previously res.data from Axios (the full API body)
    const nestedData = apiResponseData?.data;
    if (nestedData && Array.isArray(nestedData[key])) {
        return nestedData[key];
    }
    return []; // Default to empty array if not found
};


// 🎣 Custom Hook for Data Logic (Updated to use the specific API keys)
const useConnections = () => {
  const [state, dispatch] = useReducer(connectionReducer, initialState);

  useEffect(() => {
    const fetchAllConnections = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        // NOTE: fetchFollowers and fetchFollowing must return the full response body
        // (which includes {success, message, data: {followers: [...]}})
        const [followersRes, followingRes] = await Promise.all([
          fetchFollowers(),
          fetchFollowing(),
        ]);
        
        if (followersRes.success && followingRes.success) {
            
            // ✅ FIX: Extracting array using the new key ('followers'/'following')
            const followersArray = extractUserArray(followersRes.data, 'followers');
            const followingArray = extractUserArray(followingRes.data, 'following');

            // Data Mapping function
            const mapUserData = (apiData) => apiData.map(user => ({
                id: user.id.toString(), 
                name: user.name || user.username || 'User',
                // ✅ FIX: Use BASE_URL for avatar images
                avatar: user.avatar 
                    ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`)
                    : (user.profile_image 
                        ? (user.profile_image.startsWith('http') ? user.profile_image : `${BASE_URL}${user.profile_image}`)
                        : `https://i.pravatar.cc/150?u=${user.id}`),
                mutuals: Math.floor(Math.random() * 5), 
            }));

            dispatch({ 
                type: 'FETCH_SUCCESS', 
                payload: { 
                    followers: mapUserData(followersArray), 
                    following: mapUserData(followingArray) 
                } 
            });
        } else {
            // Handle API errors
            const errorMsg = followersRes.error || followingRes.error || 'An unknown API error occurred.';
            dispatch({ type: 'FETCH_ERROR', payload: errorMsg });
        }
      } catch (error) {
        console.error("API Fetch Error:", error);
        dispatch({ type: 'FETCH_ERROR', payload: 'Failed to connect to the server.' });
      }
    };

    fetchAllConnections();
  }, []);

  return state;
};


// 👤 Simplified User Card Component with Navigation to SellerProfile
const UserCard = memo(({ user, navigation }) => (
  <TouchableOpacity 
    style={styles.userCard} 
    activeOpacity={0.7} 
    onPress={() => {
      HapticFeedback.impact('light');
      navigation.navigate('SellerProfile', { userId: user.id });
    }}
  >
    <Image 
        source={{ uri: user.avatar }} 
        style={styles.userAvatar} 
        defaultSource={require('../images/user_placeholder.png')} 
    />
    <View style={styles.userInfo}>
      <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
      {user.mutuals > 0 && (
        <View style={styles.mutualsBadge}>
          <Feather name="link" size={10} color={theme.colors.accent} />
          <Text style={styles.mutualsText}>{user.mutuals} Mutuals</Text>
        </View>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} /> 
  </TouchableOpacity>
), (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
});


// 🖼️ Header Component with Reanimated Tabs
const ScreenHeader = memo(({ activeTab, onTabChange, searchQuery, setSearchQuery, navigation }) => {
  const [tabLayout, setTabLayout] = useState(null);
  
  const activeTabIndex = useSharedValue(activeTab === TABS.FOLLOWING ? 0 : 1);

  useEffect(() => {
      activeTabIndex.value = activeTab === TABS.FOLLOWING ? 0 : 1;
  }, [activeTab]);
  
  const translateX = useDerivedValue(() => {
    if (!tabLayout) return 0;
    const tabWidth = tabLayout.width / 2;
    return withSpring(activeTabIndex.value * tabWidth, { damping: 15, stiffness: 120 });
  }, [tabLayout]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (tab) => {
    HapticFeedback.impact('light');
    onTabChange(tab);
  };

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.headerContainer}>
      {/* Header Top */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => {}} activeOpacity={0.7}>
          <Feather name="settings" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Reanimated Tabs */}
      <View style={styles.tabContainer} onLayout={e => setTabLayout(e.nativeEvent.layout)}>
        {tabLayout && (
            <Animated.View style={[styles.tabIndicator, { width: tabLayout.width / 2 }, animatedIndicatorStyle]} />
        )}
        <TouchableOpacity style={styles.tabButton} onPress={() => handlePress(TABS.FOLLOWING)}>
          <Text style={[styles.tabText, activeTab === TABS.FOLLOWING && styles.tabActiveText]}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handlePress(TABS.FOLLOWERS)}>
          <Text style={[styles.tabText, activeTab === TABS.FOLLOWERS && styles.tabActiveText]}>Followers</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
});


// 🖥️ Main Screen Component
const ConnectionsScreen = ({ route }) => {
  const { followers, following, isLoading, error } = useConnections();
  
  // Get initialTab from route params and convert to correct format
  const getInitialTab = () => {
    const initialTab = route?.params?.initialTab;
    if (initialTab === 'Followers') return TABS.FOLLOWERS;
    return TABS.FOLLOWING; // Default to Following
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation(); 
  
  const filteredData = useMemo(() => {
    const data = activeTab === TABS.FOLLOWERS ? followers : following;
    
    if (!searchQuery) return data; 
    
    return data.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeTab, followers, following]);

  const renderUserItem = useCallback(
    ({ item }) => <UserCard user={item} navigation={navigation} />,
    [navigation] 
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={30} color="red" />
        <Text style={styles.errorText}>
            {typeof error === 'string' ? error : 'Failed to load data.'}
        </Text>
        <Text style={styles.errorSubText}>Please check your network connection and try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        navigation={navigation} 
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching users found.' : `You have no ${activeTab} yet.`}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default ConnectionsScreen;

// 🎨 Stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center', paddingVertical: 50 },
  listContainer: { padding: 16 },

  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...theme.shadow,
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 16 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 28, color: theme.colors.white, fontWeight: '800' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
    ...theme.shadow,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    color: theme.colors.text,
    fontSize: 16,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 48,
    marginHorizontal: 10,
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  tabActiveText: { color: '#000000', fontWeight: '700' ,fontSize: 18}, 
  tabIndicator: {
    position: 'absolute',
    height: '90%',
    top: '5%',
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    margin: 2,
    ...theme.shadow,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    ...theme.shadow,
  },
  userAvatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: theme.colors.border },
  userInfo: { flex: 1, marginHorizontal: 16 },
  userName: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  
  mutualsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  mutualsText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    padding: 30,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    margin: 16,
    ...theme.shadow,
  },
  emptyText: {
    marginTop: 15,
    color: theme.colors.textLight,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  errorText: { 
    color: 'red', 
    fontSize: 18, 
    fontWeight: '700',
    marginTop: 10,
  },
  errorSubText: {
    color: theme.colors.textLight,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});