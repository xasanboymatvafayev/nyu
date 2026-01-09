import React, { useState, ChangeEvent } from 'react';
import { useBoutique } from '../store';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Tag, 
  ArrowLeft, 
  Image as ImageIcon, 
  Check, 
  X,
  MapPin
} from 'lucide-react';
import { Product, PromoCode, SectionType } from '../types';
import ProductSlider from './ProductSlider';

const AdminPanel: React.FC = () => {
  const { state, addProduct, deleteProduct, confirmOrder, updateProduct, addPromo } = useBoutique();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'promos'>('dashboard');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchId, setSearchId] = useState('');

  // New Product Form States
  const [newProd, setNewProd] = useState<Partial<Product>>({
    id: '',
    name: '',
    description: '',
    images: [],
    section: 'sotish',
    quantity: 1,
    price: 0,
    size: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [tempImg, setTempImg] = useState('');

  // Promo Form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(0);

  const stats = {
    totalUsers: 1420, // Mock stats
    totalSales: state.orders.reduce((acc, o) => acc + o.totalPrice, 0),
    activeOrders: state.orders.filter(o => o.status === 'pending').length,
    productCount: state.products.length,
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !newProd.id) return alert("ID kiriting");
    if (currentStep === 2 && newProd.images!.length === 0) return alert("Rasm qo'shing");
    if (currentStep === 6 && (!newProd.price || newProd.price <= 0)) return alert("Narx kiriting");
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addImg = () => {
    if (!tempImg.trim()) return;
    setNewProd(prev => ({ 
      ...prev, 
      images: [...(prev.images || []), tempImg.trim()] 
    }));
    setTempImg('');
  };

  const removeImg = (index: number) => {
    setNewProd(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // File input uchun - bu yerda faqat URLni ko'rsatish uchun
    // Haqiqiy fayl yuklash uchun server API kerak
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = () => {
    if (!newProd.id || !newProd.name || !newProd.price || newProd.price <= 0) {
      alert("Barcha maydonlarni to'ldiring");
      return;
    }

    const product: Product = {
      id: newProd.id,
      name: newProd.name || '',
      description: newProd.description || '',
      images: newProd.images || [],
      section: newProd.section || 'sotish',
      quantity: newProd.quantity || 1,
      price: newProd.price,
      size: newProd.size || '',
      orderQuantity: 1 // default qiymat
    };

    addProduct(product);
    setIsAddingProduct(false);
    setNewProd({ 
      id: '',
      name: '',
      description: '',
      images: [], 
      section: 'sotish', 
      quantity: 1,
      price: 0,
      size: ''
    });
    setCurrentStep(1);
    alert("Koylak muvaffaqiyatli qo'shildi!");
  };

  const renderAddProductWizard = () => (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto pb-20">
      <div className="p-6 flex items-center justify-between border-b">
        <button 
          onClick={() => {
            if (currentStep === 1) {
              setIsAddingProduct(false);
            } else {
              handlePrevStep();
            }
          }}
          className="p-2"
        >
          <ArrowLeft />
        </button>
        <h2 className="font-bold">Yangi koylak qo'shish</h2>
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
            
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">
              Keyingisi
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Rasm manzillari (3-4 ta yuboring)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none transition-all"
                placeholder="Rasm URL manzili..." 
                value={tempImg}
                onChange={e => setTempImg(e.target.value)}
              />
              
              <button 
                onClick={addImg} 
                className="px-4 bg-amber-600 text-white rounded-xl flex items-center justify-center"
                disabled={!tempImg.trim()}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {newProd.images?.map((img, i) => (
                <div key={i} className="relative">
                  <img 
                    src={img} 
                    alt={`Product ${i + 1}`} 
                    className="aspect-square object-cover rounded-lg border shadow-sm w-full" 
                  />
                  <button
                    onClick={() => removeImg(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleNextStep} 
              disabled={newProd.images?.length === 0}
              className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Keyingisi
            </button>
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
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">
              Keyingisi
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">Nechta bor?</label>
            <input 
              type="number"
              min="1"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              value={newProd.quantity || 1}
              onChange={e => setNewProd({...newProd, quantity: parseInt(e.target.value) || 1})}
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
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">
              Keyingisi
            </button>
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
            <button onClick={handleNextStep} className="w-full bg-black text-white py-4 rounded-xl font-bold">
              Keyingisi
            </button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700">
              {newProd.section === 'sotish' ? 'Sotish narxi (UZS)' : 'Prokat narxi (1 soatga / UZS)'}
            </label>
            <input 
              type="number"
              min="0"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none"
              placeholder="1000000..." 
              value={newProd.price || ''}
              onChange={e => setNewProd({...newProd, price: parseInt(e.target.value) || 0})}
            />
            <button 
              onClick={handleNextStep} 
              disabled={!newProd.price || newProd.price <= 0}
              className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Ko'rib chiqish
            </button>
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
                  <span className="font-bold text-amber-600 text-lg">
                    {newProd.price?.toLocaleString()} UZS
                  </span>
                  <span className="text-xs font-medium text-gray-400 uppercase">Razmer: {newProd.size}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">Bo'lim: {newProd.section}</span>
                  <span className="text-xs text-gray-500">Zaxira: {newProd.quantity} ta</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => { 
                  setIsAddingProduct(false); 
                  setCurrentStep(1); 
                  setNewProd({ 
                    images: [], 
                    section: 'sotish', 
                    quantity: 1 
                  }); 
                }} 
                className="bg-red-50 text-red-600 py-4 rounded-xl text-xs font-bold border border-red-100 flex flex-col items-center"
              >
                <Trash2 size={18} />
                <span>Bekor qilish</span>
              </button>
              <button 
                onClick={() => setCurrentStep(1)} 
                className="bg-gray-100 text-gray-600 py-4 rounded-xl text-xs font-bold border border-gray-200 flex flex-col items-center"
              >
                <Edit3 size={18} />
                <span>Tahrirlash</span>
              </button>
              <button 
                onClick={saveProduct} 
                className="bg-amber-600 text-white py-4 rounded-xl text-xs font-bold shadow-md flex flex-col items-center"
              >
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
        <button 
          onClick={() => setIsAddingProduct(true)}
          className="bg-black text-white p-2.5 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex px-4 py-4 space-x-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          Stats
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          Koylaklar
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          Buyurtmalar
        </button>
        <button 
          onClick={() => setActiveTab('promos')} 
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'promos' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          Promokod
        </button>
      </div>

      <div className="px-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Users className="text-blue-500 mb-2" size={24} />
              <span className="text-2xl font-black">{stats.totalUsers.toLocaleString()}</span>
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
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {state.products
                .filter(p => !searchId || p.id.toLowerCase().includes(searchId.toLowerCase()))
                .map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl flex items-center space-x-4 shadow-sm border hover:shadow-md transition-shadow">
                  <img 
                    src={p.images[0] || '/placeholder.jpg'} 
                    alt={p.name} 
                    className="w-16 h-20 object-cover rounded-xl" 
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-sm">{p.name}</h4>
                      <span className="text-[10px] font-bold text-gray-400">ID: {p.id}</span>
                    </div>
                    <p className="text-xs text-amber-600 font-bold mt-1">{p.price.toLocaleString()} uzs</p>
                    <div className="flex items-center space-x-4 mt-2">
                       <span className="text-[10px] text-gray-400 uppercase">Zaxira: {p.quantity}</span>
                       <span className="text-[10px] text-gray-400 uppercase">Bo'lim: {p.section}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => {
                        if (window.confirm(`${p.name} mahsulotini o'chirishni tasdiqlaysizmi?`)) {
                          deleteProduct(p.id);
                        }
                      }} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {state.orders.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <ShoppingCart className="mx-auto mb-4" size={48} />
                <p>Buyurtmalar yo'q</p>
              </div>
            )}
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
                        <img 
                          src={item.images[0] || '/placeholder.jpg'} 
                          alt={item.name} 
                          className="w-10 h-10 rounded object-cover" 
                        />
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
                    onClick={() => {
                      if (window.confirm(`"${o.userName}" buyurtmasini tasdiqlaysizmi?`)) {
                        confirmOrder(o.id);
                      }
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
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
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    placeholder="KOD (masalan: MAVI20)" 
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  />
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    placeholder="Chegirma % (masalan: 15)" 
                    value={newDiscount || ''}
                    onChange={e => setNewDiscount(parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={() => {
                      if (!newPromoCode.trim()) {
                        alert("Promokod kiritilmagan");
                        return;
                      }
                      if (newDiscount < 1 || newDiscount > 100) {
                        alert("Chegirma 1-100% oralig'ida bo'lishi kerak");
                        return;
                      }
                      
                      const promo: PromoCode = { 
                        code: newPromoCode.trim(), 
                        discountPercentage: newDiscount 
                      };
                      addPromo(promo);
                      setNewPromoCode('');
                      setNewDiscount(0);
                      alert("Promokod qo'shildi!");
                    }}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    Qo'shish
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {state.promos.map((p, i) => (
                <div key={i} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex justify-between items-center hover:shadow-sm transition-shadow">
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

export default AdminPanel;