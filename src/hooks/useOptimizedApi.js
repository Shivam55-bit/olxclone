// src/hooks/useOptimizedApi.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';

export const useOptimizedApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const mountedRef = useRef(true);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  const {
    enableCache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  // ✅ Generate cache key from dependencies
  const cacheKey = JSON.stringify(dependencies);

  // ✅ Check cache first
  const getCachedData = useCallback(() => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  }, [cacheKey, enableCache, cacheTime]);

  // ✅ Optimized fetch function with retry logic
  const fetchData = useCallback(async (isRefresh = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first (skip cache on refresh)
    if (!isRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    let attempts = 0;
    while (attempts < retryAttempts) {
      try {
        const result = await apiFunction({
          signal: abortControllerRef.current.signal,
          ...dependencies.reduce((acc, dep, index) => {
            acc[`param${index}`] = dep;
            return acc;
          }, {})
        });

        if (!mountedRef.current) return;

        // Cache successful result
        if (enableCache) {
          cacheRef.current.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        setData(result);
        setError(null);
        onSuccess?.(result);
        break;

      } catch (err) {
        if (!mountedRef.current) return;
        
        // Don't retry if request was aborted
        if (err.name === 'AbortError') {
          return;
        }

        attempts++;
        if (attempts >= retryAttempts) {
          setError(err);
          onError?.(err);
          Alert.alert('Error', err.message || 'Something went wrong');
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }

    if (mountedRef.current) {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFunction, dependencies, cacheKey, getCachedData, retryAttempts, retryDelay, onSuccess, onError]);

  // ✅ Refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // ✅ Manual refetch
  const refetch = useCallback(() => {
    // Clear cache for this key
    cacheRef.current.delete(cacheKey);
    fetchData(false);
  }, [fetchData, cacheKey]);

  // ✅ Effect to fetch data on mount or dependency change
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
    refetch
  };
};