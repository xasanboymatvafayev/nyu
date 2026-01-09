
import React from 'react';
import { useBoutique } from '../store';
import { LayoutDashboard, ShoppingBag } from 'lucide-react';

const Navigation: React.FC = () => {
  const { state, setRole, isAdmin } = useBoutique();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => setRole('user')}
        className={`flex flex-col items-center space-y-1 transition-all ${state.currentUser.role === 'user' ? 'text-amber-600 scale-110' : 'text-gray-400 opacity-60'}`}
      >
        <ShoppingBag size={24} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Do'kon</span>
      </button>

      {/* FAQAT HAQIQIY ADMINLARGA KO'RSATISH */}
      {isAdmin === true && (
        <button 
          onClick={() => setRole('admin')}
          className={`flex flex-col items-center space-y-1 transition-all ${state.currentUser.role === 'admin' ? 'text-amber-600 scale-110' : 'text-gray-400 opacity-60'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Boshqaruv</span>
        </button>
      )}
    </nav>
  );
};

export default Navigation;
