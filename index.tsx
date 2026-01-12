
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Star, 
  Sparkles, 
  ChevronRight,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Loader2
} from 'lucide-react';

// --- Types & Constants ---
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Premium Moviy Ko'ylak", price: 120, category: "Ko'ylaklar", rating: 4.8, image: "https://images.unsplash.com/photo-1539109132314-34a959dfc024?auto=format&fit=crop&w=500&q=80", description: "Ipakdan tikilgan oqshom ko'ylagi." },
  { id: 2, name: "Klassik Bej Pidjak", price: 250, category: "Ustki kiyim", rating: 4.9, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80", description: "Har qanday vaziyat uchun mos klassika." },
  { id: 3, name: "Oq Elegant To'plam", price: 180, category: "To'plamlar", rating: 4.7, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80", description: "Yozgi oq rangli premium to'plam." },
  { id: 4, name: "Qora Charm Sumka", price: 95, category: "Aksessuarlar", rating: 4.6, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80", description: "Haqiqiy charm va italyancha dizayn." },
  { id: 5, name: "Minimalist Soat", price: 320, category: "Aksessuarlar", rating: 5.0, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80", description: "Cheklangan miqdordagi premium soat." },
  { id: 6, name: "Kashmir Jumper", price: 155, category: "Trikotaj", rating: 4.9, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=500&q=80", description: "Yumshoq kashmir junidan tayyorlangan." },
];

const DB_KEYS = {
  CART: 'mavi_boutique_cart',
  FAVORITES: 'mavi_boutique_favorites'
};

// --- Main App Component ---
const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Data Persistence (Database logic)
  useEffect(() => {
    const savedCart = localStorage.getItem(DB_KEYS.CART);
    const savedFavs = localStorage.getItem(DB_KEYS.FAVORITES);
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  // --- Handlers ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const filteredProducts = activeCategory === "Barchasi" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const askAiStylist = async () => {
    if (!aiMessage.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Siz "Mavi Boutique" do'konining moda bo'yicha maslahatchisisiz. 
      Do'konimizda: ${PRODUCTS.map(p => p.name).join(", ")} kabi mahsulotlar bor.
      Mijoz savoli: ${aiMessage}.
      Qisqa, xushmuomala va professional javob bering.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiResponse(response.text || "Kechirasiz, hozir yordam bera olmayman.");
    } catch (err) {
      setAiResponse("Xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="lg:hidden text-slate-600" />
            <h1 className="text-2xl font-black tracking-tighter text-blue-900">MAVI<span className="text-blue-500">BOUTIQUE</span></h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm uppercase tracking-widest text-slate-500">
            {["Barchasi", "Ko'ylaklar", "Ustki kiyim", "Aksessuarlar"].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`hover:text-blue-600 transition-colors ${activeCategory === cat ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 relative text-slate-600 hover:text-blue-600">
              <Heart size={22} fill={favorites.length > 0 ? "currentColor" : "none"} />
              {favorites.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="p-2 relative text-slate-600 hover:text-blue-600">
              <ShoppingBag size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Banner"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-white">
          <h2 className="text-5xl lg:text-7xl font-bold mb-4 leading-tight">Yangi Mavsum<br/>Kollektsiyasi</h2>
          <p className="text-lg text-slate-200 mb-8 max-w-lg">O'z uslubingizni premium sifat va zamonaviy dizayn bilan toping.</p>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105">
            Xaridni boshlash <ArrowRight size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-bold text-slate-900">{activeCategory}</h3>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Search size={18} /> <span>Filterlash</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur rounded-full text-slate-900 hover:text-red-500 transition-colors shadow-lg"
                >
                  <Heart size={20} fill={favorites.includes(product.id) ? "currentColor" : "none"} />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    <Plus size={18} /> Savatchaga qo'shish
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{product.category}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{product.rating}</span>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">{product.name}</h4>
                <p className="text-2xl font-black text-slate-900">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* AI Stylist Float Button */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 z-50 group"
      >
        <Sparkles size={28} className="group-hover:animate-spin" />
      </button>

      {/* AI Drawer */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAiOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={24} />
                <h3 className="font-bold text-xl">AI Stylist</h3>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-slate-100 p-4 rounded-2xl text-slate-700">
                Assalomu alaykum! Mavi Boutique AI stilisti yordamga tayyor. Qaysi obraz sizga qiziq?
              </div>
              {aiResponse && (
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-900 border border-blue-100 shadow-sm">
                  {aiResponse}
                </div>
              )}
              {isAiLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAiStylist()}
                  placeholder="Kiyim tanlashda yordam kerakmi?..."
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                />
                <button 
                  onClick={askAiStylist}
                  disabled={isAiLoading}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Savatcha ({cart.length})</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="text-lg font-medium">Savatchangiz bo'sh</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold hover:underline">Xaridni boshlash</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">${item.price}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-blue-600"><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-blue-600"><Plus size={14} /></button>
                        </div>
                        <span className="text-sm font-bold text-slate-900 ml-auto">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Jami:</span>
                  <span className="text-2xl text-blue-900">${cartTotal}</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                  To'lovni amalga oshirish
                </button>
                <p className="text-center text-xs text-slate-400">Bepul yetkazib berish va 30 kunlik qaytarish kafolati.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-xl font-black text-slate-900 mb-6">MAVI BOUTIQUE</h2>
          <div className="flex justify-center gap-8 mb-8 text-sm font-medium text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600">Biz haqimizda</a>
            <a href="#" className="hover:text-blue-600">Yetkazib berish</a>
            <a href="#" className="hover:text-blue-600">FAQ</a>
            <a href="#" className="hover:text-blue-600">Kontakt</a>
          </div>
          <p className="text-slate-400 text-xs">© 2025 Mavi Boutique. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

// Render
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
