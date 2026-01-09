
import React, { useState } from 'react';
import { useBoutique } from '../store';
import { ShoppingCart, Search, ShoppingBag, X, MapPin, Send } from 'lucide-react';
import { Product, CartItem, Order, SectionType } from '../types';
import ProductSlider from './ProductSlider';

const UserView: React.FC = () => {
  const { state, placeOrder } = useBoutique();
  const [activeSection, setActiveSection] = useState<SectionType>('sotish');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [orderType, setOrderType] = useState<'dostavka' | 'band_qilish'>('dostavka');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<number>(0);

  // FAQAT MIQDORI 0 DAN KATTA BO'LGANLARNI KO'RSATISH
  const filteredProducts = state.products.filter(p => 
    p.quantity > 0 &&
    p.section === activeSection && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery))
  );

  const addToCart = (product: Product, qty: number) => {
    if (qty > product.quantity) return alert(`Kechirasiz, faqat ${product.quantity} dona qolgan.`);
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, orderQuantity: qty } : item);
      }
      return [...prev, { ...product, orderQuantity: qty }];
    });
    setSelectedProduct(null);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.orderQuantity), 0);
  const total = subTotal * (1 - appliedPromo / 100);

  const handleApplyPromo = () => {
    const promo = state.promos.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (promo) {
      setAppliedPromo(promo.discountPercentage);
      alert(`Muvaffaqiyatli! ${promo.discountPercentage}% chegirma qo'llanildi.`);
    } else {
      alert("Promokod xato.");
    }
  };

  const handleCheckout = () => {
    if (!userName || !phone || !location) return alert("Hamma ma'lumotlarni to'ldiring.");
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      userName,
      phone,
      location,
      items: cart,
      totalPrice: total,
      status: 'pending',
      orderType,
      userTelegram: '@user_tg_demo'
    };

    placeOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    alert("Buyurtmangiz adminga yuborildi! Tez orada bog'lanamiz.");
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
      }, () => alert("Lokatsiya ruxsat etilmadi"));
    }
  };

  return (
    <div className="pb-24 pt-6 px-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-luxury text-gray-900">Mavi Boutique</h1>
          <p className="text-xs text-amber-600 font-medium tracking-[0.2em] uppercase">Premium Collection</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 bg-white rounded-full shadow-sm border border-gray-100"
        >
          <ShoppingCart size={22} className="text-gray-700" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Koylak qidirish (nomi yoki ID)..." 
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-amber-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSection('sotish')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeSection === 'sotish' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Sotiladigan
          </button>
          <button 
            onClick={() => setActiveSection('prokat')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeSection === 'prokat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Prokatga
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 group cursor-pointer"
            onClick={() => setSelectedProduct(p)}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                ID: {p.id}
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-bold text-sm">
                  {p.price.toLocaleString()} {activeSection === 'prokat' ? 'uzs/soat' : 'uzs'}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">{p.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Hozircha mahsulotlar yo'q</p>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-[400px]">
              <ProductSlider images={selectedProduct.images} />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-luxury text-gray-900 mb-1">{selectedProduct.name}</h2>
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      ID: {selectedProduct.id}
                    </span>
                    <span className="text-gray-400 text-xs">{selectedProduct.size} razmer</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-600 font-bold text-xl">{selectedProduct.price.toLocaleString()} uzs</div>
                  <div className="text-[10px] text-gray-400 uppercase">{activeSection === 'prokat' ? 'Har bir soat uchun' : 'Donasiga'}</div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {selectedProduct.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Ombor: {selectedProduct.quantity} dona mavjud</span>
                  {selectedProduct.quantity > 0 && (
                     <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400">Soni:</span>
                        <input 
                          type="number" 
                          min="1" 
                          max={selectedProduct.quantity} 
                          defaultValue="1"
                          id="qty-input"
                          className="w-16 border rounded-lg p-1 text-center font-bold"
                        />
                     </div>
                  )}
                </div>

                {selectedProduct.quantity > 0 ? (
                  <button 
                    onClick={() => {
                      const qty = parseInt((document.getElementById('qty-input') as HTMLInputElement).value);
                      addToCart(selectedProduct, qty);
                    }}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Savatga qo'shish
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-4 rounded-xl font-bold">
                    Sotuvda yo'q
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col animate-slide-left">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Savat</h2>
              <button onClick={() => setIsCartOpen(false)}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex space-x-4 bg-gray-50 p-3 rounded-xl">
                  <img src={item.images[0]} className="w-20 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">ID: {item.id} | Razmer: {item.size}</p>
                    <p className="text-xs text-gray-500">Soni: {item.orderQuantity} x {item.price.toLocaleString()}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-amber-700">{(item.price * item.orderQuantity).toLocaleString()} uzs</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs">O'chirish</button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-gray-400 mt-20">Savat bo'sh</p>}
            </div>
            
            <div className="p-6 border-t space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Jami:</span>
                <span>{subTotal.toLocaleString()} uzs</span>
              </div>
              <button 
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
              >
                Buyurtma berish
              </button>
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Ma'lumotlar</h2>
              <button onClick={() => setIsCheckoutOpen(false)}><X /></button>
            </div>
            
            <input 
              className="w-full p-3 border rounded-xl outline-none focus:border-amber-500" 
              placeholder="Ismingiz" 
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
            <input 
              className="w-full p-3 border rounded-xl outline-none focus:border-amber-500" 
              placeholder="Telefon raqamingiz" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            
            <div className="flex space-x-2">
               <input 
                className="flex-1 p-3 border rounded-xl outline-none focus:border-amber-500" 
                placeholder="Manzil yoki Lokatsiya" 
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <button 
                onClick={getCurrentLocation}
                className="p-3 bg-gray-100 rounded-xl active:scale-95 transition-transform"
              >
                <MapPin size={20} className="text-amber-600" />
              </button>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setOrderType('dostavka')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === 'dostavka' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                Dostavka
              </button>
              <button 
                onClick={() => setOrderType('band_qilish')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${orderType === 'band_qilish' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                Band qilish
              </button>
            </div>

            <div className="flex space-x-2">
              <input 
                className="flex-1 p-3 border rounded-xl uppercase text-sm outline-none focus:border-amber-500" 
                placeholder="Promokod" 
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <button onClick={handleApplyPromo} className="px-4 bg-gray-900 text-white rounded-xl text-xs font-bold">Qo'llash</button>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Summa:</span>
                <span>{subTotal.toLocaleString()} uzs</span>
              </div>
              {appliedPromo > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Chegirma:</span>
                  <span>-{appliedPromo}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>To'lanadi:</span>
                <span className="text-amber-700">{total.toLocaleString()} uzs</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
            >
              <Send size={18} />
              <span>Tasdiqlash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;
