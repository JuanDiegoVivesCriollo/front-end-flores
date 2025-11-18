'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Tipos
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  color: string;
  occasion?: string;
  quantity: number;
  description: string;
  rating: number;
  reviews: number;
  originalPrice?: number;
  discount?: number;
  // Nuevos campos para complementos
  type?: 'flower' | 'complement';
  complementType?: 'globos' | 'peluches' | 'chocolates';
  size?: string;
  brand?: string;
}

export interface ShippingOption {
  type: 'delivery' | 'pickup';
  cost: number;
  storeId?: number;
  storeName?: string;
  storeAddress?: string;
  deliveryAddress?: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  shipping: ShippingOption | null;
}

type CartAction = 
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_SHIPPING'; payload: ShippingOption }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  shipping: null,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: id });
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        shipping: null,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'SET_SHIPPING':
      return {
        ...state,
        shipping: action.payload,
      };

    case 'LOAD_CART':
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: action.payload,
        total,
        itemCount,
      };

    default:
      return state;
  }
}

// Context
const CartContext = createContext<{
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setShipping: (shipping: ShippingOption) => void;
  getShippingCost: () => number;
  getFinalTotal: () => number;
} | null>(null);

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persistir carrito en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('floresydetalles-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('floresydetalles-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setShipping = (shipping: ShippingOption) => {
    dispatch({ type: 'SET_SHIPPING', payload: shipping });
  };

  const getShippingCost = () => {
    if (!state.shipping) return 0;
    if (state.shipping.type === 'pickup') return 0;
    return state.shipping.cost;
  };

  const getFinalTotal = () => {
    return state.total + getShippingCost();
  };

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      setShipping,
      getShippingCost,
      getFinalTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return {
    items: context.state.items,
    total: context.state.total,
    itemCount: context.state.itemCount,
    isOpen: context.state.isOpen,
    shipping: context.state.shipping,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    toggleCart: context.toggleCart,
    setShipping: context.setShipping,
    getShippingCost: context.getShippingCost,
    getFinalTotal: context.getFinalTotal,
  };
}
