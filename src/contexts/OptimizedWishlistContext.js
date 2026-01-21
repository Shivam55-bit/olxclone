// src/contexts/OptimizedWishlistContext.js
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useReducer } from 'react';

// ✅ Separate state from actions to prevent unnecessary re-renders
const WishlistStateContext = createContext();
const WishlistActionsContext = createContext();

// ✅ Reducer for predictable state updates
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        lastUpdated: Date.now()
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        lastUpdated: Date.now()
      };
    case 'TOGGLE_ITEM':
      const exists = state.items.some(item => item.id === action.payload.id);
      return {
        ...state,
        items: exists 
          ? state.items.filter(item => item.id !== action.payload.id)
          : [...state.items, action.payload],
        lastUpdated: Date.now()
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const OptimizedWishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    loading: false,
    error: null,
    lastUpdated: Date.now()
  });

  // ✅ Memoize actions to prevent re-renders
  const actions = useMemo(() => ({
    addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: (itemId) => dispatch({ type: 'REMOVE_ITEM', payload: itemId }),
    toggleItem: (item) => dispatch({ type: 'TOGGLE_ITEM', payload: item }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error })
  }), []);

  return (
    <WishlistStateContext.Provider value={state}>
      <WishlistActionsContext.Provider value={actions}>
        {children}
      </WishlistActionsContext.Provider>
    </WishlistStateContext.Provider>
  );
};

// ✅ Optimized hooks with selectors
export const useWishlistState = () => {
  const context = useContext(WishlistStateContext);
  if (!context) {
    throw new Error('useWishlistState must be used within OptimizedWishlistProvider');
  }
  return context;
};

export const useWishlistActions = () => {
  const context = useContext(WishlistActionsContext);
  if (!context) {
    throw new Error('useWishlistActions must be used within OptimizedWishlistProvider');
  }
  return context;
};

// ✅ Optimized selectors to prevent unnecessary re-renders
export const useWishlistItem = (itemId) => {
  const { items } = useWishlistState();
  return useMemo(() => 
    items.find(item => item.id === itemId), 
    [items, itemId]
  );
};

export const useIsInWishlist = (itemId) => {
  const { items } = useWishlistState();
  return useMemo(() => 
    items.some(item => item.id === itemId), 
    [items, itemId]
  );
};

export const useWishlistCount = () => {
  const { items } = useWishlistState();
  return useMemo(() => items.length, [items]);
};