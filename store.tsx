
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, PromoCode, AppState } from './types';

/**
 * 1. O'ZINGIZNING ID RAQAMINGIZNI SHU YERGA YOZING!
 * ID raqamingizni bilmasangiz, dasturni oching va konsolda 
 * yoki ekrandagi ogohlantirishda chiqqan raqamni nusxalang.
 */
const ADMIN_TELEGRAM_IDS = [
  '6365371142' // O'z ID-ingizni bu yerga qo'shing
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
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

  // Role o'zgartirish funksiyasi
  const setRole = (role: 'user' | 'admin') => {
    setState(prev => ({ ...prev, currentUser: { role } }));
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    const urlParams = new URLSearchParams(window.location.search);
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let hasAccess = false;

    if (user) {
      const uid = user.id.toString();
      setCurrentUserId(uid);
      console.log("Sizning Telegram ID-ingiz:", uid);

      if (ADMIN_TELEGRAM_IDS.includes(uid)) {
        hasAccess = true;
      }
    } else if (isLocal) {
      // Localhostda doim adminlikka ruxsat berish
      hasAccess = true;
    }

    setIsAdmin(hasAccess);

    // Agar URLda role=admin bo'lsa va ruxsat bo'lsa, avtomat admin panelga o'tkazish
    if (urlParams.get('role') === 'admin' && hasAccess) {
      setRole('admin');
    }

    // Telegram WebApp interfeysini sozlash
    if (tg) {
      tg.ready();
      tg.expand();
      // Foydalanuvchi ID-sini bilmasa, alert orqali ko'rsatish (faqat bir marta)
      if (user && !ADMIN_TELEGRAM_IDS.includes(user.id.toString()) && !localStorage.getItem('id_alert_shown')) {
        console.warn(`Sizning ID: ${user.id}. Admin panel uchun uni store.tsx ga qo'shing.`);
        localStorage.setItem('id_alert_shown', 'true');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mavi_boutique_data', JSON.stringify(state));
  }, [state]);

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
