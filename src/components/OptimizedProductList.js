// src/components/OptimizedProductList.js
import React, { useMemo, useCallback } from 'react';
import { FlatList, View, Dimensions } from 'react-native';
import ProductCard from './ProductCard';

const { width } = Dimensions.get('window');

// ✅ Calculate item size for getItemLayout optimization
const ITEM_HEIGHT = 280;
const ITEM_MARGIN = 8;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

const OptimizedProductList = React.memo(({ 
  products, 
  onProductPress, 
  onWishlistToggle,
  refreshing,
  onRefresh,
  onEndReached,
  numColumns = 2 
}) => {
  // ✅ Memoize keyExtractor for better performance
  const keyExtractor = useCallback((item, index) => 
    `${item.id || item._id || index}`, []);

  // ✅ Memoize getItemLayout for smoother scrolling
  const getItemLayout = useCallback((data, index) => ({
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * Math.floor(index / numColumns),
    index,
  }), [numColumns]);

  // ✅ Memoize renderItem to prevent unnecessary re-renders
  const renderItem = useCallback(({ item, index }) => (
    <ProductCard
      product={item}
      onPress={() => onProductPress(item)}
      onWishlistToggle={() => onWishlistToggle(item)}
      style={{
        width: (width - 32 - (numColumns - 1) * 8) / numColumns,
        marginRight: (index % numColumns === numColumns - 1) ? 0 : 8,
        marginBottom: ITEM_MARGIN,
      }}
    />
  ), [onProductPress, onWishlistToggle, numColumns, width]);

  // ✅ Memoize FlatList props to prevent re-renders
  const flatListProps = useMemo(() => ({
    data: products,
    renderItem,
    keyExtractor,
    getItemLayout,
    numColumns,
    
    // ✅ Performance optimizations
    initialNumToRender: 6,           // Render only first 6 items initially
    maxToRenderPerBatch: 4,          // Render 4 items per batch
    windowSize: 5,                   // Keep 5 screens of items in memory
    updateCellsBatchingPeriod: 50,   // Batch updates every 50ms
    removeClippedSubviews: true,     // Remove off-screen views
    
    // ✅ Refresh control
    refreshing,
    onRefresh,
    
    // ✅ Pagination
    onEndReached,
    onEndReachedThreshold: 0.3,      // Trigger at 70% scroll
    
    // ✅ Styling
    showsVerticalScrollIndicator: false,
    contentContainerStyle: {
      padding: 16,
      paddingBottom: 100 // Extra space for tab bar
    },
    
    // ✅ Performance boosts
    legacyImplementation: false,
    disableVirtualization: false,
  }), [
    products, renderItem, keyExtractor, getItemLayout, 
    numColumns, refreshing, onRefresh, onEndReached
  ]);

  return <FlatList {...flatListProps} />;
});

export default OptimizedProductList;