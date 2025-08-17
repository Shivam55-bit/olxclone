// WishlistContext.js
import React, { createContext, useState, useContext } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Add/remove item
  const toggleWishlist = (item) => {
    const exists = wishlist.find((w) => w.id === item.id);
    if (exists) {
      // remove
      setWishlist(wishlist.filter((w) => w.id !== item.id));
    } else {
      // add
      setWishlist([...wishlist, item]);
    }
  };

  // Explicit remove (optional, used by trash button)
  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
