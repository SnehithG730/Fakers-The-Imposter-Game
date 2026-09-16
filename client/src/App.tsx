import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeamDashboard } from './pages/TeamDashboard';
import { Navbar } from './components/Navbar';

const GameRouter: React.FC = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-display tracking-widest uppercase">
          Initializing The Realm...
        </p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          {session.role === 'ADMIN' ? <AdminDashboard /> : <TeamDashboard />}
        </main>
      </div>
    </SocketProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <GameRouter />
    </AuthProvider>
  );
};

export default App;
