// src/hooks/useWishlistApi.js 
import React, { useCallback } from 'react';
// 🔑 Import the centralized wishlist logic
import { useWishlist } from '../WishlistContext'; 

// 🔑 Helper function 
const getItemId = (item) => item.id || item._id || item.product_id;

// ---------------------------------------------------------------
// ## useWishlistApi (Fixed Wrapper)
// ---------------------------------------------------------------

const useWishlistApi = (item) => {
  // Get the core logic from the global state manager
  const { 
        isInWishlist: contextIsInWishlist, 
        toggleWishlist: contextToggleWishlist, 
        isLoading: contextIsLoading,
    } = useWishlist();

  const itemId = getItemId(item);

  // 1. Derived Status: Gets the true status from the global list
  const isWishlisted = contextIsInWishlist(item);

  // 2. Toggle Function: Calls the centralized API function
  const toggleWishlist = useCallback(async () => {
    if (itemId) {
      await contextToggleWishlist(item);
    }
  }, [item, itemId, contextToggleWishlist]);

  return {
    toggleWishlist,
    isInWishlist: isWishlisted, 
    isStatusLoading: contextIsLoading, 
  };
};

export default useWishlistApi;