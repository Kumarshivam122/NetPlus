import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('np_cart') || '[]');
      return Array.isArray(stored) ? stored.filter(item => item && typeof item === 'object') : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('np_cart', JSON.stringify(Array.isArray(cart) ? cart : []));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = (item) => {
    if (!item || typeof item !== 'object') return;
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev.filter(Boolean) : [];
      const incomingId = String(item.productId || item.id || item._id || '');
      const incomingUnit = String(item.unit || '');
      const incomingQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const incomingFree = Math.max(0, parseInt(item.freeQuantity, 10) || 0);

      // Check if exact same item and unit exists
      const existingIndex = safePrev.findIndex(i => 
        String(i?.productId || i?.id || i?._id || '') === incomingId && 
        String(i?.unit || '') === incomingUnit
      );

      if (existingIndex !== -1) {
        return safePrev.map((cartItem, idx) => {
          if (idx !== existingIndex) return cartItem;
          const updatedQty = (parseInt(cartItem.quantity, 10) || 1) + incomingQty;
          const updatedFree = (parseInt(cartItem.freeQuantity, 10) || 0) + incomingFree;
          return {
            ...cartItem,
            ...item,
            quantity: updatedQty,
            freeQuantity: updatedFree
          };
        });
      }

      return [
        ...safePrev, 
        {
          ...item,
          quantity: incomingQty,
          freeQuantity: incomingFree
        }
      ];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => (Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []));
  };

  const updateQuantity = (index, qty) => {
    const validQty = Math.max(1, parseInt(qty, 10) || 1);
    setCart(prev => {
      if (!Array.isArray(prev)) return [];
      return prev.map((item, i) => i === index ? { ...item, quantity: validQty } : item);
    });
  };

  const clearCart = () => {
    try {
      localStorage.removeItem('np_cart');
    } catch (_) {}
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart: Array.isArray(cart) ? cart : [], addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext) || {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {}
};

