
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, PromoCode, AppState } from './types';

// BU YERGA O'ZINGIZNING TELEGRAM ID RAQAMINGIZNI YOZING
const ADMIN_TELEGRAM_IDS = ['6365371142']; // Masalan: ['5432167', '9876543']

interface BoutiqueContextType {
  state: AppState;
  isAdmin: boolean;
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
    // Telegram WebApp orqali foydalanuvchini tekshirish
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    // URL dagi parametrlarni tekshirish (?role=admin bo'lsa)
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');

    if (user && ADMIN_TELEGRAM_IDS.includes(user.id.toString())) {
      setIsAdmin(true);
      if (roleParam === 'admin') {
        setRole('admin');
      }
    } else if (roleParam === 'admin') {
      // Agar ID mos kelmasa lekin linkda admin bo'lsa, baribir user qilamiz (Xavfsizlik)
      setIsAdmin(false);
      setRole('user');
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

  const setRole = (role: 'user' | 'admin') => {
    // Faqat admin ruxsati bo'lsa rolni o'zgartirishga ruxsat beramiz
    if (role === 'admin' && !isAdmin) return;
    setState(prev => ({ ...prev, currentUser: { role } }));
  };

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
      }).filter(p => p.quantity > 0);

      const newOrders = prev.orders.map(o => o.id === orderId ? { ...o, status: 'confirmed' as const } : o);

      return { ...prev, products: newProducts, orders: newOrders };
    });
  };

  return (
    <BoutiqueContext.Provider value={{ 
      state, isAdmin, addProduct, deleteProduct, updateProduct, placeOrder, confirmOrder, addPromo, setRole 
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
