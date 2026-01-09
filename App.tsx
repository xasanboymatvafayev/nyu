
import React, { useEffect } from 'react';
import { BoutiqueProvider, useBoutique } from './store';
import UserView from './components/UserView';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';

const Main: React.FC = () => {
  const { state, isAdmin, setRole } = useBoutique();

  // Xavfsizlik: Foydalanuvchi admin bo'lmasa, uni majburan UserViewga qaytarish
  useEffect(() => {
    if (state.currentUser.role === 'admin' && !isAdmin) {
      setRole('user');
    }
  }, [state.currentUser.role, isAdmin]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl">
      {/* Faqat ikkala shart ham bajarilsa AdminPanelni yuklash */}
      {state.currentUser.role === 'admin' && isAdmin === true ? (
        <AdminPanel />
      ) : (
        <UserView />
      )}
      <Navigation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BoutiqueProvider>
      <Main />
    </BoutiqueProvider>
  );
};

export default App;
