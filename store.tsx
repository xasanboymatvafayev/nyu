
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, PromoCode, AppState } from './types';

/**
 * BU YERGA O'Z TELEGRAM ID-INGIZNI YOZING!
 * @userinfobot orqali bilib olishingiz mumkin.
 */
const ADMIN_TELEGRAM_IDS = [
  '6365371142' // Sizning ID raqamingiz
];

interface BoutiqueContextType {
  state: AppState;
  isAdmin: boolean;
  currentUserId: string | null;
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
  // Telegram WebApp ma'lumotlarini darhol olish
  const tg = (window as any).Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Adminlikni tekshirish
  const checkIsAdmin = () => {
    if (isLocal) return true; // Localhostda test uchun
    if (user && ADMIN_TELEGRAM_IDS.includes(user.id.toString())) return true;
    return false;
  };

  const [isAdmin] = useState<boolean>(checkIsAdmin());
  const [currentUserId] = useState<string | null>(user?.id.toString() || null);
  
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
    if (tg) {
      tg.ready();
      tg.expand();
      console.log("User ID:", user?.id); // IDni konsolda ko'rish uchun
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mavi_boutique_data', JSON.stringify(state));
  }, [state]);

  const setRole = (role: 'user' | 'admin') => {
    // Agar foydalanuvchi admin bo'lmasa, admin rolini o'rnatishga yo'l qo'ymaslik
    if (role === 'admin' && !isAdmin) return;
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
      state, isAdmin, currentUserId, addProduct, deleteProduct, updateProduct, placeOrder, confirmOrder, addPromo, setRole 
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
