import { useState, useEffect } from "react";

export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tiligo_cart") || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("tiligo_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists && exists.qty > 1) return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, clearCart };
}