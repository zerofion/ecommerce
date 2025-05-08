import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '../types';
import { API_URL } from '../services/auth';
import { useToast } from '@chakra-ui/react';

interface ShoppingSessionState {
  products: Product[];
  selectedCategory: string;
  loading: boolean;
  cartItems: { product: Product; quantity: number }[];
  showCart: boolean;
}

interface ShoppingSessionActions {
  fetchProducts: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setShowCart: (show: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  placeOrder: () => Promise<void>;
}

interface ShoppingSessionContextType {
  state: ShoppingSessionState;
  actions: ShoppingSessionActions;
}

const ShoppingSessionContext = createContext<ShoppingSessionContextType | undefined>(undefined);

export const useShoppingSession = () => {
  const context = useContext(ShoppingSessionContext);
  if (context === undefined) {
    throw new Error('useShoppingSession must be used within a ShoppingSessionProvider');
  }
  return context;
};

export const ShoppingSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [state, setState] = useState<ShoppingSessionState>({
    products: [],
    selectedCategory: 'all',
    loading: true,
    cartItems: [],
    showCart: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setState(prev => ({ ...prev, products: data, loading: false }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  const addToCart = useCallback((product: Product) => {
    setState(prev => {
      const existingItem = prev.cartItems.find(item => item.product.id === product.id);
      const updatedItems = [...prev.cartItems];
      
      if (existingItem) {
        const index = prev.cartItems.findIndex(item => item.product.id === product.id);
        updatedItems[index].quantity = existingItem.quantity + 1;
      } else {
        updatedItems.push({ product, quantity: 1 });
      }
      
      return { ...prev, cartItems: updatedItems };
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} added to cart`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(item => item.product.id !== productId)
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setState(prev => {
      const updatedItems = [...prev.cartItems];
      const index = updatedItems.findIndex(item => item.product.id === productId);
      if (index !== -1) {
        updatedItems[index].quantity = quantity;
      }
      return { ...prev, cartItems: updatedItems };
    });
  }, []);

  const placeOrder = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      setState(prev => ({
        ...prev,
        cartItems: [],
        showCart: false
      }));

      toast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  }, [state.cartItems, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const actions: ShoppingSessionActions = {
    fetchProducts,
    setSelectedCategory: (category) => setState(prev => ({ ...prev, selectedCategory: category })),
    setShowCart: (show) => setState(prev => ({ ...prev, showCart: show })),
    addToCart,
    removeFromCart,
    updateQuantity,
    placeOrder,
  };

  return (
    <ShoppingSessionContext.Provider value={{ state, actions }}>
      {children}
    </ShoppingSessionContext.Provider>
  );
};
