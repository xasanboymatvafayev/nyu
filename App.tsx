
import React from 'react';
import { BoutiqueProvider, useBoutique } from './store';
import UserView from './components/UserView';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';

const Main: React.FC = () => {
  const { state } = useBoutique();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl">
      {state.currentUser.role === 'admin' ? (
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
