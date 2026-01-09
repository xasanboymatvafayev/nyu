
import React, { useState, useRef } from 'react';
import { useBoutique } from '../store';
import { Plus, Trash2, Edit3, Search, Users, ShoppingCart, TrendingUp, Tag, ArrowLeft, Image as ImageIcon, Check, X, Upload, Lock, ShieldCheck, LogOut } from 'lucide-react';
import { Product, PromoCode } from '../types';
import ProductSlider from './ProductSlider';

const AdminPanel: React.FC = () => {
  const { state, addProduct, deleteProduct, confirmOrder, addPromo, isAuthorized, authorize, logout } = useBoutique();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'promos'>('dashboard');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Product Form States
  const [newProd, setNewProd] = useState<Partial<Product>>({
    images: [],
    section: 'sotish',
    quantity: 1,
  });
  const [currentStep, setCurrentStep] = useState(1);

  // Promo Form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(0);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-luxury font-bold text-gray-900">Admin Kirish</h2>
            <p className="text-gray-400 text-sm mt-1">Parol: netlify123</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="password"
              placeholder="Parolni kiriting"
              className={`w-full p-4 bg-gray-50 rounded-2xl border-2 outline-none transition-all text-center text-lg font-bold tracking-widest ${error ? 'border-red-500 animate-shake' : 'border-transparent focus:border-amber-500'}`}
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!authorize(passwordInput)) setError(true);
                }
              }}
            />
            {error && <p className="text-red-500 text-xs font-bold">Xato parol kiritildi!</p>}
            <button 
              onClick={() => {
                if (!authorize(passwordInput)) setError(true);
              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <ShieldCheck size={20} />
              <span>Tasdiqlash</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: 1420,
    totalSales: state.orders.reduce((acc, o) => acc + o.totalPrice, 0),
    activeOrders: state.orders.filter(o => o.status === 'pending').length,
    productCount: state.products.length,
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !newProd.id) return alert("ID kiriting");
    if (currentStep === 2 && (!newProd.images || newProd.images.length === 0)) return alert("Kamida bitta rasm yuklang");
    if (currentStep === 6 && (!newProd.price || newProd.price <= 0)) return alert("Narx kiriting");
    setCurrentStep(prev => prev + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProd(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string].slice(0, 4) // Max 4 images
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewProd(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const saveProduct = () => {
    addProduct(newProd as Product);
    setIsAddingProduct(false);
    setNewProd({ images: [], section: 'sotish', quantity: 1 });
    setCurrentStep(1);
    alert("Koylak muvaffaqiyatli qo'shildi!");
  };

  const renderAddProductWizard = () => (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto pb-20">
      <div className="p-6 flex items-center justify-between border-b">
        <button onClick={() => { setIsAddingProduct(false); setCurrentStep(1); }}><ArrowLeft /></button>
        <h2 className="font-bold text-gray-900">Yangi koylak qo'shish</h2>
        <span className="text-xs font-bold text-gray-400">Qadam {currentStep}/7</span>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Mahsulot ID raqami (masalan: 001)</label>
            <input 
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none transition-all"
              placeholder="001..." 
              value={newProd.id || ''}
              onChange={e => setNewProd({...newProd, id: e.target.value})}
            />
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">Keyingisi</button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Rasmlarni tanlang (Galereyadan 1-4 ta)</label>
            
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center space-y-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Upload className="text-gray-400" size={32} />
              <span className="text-xs font-medium text-gray-500">Rasm yuklash uchun bosing</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {newProd.images?.map((img, i) => (
                <div key={i} className="relative aspect-[3/4] group">
                  <img src={img} className="w-full h-full object-cover rounded-xl border shadow-sm" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {newProd.images && newProd.images.length > 0 && (
              <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold mt-4">Keyingisi</button>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Koylak nomi va Tavsifi</label>
            <input 
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              placeholder="Koylak nomi..." 
              value={newProd.name || ''}
              onChange={e => setNewProd({...newProd, name: e.target.value})}
            />
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl border-none h-32"
              placeholder="Tavsifi..." 
              value={newProd.description || ''}
              onChange={e => setNewProd({...newProd, description: e.target.value})}
            />
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">Keyingisi</button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Nechta bor?</label>
            <input 
              type="number"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              value={newProd.quantity || 1}
              onChange={e => setNewProd({...newProd, quantity: parseInt(e.target.value)})}
            />
            <label className="block text-sm font-bold text-gray-700">Bo'limni tanlang</label>
            <div className="flex space-x-2">
              <button 
                onClick={() => setNewProd({...newProd, section: 'sotish'})}
                className={`flex-1 py-3 rounded-xl border-2 ${newProd.section === 'sotish' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-gray-100'}`}
              >
                Sotuv
              </button>
              <button 
                onClick={() => setNewProd({...newProd, section: 'prokat'})}
                className={`flex-1 py-3 rounded-xl border-2 ${newProd.section === 'prokat' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-gray-100'}`}
              >
                Prokat
              </button>
            </div>
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">Keyingisi</button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Razmerlar (masalan: M-S yoki XL)</label>
            <input 
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              placeholder="M-S..." 
              value={newProd.size || ''}
              onChange={e => setNewProd({...newProd, size: e.target.value})}
            />
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">Keyingisi</button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">
              {newProd.section === 'sotish' ? 'Sotish narxi (UZS)' : 'Prokat narxi (1 soatga / UZS)'}
            </label>
            <input 
              type="number"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              placeholder="1000000..." 
              value={newProd.price || ''}
              onChange={e => setNewProd({...newProd, price: parseInt(e.target.value)})}
            />
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">Ko'rib chiqish</button>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-6 animate-fade-in pb-10">
            <h3 className="text-lg font-bold">Yakuniy ko'rinish</h3>
            <div className="border rounded-2xl overflow-hidden shadow-lg bg-white">
              <ProductSlider images={newProd.images || []} />
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold">{newProd.name}</h4>
                  <span className="bg-black text-white text-[10px] px-2 py-1 rounded">ID: {newProd.id}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{newProd.description}</p>
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-amber-600 text-lg">{newProd.price?.toLocaleString()} UZS</span>
                  <span className="text-xs font-medium text-gray-400 uppercase">Razmer: {newProd.size}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setIsAddingProduct(false); setCurrentStep(1); }} className="bg-red-50 text-red-600 py-4 rounded-xl text-xs font-bold border border-red-100 flex flex-col items-center">
                <Trash2 size={18} />
                <span>O'chirish</span>
              </button>
              <button onClick={() => setCurrentStep(1)} className="bg-gray-100 text-gray-600 py-4 rounded-xl text-xs font-bold border border-gray-200 flex flex-col items-center">
                <Edit3 size={18} />
                <span>Tahrirlash</span>
              </button>
              <button onClick={saveProduct} className="bg-amber-600 text-white py-4 rounded-xl text-xs font-bold shadow-md flex flex-col items-center">
                <Check size={18} />
                <span>Tasdiqlash</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-xs text-gray-400">Mavi Boutique Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={logout}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Chiqish"
          >
            <LogOut size={20} />
          </button>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="bg-black text-white p-2.5 rounded-full shadow-lg"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-4 py-4 space-x-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500'}`}>Stats</button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500'}`}>Koylaklar</button>
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500'}`}>Buyurtmalar</button>
        <button onClick={() => setActiveTab('promos')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'promos' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500'}`}>Promokod</button>
      </div>

      <div className="px-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Users className="text-blue-500 mb-2" size={24} />
              <span className="text-2xl font-black">{stats.totalUsers}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">Mijozlar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <TrendingUp className="text-green-500 mb-2" size={24} />
              <span className="text-lg font-black">{stats.totalSales.toLocaleString()}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">Tushum (UZS)</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <ShoppingCart className="text-amber-500 mb-2" size={24} />
              <span className="text-2xl font-black">{stats.activeOrders}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">Buyurtmalar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <ImageIcon className="text-purple-500 mb-2" size={24} />
              <span className="text-2xl font-black">{stats.productCount}</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">Koylaklar</span>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ID orqali qidirish (masalan: 001)..." 
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-none shadow-sm text-sm"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {state.products
                .filter(p => !searchId || p.id.includes(searchId))
                .map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl flex items-center space-x-4 shadow-sm border">
                  <img src={p.images[0]} className="w-16 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-sm">{p.name}</h4>
                      <span className="text-[10px] font-bold text-gray-400">ID: {p.id}</span>
                    </div>
                    <p className="text-xs text-amber-600 font-bold mt-1">{p.price.toLocaleString()} uzs</p>
                    <div className="flex items-center space-x-4 mt-2">
                       <span className={`text-[10px] font-bold uppercase ${p.quantity === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                         Zaxira: {p.quantity}
                       </span>
                       <span className="text-[10px] text-gray-400 uppercase">Bo'lim: {p.section}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {state.orders.length === 0 && <p className="text-center py-20 text-gray-400">Buyurtmalar yo'q</p>}
            {state.orders.map(o => (
              <div key={o.id} className={`p-5 rounded-2xl border-2 shadow-sm ${o.status === 'confirmed' ? 'bg-green-50 border-green-100' : 'bg-white border-transparent'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{o.userName}</h4>
                    <p className="text-xs text-gray-500">{o.phone}</p>
                    <p className="text-xs text-amber-600 font-medium">TG: {o.userTelegram}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${o.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {o.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                   {o.items.map((item, idx) => (
                     <div key={idx} className="flex items-center space-x-3 bg-gray-50/50 p-2 rounded-lg">
                        <img src={item.images[0]} className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 text-xs">
                          <p className="font-bold">{item.name} (x{item.orderQuantity})</p>
                          <p className="text-gray-400">ID: {item.id} | {item.size}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="flex justify-between items-center text-sm mb-4">
                   <span className="text-gray-500">Turi: <b className="text-gray-900">{o.orderType}</b></span>
                   <span className="font-bold text-gray-900">{o.totalPrice.toLocaleString()} uzs</span>
                </div>

                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg mb-4">
                   <MapPin size={14} />
                   <span className="text-[10px] font-medium truncate">{o.location}</span>
                </div>

                {o.status === 'pending' && (
                  <button 
                    onClick={() => confirmOrder(o.id)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    Tasdiqlash & Tovarni kamaytirish
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
               <h3 className="font-bold mb-4">Yangi Promokod</h3>
               <div className="space-y-4">
                  <input 
                    className="w-full p-3 bg-gray-50 rounded-xl" 
                    placeholder="KOD (masalan: MAVI20)" 
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  />
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-xl" 
                    placeholder="Chegirma % (masalan: 15)" 
                    value={newDiscount || ''}
                    onChange={e => setNewDiscount(parseInt(e.target.value))}
                  />
                  <button 
                    onClick={() => {
                      if (!newPromoCode || !newDiscount) return;
                      addPromo({ code: newPromoCode, discountPercentage: newDiscount });
                      setNewPromoCode('');
                      setNewDiscount(0);
                    }}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold"
                  >
                    Qo'shish
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {state.promos.map((p, i) => (
                <div key={i} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <div className="text-amber-800 font-black text-lg">{p.code}</div>
                      <div className="text-xs text-amber-600 font-bold">-{p.discountPercentage}%</div>
                   </div>
                   <Tag className="text-amber-200" size={32} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAddingProduct && renderAddProductWizard()}
    </div>
  );
};

const MapPin: React.FC<{ size?: number, className?: string }> = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default AdminPanel;
