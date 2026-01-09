
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, PromoCode, AppState } from './types';

interface BoutiqueContextType {
  state: AppState;
  isAuthorized: boolean;
  authorize: (pass: string) => boolean;
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (p: Product) => void;
  placeOrder: (o: Order) => void;
  confirmOrder: (orderId: string) => void;
  addPromo: (p: PromoCode) => void;
  setRole: (role: 'user' | 'admin') => void;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

export const BoutiqueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('mavi_admin_auth') === 'true';
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('mavi_boutique_data');
    if (saved) return JSON.parse(saved);
    return {
      products: [],
      orders: [],
      promos: [],
      currentUser: { role: 'user' }
    };
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mavi_boutique_data', JSON.stringify(state));
  }, [state]);

  const authorize = (pass: string) => {
    if (pass === 'netlify123') {
      setIsAuthorized(true);
      sessionStorage.setItem('mavi_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const setRole = (role: 'user' | 'admin') => {
    setState(prev => ({ ...prev, currentUser: { role } }));
  };

  const addProduct = (p: Product) => setState(prev => ({ ...prev, products: [...prev.products, p] }));
  
  const deleteProduct = (id: string) => setState(prev => ({
    ...prev,
    products: prev.products.filter(p => p.id !== id)
  }));

  const updateProduct = (p: Product) => setState(prev => ({
    ...prev,
    products: prev.products.map(item => item.id === p.id ? p : item)
  }));

  const addPromo = (p: PromoCode) => setState(prev => ({ ...prev, promos: [...prev.promos, p] }));

  const placeOrder = (o: Order) => setState(prev => ({ ...prev, orders: [...prev.orders, o] }));

  const confirmOrder = (orderId: string) => {
    setState(prev => {
      const order = prev.orders.find(o => o.id === orderId);
      if (!order) return prev;

      const newProducts = prev.products.map(p => {
        const orderedItem = order.items.find(oi => oi.id === p.id);
        if (orderedItem) {
          const remaining = p.quantity - orderedItem.orderQuantity;
          return { ...p, quantity: Math.max(0, remaining) };
        }
        return p;
      });

      const newOrders = prev.orders.map(o => o.id === orderId ? { ...o, status: 'confirmed' as const } : o);

      return { ...prev, products: newProducts, orders: newOrders };
    });
  };

  return (
    <BoutiqueContext.Provider value={{ 
      state, isAuthorized, authorize, addProduct, deleteProduct, updateProduct, placeOrder, confirmOrder, addPromo, setRole 
    }}>
      {children}
    </BoutiqueContext.Provider>
  );
};

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (!context) throw new Error("useBoutique must be used within provider");
  return context;
};
