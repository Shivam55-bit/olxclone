import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../apis/api';
import { getMyAds } from '../apis/adApi';

const { width, height } = Dimensions.get('window');

// --- Premium Color Palette with Dark Mode Support ---
const COLORS = {
  primary: "#369a3bff",
  primaryDark: "#2d7d30",
  primaryLight: "#4ccb52ff",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  cardDark: "#1A1D26",
  textPrimary: "#0A0E27",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textLight: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  accent: "#369a3bff",
  accentGradient: ["#369a3bff", "#4ccb52ff"],
  statusActive: ["#10B981", "#34D399"],
  statusPending: ["#F59E0B", "#FBBF24"],
  statusSold: ["#6B7280", "#9CA3AF"],
  error: "#EF4444",
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: ['#E5E7EB', '#F3F4F6', '#E5E7EB'],
};

// -------------------------------------------------------------------
// --- Animated Status Badge with Pulse Effect ---
// -------------------------------------------------------------------
const StatusBadge = ({ status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'Active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status]);

  let colors, iconName, bgColor;
  const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Active';
  
  switch (normalizedStatus) {
    case "Active":
      colors = COLORS.statusActive;
      iconName = "checkmark-circle";
      bgColor = "#ECFDF5";
      break;
    case "Pending":
      colors = COLORS.statusPending;
      iconName = "time";
      bgColor = "#FFFBEB";
      break;
    case "Sold":
    default:
      colors = COLORS.statusSold;
      iconName = "archive";
      bgColor = "#F3F4F6";
      break;
  }

  return (
    <Animated.View style={[
      styles.statusBadgeContainer,
      { backgroundColor: bgColor, transform: [{ scale: normalizedStatus === 'Active' ? pulseAnim : 1 }] }
    ]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusBadgeGradient}
      >
        <Icon name={iconName} size={11} color={COLORS.textLight} style={{ marginRight: 4 }} />
        <Text style={styles.statusText}>{normalizedStatus}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// -------------------------------------------------------------------
// --- Premium Ad Card with Glassmorphism & Hover Effects ---
// -------------------------------------------------------------------
const AdCard = ({ item, onMenuPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.cardWrapper,
      {
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: scaleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })}
        ]
      }
    ]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={() => console.log(`View Ad: ${item.id}`)}
      >
        {/* Premium Image Container with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300/E5E7EB/9CA3AF?text=No+Image' }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          
          {/* Floating Price Tag */}
          <View style={styles.priceTag}>
            <LinearGradient
              colors={COLORS.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.priceTagGradient}
            >
              <Text style={styles.priceText}>₹{item.price || '0'}</Text>
            </LinearGradient>
          </View>

          {/* Status Badge Overlay */}
          <View style={styles.statusOverlay}>
            <StatusBadge status={item.status} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Untitled Ad'}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => onMenuPress(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Location & Category Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.iconCircle}>
                <Icon name="location" size={12} color={COLORS.accent} />
              </View>
              <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
            </View>
            {item.category && (
              <View style={[styles.metaItem, { marginLeft: 12 }]}>
                <View style={styles.iconCircle}>
                  <Icon name="pricetag" size={12} color={COLORS.accent} />
                </View>
                <Text style={styles.metaText} numberOfLines={1}>{item.category}</Text>
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statPill}>
              <Icon name="eye-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statValue}>{item.views || 0}</Text>
              <Text style={styles.statLabel}>views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Icon name="calendar-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statValue}>{item.date || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// -------------------------------------------------------------------
// --- Modern Grid Action Menu with Card Design ---
// -------------------------------------------------------------------
const AdActionMenu = ({ ad, onClose, onEdit, onDelete, onPromote }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const primaryActions = [
    { 
      label: "Edit", 
      icon: "create-outline", 
      action: onEdit,
      gradient: ["#369a3bff", "#4ccb52ff"],
      description: "Modify details"
    },
    { 
      label: "Promote", 
      icon: "rocket-outline", 
      action: onPromote,
      gradient: ["#8B5CF6", "#A78BFA"],
      description: "Boost visibility"
    },
    { 
      label: "Share", 
      icon: "share-social-outline", 
      action: () => console.log('Share ad'),
      gradient: ["#F59E0B", "#FBBF24"],
      description: "Send to friends"
    },
    { 
      label: "Sold", 
      icon: "checkmark-done-outline", 
      action: () => console.log('Mark as sold'),
      gradient: ["#3B82F6", "#60A5FA"],
      description: "Mark as sold"
    },
  ];

  const secondaryActions = [
    {
      label: "View Statistics",
      icon: "stats-chart-outline",
      action: () => console.log('View stats'),
    },
    {
      label: "Duplicate Ad",
      icon: "copy-outline",
      action: () => console.log('Duplicate ad'),
    },
    {
      label: "Archive",
      icon: "archive-outline",
      action: () => console.log('Archive ad'),
    },
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.menuOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View style={[
          styles.menuContainer,
          { 
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ] 
          }
        ]}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Ad Preview Card */}
          <View style={styles.adPreviewCard}>
            <Image
              source={{ uri: ad.imageUrl || 'https://via.placeholder.com/80x80' }}
              style={styles.adPreviewImage}
            />
            <View style={styles.adPreviewContent}>
              <Text style={styles.adPreviewTitle} numberOfLines={1}>{ad.title}</Text>
              <Text style={styles.adPreviewPrice}>₹{ad.price}</Text>
              <View style={styles.adPreviewMeta}>
                <Icon name="eye-outline" size={14} color={COLORS.textTertiary} />
                <Text style={styles.adPreviewMetaText}>{ad.views} views</Text>
                <View style={styles.adPreviewDot} />
                <Text style={styles.adPreviewMetaText}>{ad.date}</Text>
              </View>
            </View>
          </View>

          {/* Primary Action Grid */}
          <View style={styles.actionGrid}>
            {primaryActions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridActionCard}
                onPress={() => { item.action(ad); handleClose(); }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gridActionGradient}
                >
                  <Icon name={item.icon} size={28} color={COLORS.textLight} />
                </LinearGradient>
                <Text style={styles.gridActionLabel}>{item.label}</Text>
                <Text style={styles.gridActionDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Secondary Actions */}
          <View style={styles.secondaryActionsContainer}>
            <Text style={styles.secondaryActionsTitle}>More Options</Text>
            {secondaryActions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.secondaryActionItem}
                onPress={() => { item.action(ad); handleClose(); }}
                activeOpacity={0.7}
              >
                <View style={styles.secondaryActionIcon}>
                  <Icon name={item.icon} size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.secondaryActionLabel}>{item.label}</Text>
                <Icon name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Delete Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => { onDelete(ad); handleClose(); }}
            activeOpacity={0.8}
          >
            <Icon name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Delete Ad</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// -------------------------------------------------------------------
