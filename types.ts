
export type SectionType = 'sotish' | 'prokat';

export interface Product {
  id: string; // The specific ID (e.g., 001)
  name: string;
  description: string;
  images: string[];
  quantity: number;
  section: SectionType;
  size: string; // e.g., "M-S"
  price: number; // For sale: total price, For rent: price per hour
}

export interface CartItem extends Product {
  orderQuantity: number;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
}

export interface Order {
  id: string;
  userName: string;
  phone: string;
  location: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  orderType: 'dostavka' | 'band_qilish';
  userTelegram: string;
}

export interface AppState {
  products: Product[];
  orders: Order[];
  promos: PromoCode[];
  currentUser: {
    role: 'user' | 'admin';
  };
}
