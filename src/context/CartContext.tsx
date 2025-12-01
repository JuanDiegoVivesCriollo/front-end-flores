'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface CartFlower {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  discount_percentage?: number;
  final_price?: number;
}

export interface CartComplement {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface CartBreakfast {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export interface CartItem {
  type: 'flower' | 'complement' | 'breakfast';
  item: CartFlower | CartComplement | CartBreakfast;
}

interface CartContextType {
  items: CartItem[];
  flowers: CartFlower[];
  complements: CartComplement[];
  breakfasts: CartBreakfast[];
  addFlower: (flower: CartFlower) => void;
  removeFlower: (id: number) => void;
  updateFlowerQuantity: (id: number, quantity: number) => void;
  addComplement: (complement: CartComplement) => void;
  removeComplement: (id: number) => void;
  updateComplementQuantity: (id: number, quantity: number) => void;
  addBreakfast: (breakfast: CartBreakfast) => void;
  removeBreakfast: (id: number) => void;
  updateBreakfastQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'floresdjazmin_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [flowers, setFlowers] = useState<CartFlower[]>([]);
  const [complements, setComplements] = useState<CartComplement[]>([]);
  const [breakfasts, setBreakfasts] = useState<CartBreakfast[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setFlowers(parsed.flowers || []);
        setComplements(parsed.complements || []);
        setBreakfasts(parsed.breakfasts || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
        flowers,
        complements,
        breakfasts,
      }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [flowers, complements, breakfasts, isHydrated]);

  // Flower operations
  const addFlower = useCallback((flower: CartFlower) => {
    setFlowers(prev => {
      const existing = prev.find(f => f.id === flower.id);
      if (existing) {
        return prev.map(f => 
          f.id === flower.id 
            ? { ...f, quantity: f.quantity + flower.quantity }
            : f
        );
      }
      return [...prev, flower];
    });
    // No abrimos el carrito automáticamente para que se vea la notificación
  }, []);

  const removeFlower = useCallback((id: number) => {
    setFlowers(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFlowerQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFlower(id);
      return;
    }
    setFlowers(prev => prev.map(f => 
      f.id === id ? { ...f, quantity } : f
    ));
  }, [removeFlower]);

  // Complement operations
  const addComplement = useCallback((complement: CartComplement) => {
    setComplements(prev => {
      const existing = prev.find(c => c.id === complement.id);
      if (existing) {
        return prev.map(c => 
          c.id === complement.id 
            ? { ...c, quantity: c.quantity + complement.quantity }
            : c
        );
      }
      return [...prev, complement];
    });
    // No abrimos el carrito automáticamente para que se vea la notificación
  }, []);

  const removeComplement = useCallback((id: number) => {
    setComplements(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateComplementQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeComplement(id);
      return;
    }
    setComplements(prev => prev.map(c => 
      c.id === id ? { ...c, quantity } : c
    ));
  }, [removeComplement]);

  // Breakfast operations
  const addBreakfast = useCallback((breakfast: CartBreakfast) => {
    setBreakfasts(prev => {
      const existing = prev.find(b => b.id === breakfast.id);
      if (existing) {
        return prev.map(b => 
          b.id === breakfast.id 
            ? { ...b, quantity: b.quantity + breakfast.quantity }
            : b
        );
      }
      return [...prev, breakfast];
    });
    // No abrimos el carrito automáticamente para que se vea la notificación
  }, []);

  const removeBreakfast = useCallback((id: number) => {
    setBreakfasts(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateBreakfastQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeBreakfast(id);
      return;
    }
    setBreakfasts(prev => prev.map(b => 
      b.id === id ? { ...b, quantity } : b
    ));
  }, [removeBreakfast]);

  // Clear cart
  const clearCart = useCallback(() => {
    setFlowers([]);
    setComplements([]);
    setBreakfasts([]);
  }, []);

  // Get all items
  const items: CartItem[] = [
    ...flowers.map(f => ({ type: 'flower' as const, item: f })),
    ...complements.map(c => ({ type: 'complement' as const, item: c })),
    ...breakfasts.map(b => ({ type: 'breakfast' as const, item: b })),
  ];

  // Get total item count
  const getItemCount = useCallback(() => {
    return (
      flowers.reduce((sum, f) => sum + f.quantity, 0) +
      complements.reduce((sum, c) => sum + c.quantity, 0) +
      breakfasts.reduce((sum, b) => sum + b.quantity, 0)
    );
  }, [flowers, complements, breakfasts]);

  // Get subtotal
  const getSubtotal = useCallback(() => {
    const flowerTotal = flowers.reduce((sum, f) => {
      // Use final_price if available, otherwise calculate from price and discount
      const price = f.final_price !== undefined ? Number(f.final_price) : Number(f.price);
      return sum + (price * f.quantity);
    }, 0);
    const complementTotal = complements.reduce((sum, c) => sum + (Number(c.price) * c.quantity), 0);
    const breakfastTotal = breakfasts.reduce((sum, b) => sum + (Number(b.price) * b.quantity), 0);
    return Number((flowerTotal + complementTotal + breakfastTotal).toFixed(2));
  }, [flowers, complements, breakfasts]);

  // Get total (with any discounts applied)
  const getTotal = useCallback(() => {
    return getSubtotal();
  }, [getSubtotal]);

  // Cart open/close
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const value: CartContextType = {
    items,
    flowers,
    complements,
    breakfasts,
    addFlower,
    removeFlower,
    updateFlowerQuantity,
    addComplement,
    removeComplement,
    updateComplementQuantity,
    addBreakfast,
    removeBreakfast,
    updateBreakfastQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
