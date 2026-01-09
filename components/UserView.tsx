
import React, { useState } from 'react';
import { useBoutique } from '../store';
import { ShoppingCart, Search, ShoppingBag, X, MapPin, Send, Plus, Minus, Info } from 'lucide-react';
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

  const addToCart = (product: Product, qty: number, openCart: boolean = true) => {
    if (qty > product.quantity) return alert(`Kechirasiz, faqat ${product.quantity} dona qolgan.`);
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = Math.min(product.quantity, existing.orderQuantity + qty);
        return prev.map(item => item.id === product.id ? { ...item, orderQuantity: newQty } : item);
      }
      return [...prev, { ...product, orderQuantity: qty }];
    });
    
    if (openCart) {
      setSelectedProduct(null);
      setIsCartOpen(true);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.quantity, item.orderQuantity + delta));
        return { ...item, orderQuantity: newQty };
      }
      return item;
    }));
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
    } else {
      alert("Promokod xato.");
    }
  };

  const handleCheckout = () => {
    if (!userName || !phone || !location) return alert("Iltimos, hamma maydonlarni to'ldiring.");
    
    const newOrder: Order = {
      id: `ORDER-${Date.now()}`,
      userName,
      phone,
      location,
      items: cart,
      totalPrice: total,
      status: 'pending',
      orderType,
      userTelegram: '@user_tg'
    };

    placeOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    alert("Tabriklaymiz! Buyurtmangiz adminga yuborildi.");
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
      }, () => alert("Lokatsiyaga ruxsat bermadingiz."));
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 bg-[#fcfcfc] min-h-screen animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-luxury font-bold tracking-tight text-gray-900">MAVI</h1>
          <div className="h-0.5 w-12 bg-amber-600 rounded-full"></div>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-3 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-50 active:scale-90 transition-transform"
        >
          <ShoppingCart size={22} className="text-gray-900" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-white animate-bounce">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* Search & Tabs */}
      <div className="space-y-5 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Koylak qidirish (ID: 001...)" 
            className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border-none shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-3xl">
          <button 
            onClick={() => setActiveSection('sotish')}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-[22px] transition-all duration-300 ${activeSection === 'sotish' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sotuvda
          </button>
          <button 
            onClick={() => setActiveSection('prokat')}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-[22px] transition-all duration-300 ${activeSection === 'prokat' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Prokat
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50 flex flex-col group animate-scale-up">
            <div className="aspect-[3/4] relative overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm">
                ID: {p.id}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div onClick={() => setSelectedProduct(p)} className="cursor-pointer mb-3">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">{p.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">RAZMER: {p.size}</span>
                  <span className="text-amber-700 font-black text-xs">{p.price.toLocaleString()} uzs</span>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
                className="mt-auto w-full bg-gray-900 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-black shadow-lg shadow-gray-200"
              >
                <Plus size={16} />
                <span>Savatga</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 opacity-20 flex flex-col items-center">
          <ShoppingBag size={80} strokeWidth={1} className="mb-4" />
          <p className="font-bold text-lg">Hali mahsulot yo'q</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-t-[45px] sm:rounded-[40px] overflow-hidden max-h-[95vh] flex flex-col animate-slide-up shadow-2xl">
            <div className="relative h-[480px]">
              <ProductSlider images={selectedProduct.images} />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 bg-white/80 p-3 rounded-full backdrop-blur-md shadow-2xl active:scale-90 transition-transform"
              >
                <X size={24} className="text-gray-900" />
              </button>
            </div>
            <div className="p-10 overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                      ID: {selectedProduct.id}
                    </span>
                    <span className="text-gray-400 text-xs font-bold uppercase">{selectedProduct.size} razmer</span>
                  </div>
                  <h2 className="text-3xl font-luxury text-gray-900">{selectedProduct.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-amber-600 font-black text-2xl">{selectedProduct.price.toLocaleString()} uzs</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                    {activeSection === 'prokat' ? '1 soat uchun' : 'Donasiga'}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-10 border-l-4 border-amber-500/20 pl-5 italic">
                {selectedProduct.description}
              </p>

              <div className="bg-gray-50 p-6 rounded-[32px] flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sotuvda mavjud:</span>
                  <span className="text-lg font-black text-gray-900">{selectedProduct.quantity} dona</span>
                </div>
                <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                  <button onClick={() => {
                    const el = document.getElementById('qty-input') as HTMLInputElement;
                    el.value = Math.max(1, parseInt(el.value) - 1).toString();
                  }} className="p-2 text-gray-400 hover:text-gray-900"><Minus size={18} /></button>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedProduct.quantity} 
                    defaultValue="1"
                    id="qty-input"
                    className="w-12 text-center font-black text-lg outline-none"
                  />
                  <button onClick={() => {
                    const el = document.getElementById('qty-input') as HTMLInputElement;
                    el.value = Math.min(selectedProduct.quantity, parseInt(el.value) + 1).toString();
                  }} className="p-2 text-gray-400 hover:text-gray-900"><Plus size={18} /></button>
                </div>
              </div>

              <button 
                onClick={() => {
                  const qty = parseInt((document.getElementById('qty-input') as HTMLInputElement).value) || 1;
                  addToCart(selectedProduct, qty);
                }}
                className="w-full bg-black text-white py-5 rounded-[26px] font-black text-lg shadow-2xl shadow-amber-900/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                <Plus size={24} />
                <span>Savatga qo'shish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex justify-end backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full flex flex-col animate-slide-left shadow-2xl">
            <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                   <ShoppingCart size={22} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Savat</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                <X size={22} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex space-x-5 animate-scale-up group">
                  <img src={item.images[0]} className="w-24 h-32 object-cover rounded-3xl shadow-lg border border-gray-100" />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                       <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">ID: {item.id} • {item.size}</p>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3 bg-gray-100 px-3 py-1.5 rounded-xl scale-90">
                          <button onClick={() => updateCartQty(item.id, -1)}><Minus size={14} /></button>
                          <span className="font-black text-sm w-4 text-center">{item.orderQuantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)}><Plus size={14} /></button>
                       </div>
                       <div className="font-black text-amber-700 text-sm">
                        {(item.price * item.orderQuantity).toLocaleString()} uzs
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="text-center py-40 opacity-20 flex flex-col items-center">
                  <ShoppingBag size={100} strokeWidth={1} className="mb-6" />
                  <p className="text-xl font-bold">Savat hozircha bo'sh</p>
                </div>
              )}
            </div>
            
            <div className="p-10 border-t bg-gray-50/50 space-y-8">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jami hisob:</span>
                   <span className="text-3xl font-black text-gray-900 tracking-tight">{subTotal.toLocaleString()} <small className="text-sm">uzs</small></span>
                </div>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black">{cart.length} kiyim</div>
              </div>
              <button 
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-black text-white py-5 rounded-[28px] font-black text-lg shadow-2xl shadow-gray-300 active:scale-[0.98] transition-all disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center space-x-3"
              >
                <span>Buyurtmani rasmiylashtirish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-lg">
          <div className="bg-white w-full max-w-md rounded-[45px] p-10 space-y-8 animate-scale-up shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-600"></div>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Ma'lumotlar</h2>
                <p className="text-xs text-gray-400">Dostavka uchun kerak bo'ladi</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-3 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">To'liq ismingiz</label>
                <input 
                  className="w-full p-4.5 bg-gray-50 rounded-[22px] border-none outline-none focus:ring-2 focus:ring-amber-500 font-bold text-gray-800" 
                  placeholder="Ali Valiyev" 
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Telefon</label>
                <input 
                  type="tel"
                  className="w-full p-4.5 bg-gray-50 rounded-[22px] border-none outline-none focus:ring-2 focus:ring-amber-500 font-bold text-gray-800" 
                  placeholder="+998" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Lokatsiya</label>
                <div className="flex space-x-2">
                  <input 
                    className="flex-1 p-4.5 bg-gray-50 rounded-[22px] border-none outline-none focus:ring-2 focus:ring-amber-500 font-bold text-gray-800 truncate" 
                    placeholder="Manzilingiz..." 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  <button 
                    onClick={getCurrentLocation}
                    className="p-4.5 bg-amber-600 text-white rounded-[22px] active:scale-90 transition-all shadow-lg shadow-amber-200"
                    title="GPS"
                  >
                    <MapPin size={22} />
                  </button>
                </div>
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-[22px]">
                <button onClick={() => setOrderType('dostavka')} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all uppercase tracking-widest ${orderType === 'dostavka' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400'}`}>Dostavka</button>
                <button onClick={() => setOrderType('band_qilish')} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all uppercase tracking-widest ${orderType === 'band_qilish' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400'}`}>Band qilish</button>
              </div>

              <div className="flex space-x-2">
                <input 
                  className="flex-1 p-4.5 bg-gray-50 rounded-[22px] border-none outline-none focus:ring-2 focus:ring-amber-500 uppercase font-black tracking-[0.2em] text-xs" 
                  placeholder="PROMOKOD" 
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                />
                <button onClick={handleApplyPromo} className="px-6 bg-gray-900 text-white rounded-[22px] text-xs font-black hover:bg-black transition-colors">OK</button>
              </div>
            </div>

            <div className="pt-8 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold">Buyurtma summasi:</span>
                <span className="text-gray-900 font-black">{subTotal.toLocaleString()} uzs</span>
              </div>
              {appliedPromo > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-500 font-bold">Chegirma:</span>
                  <span className="text-green-600 font-black">-{appliedPromo}%</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-black text-gray-900">Jami:</span>
                <span className="text-3xl font-black text-amber-700">{total.toLocaleString()} uzs</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-black text-white py-5 rounded-[28px] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl active:scale-[0.97] transition-all"
            >
              <Send size={24} />
              <span>Buyurtmani Tasdiqlash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Trash: React.FC<{ size?: number, className?: string }> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

export default UserView;
