// src/components/OptimizedImage.js
import React, { useState, useMemo } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image'; // Add this dependency

const OptimizedImage = React.memo(({ 
  source, 
  style, 
  resizeMode = 'cover',
  placeholder,
  fallbackSource,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ✅ Memoize image source to prevent unnecessary re-renders
  const imageSource = useMemo(() => {
    if (typeof source === 'string') {
      return { 
        uri: source,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable
      };
    }
    return source;
  }, [source]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // ✅ Show fallback image on error
  if (hasError && fallbackSource) {
    return (
      <Image
        source={fallbackSource}
        style={style}
        resizeMode={resizeMode}
        {...props}
      />
    );
  }

  return (
    <View style={style}>
      <FastImage
        source={imageSource}
        style={StyleSheet.absoluteFillObject}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          {placeholder || (
            <ActivityIndicator 
              size="small" 
              color="#16A34A" 
            />
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

export default OptimizedImage;