// --- Filter Tabs with Slide Indicator ---
// -------------------------------------------------------------------
const FilterTabs = ({ tabs, activeTab, onTabChange, ads, disabled }) => {
  const [tabLayouts, setTabLayouts] = useState([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab, index) => {
    onTabChange(tab);
    if (tabLayouts[index]) {
      Animated.spring(slideAnim, {
        toValue: tabLayouts[index].x,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {tabs.map((tab, index) => {
          const count = ads.filter(ad => tab === 'All' ? true : ad.status === tab).length;
          const isActive = activeTab === tab;
          
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => handleTabPress(tab, index)}
              disabled={disabled}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                const newLayouts = [...tabLayouts];
                newLayouts[index] = layout;
                setTabLayouts(newLayouts);
                if (isActive && index === tabs.indexOf(activeTab)) {
                  slideAnim.setValue(layout.x);
                }
              }}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab}
              </Text>
              <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// -------------------------------------------------------------------
// --- Main Component ---
// -------------------------------------------------------------------
export default function MyAds({ navigation }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAd, setSelectedAd] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiData = await getMyAds(1, 20);

      if (apiData.success === false) {
        if (apiData.error && apiData.error.toLowerCase().includes('login')) {
          Alert.alert("Session Expired", "Please log in again to manage your ads.");
        }
        setError(apiData.error || "Failed to fetch ads.");
        setAds([]);
        return;
      }

      const rawAds = apiData.items || [];
      const mappedAds = rawAds.map(ad => ({
        id: ad.id || ad._id,
        title: ad.title || 'Untitled Listing',
        price: ad.price != null ? ad.price.toString() : '0',
        imageUrl: (ad.images && ad.images.length > 0 && ad.images[0])
          ? `${BASE_URL}${ad.images[0].startsWith('/') ? ad.images[0] : '/' + ad.images[0]}`
          : null,
        description: ad.description || '',
        location: ad.location || 'N/A',
        condition: ad.condition || 'Used',
        category: ad.category || '',
        images: ad.images || [],
        status: ad.status ? ad.status.charAt(0).toUpperCase() + ad.status.slice(1).toLowerCase() : 'Active',
        views: ad.views || 0,
        date: ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'N/A',
      }));

      setAds(mappedAds);
    } catch (err) {
      setError("Could not connect to the ad server. Check network or server status.");
      console.error("Fetch Ads Error:", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleOpenMenu = (ad) => setSelectedAd(ad);
  const handleCloseMenu = () => setSelectedAd(null);
  
  const handleEditAd = (ad) => {
    navigation.navigate('EditAd', { 
      adId: ad.id,
      adData: ad
    });
  };
  
  const handleDeleteAd = (ad) => {
    Alert.alert("Delete Ad", `Are you sure you want to delete "${ad.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => console.log(`Deleting ad: ${ad.id}`) }
    ]);
  };
  
  const handlePromoteAd = (ad) => {
    Alert.alert("Promote Ad", `Promotion feature for "${ad.title}" is coming soon!`);
  };

  const TABS = ['All', 'Active', 'Pending', 'Sold'];
  const filteredAds = ads.filter(ad =>
    activeFilter === 'All' ? true : ad.status === activeFilter
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your ads...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconContainer}>
            <Icon name="cloud-offline-outline" size={64} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <LinearGradient
              colors={COLORS.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryButtonGradient}
            >
              <Icon name="refresh" size={20} color={COLORS.textLight} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredAds.length === 0) {
      const totalAdsCount = ads.length;
      const message = totalAdsCount === 0
        ? "You haven't posted any ads yet"
        : `No ${activeFilter.toLowerCase()} ads found`;

      return (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon 
              name={totalAdsCount === 0 ? "megaphone-outline" : "search-outline"} 
              size={64} 
              color={COLORS.textTertiary} 
            />
          </View>
          <Text style={styles.emptyTitle}>{message}</Text>
          <Text style={styles.emptySubtitle}>
            {totalAdsCount === 0 
              ? "Start selling by posting your first ad" 
              : "Try adjusting your filter"}
          </Text>
          {totalAdsCount === 0 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('PostAd')}>
              <LinearGradient
                colors={COLORS.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Icon name="add-circle" size={20} color={COLORS.textLight} />
                <Text style={styles.primaryButtonText}>Post Your First Ad</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setActiveFilter('All')} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Show All Ads</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredAds}
        renderItem={({ item, index }) => (
          <AdCard item={item} onMenuPress={handleOpenMenu} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={COLORS.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View style={[
          styles.headerContent,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })}]
          }
        ]}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Ads</Text>
            <Text style={styles.headerSubtitle}>{ads.length} total listings</Text>
          </View>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Icon name="notifications-outline" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Filter Tabs */}
      <FilterTabs
        tabs={TABS}
        activeTab={activeFilter}
        onTabChange={setActiveFilter}
        ads={ads}
        disabled={loading}
      />

      {/* Content */}
      {renderContent()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostAd')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={COLORS.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name="add" size={28} color={COLORS.textLight} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Menu */}
      {selectedAd && (
        <AdActionMenu
          ad={selectedAd}
          onClose={handleCloseMenu}
          onEdit={handleEditAd}
          onDelete={handleDeleteAd}
          onPromote={handlePromoteAd}
        />
      )}
    </View>
  );
}

// -------------------------------------------------------------------
// --- Styles ---
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.textLight,
  },
  filterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterBadgeTextActive: {
    color: COLORS.textLight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadowDark,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  priceTagGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  statusOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  statusBadgeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    flexShrink: 1,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadowDark,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.shadowDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    right: 20,
    bottom: 20,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: COLORS.shadowDark,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: height * 0.85,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  adPreviewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  adPreviewImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  adPreviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  adPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  adPreviewPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 6,
  },
  adPreviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adPreviewMetaText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  adPreviewDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textTertiary,
    marginHorizontal: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridActionCard: {
    width: (width - 64) / 2,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  gridActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridActionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  gridActionDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  secondaryActionsContainer: {
    marginBottom: 16,
  },
  secondaryActionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  secondaryActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  secondaryActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },
  closeButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});