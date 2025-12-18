import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import data from "./data/products.json";

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  /* ================= CART ================= */
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );
  const [wishlistItems, setWishlistItems] = useState(
    JSON.parse(localStorage.getItem("wishlistItems")) || []
  );

  /* ================= TOAST ================= */
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const toastRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ show: true, message, type });
    toastRef.current = setTimeout(
      () => setToast({ show: false, message: "", type: "" }),
      3000
    );
  };

  /* ================= SEARCH ================= */

  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  /* ===== Debounce Search ===== */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchKey.trim()) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = data.filter(p =>
        p.name.toLowerCase().includes(searchKey.toLowerCase())
      );

      setSearchResults(filtered);
      setShowSuggestions(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKey]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        // remove
        return prev.filter(item => item.id !== product.id);
      }
      // add
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  }, [cartItems, wishlistItems]);

  /* =====================
     ADD TO CART
  ====================== */
  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /* =====================
     UPDATE QUANTITY
  ====================== */
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  /* =====================
     REMOVE FROM CART
  ====================== */
  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const removeFromWishlist = (id) => {
  setWishlistItems(prev =>
    prev.filter(item => item.id !== id)
  );
};



  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        toast,
        cartItems,
        updateQuantity,
        removeFromCart,
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,

        /* search */
        searchKey,
        setSearchKey,
        searchResults,
        showSuggestions,
        setShowSuggestions,
        isMobileSearchOpen,
        setIsMobileSearchOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
