import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventsProvider } from './context/EventsContext';
import { Layout } from './components/Layout';
import { Welcome } from './pages/Welcome';
import { Unlock } from './pages/Unlock';
import { Timeline } from './pages/Timeline';
import { EventEditor } from './pages/EventEditor';
import { Settings } from './pages/Settings';
import { Search } from './pages/Search';
import { Dashboard } from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

// Guard component
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading, hasAccount } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!hasAccount) {
    return <Welcome />;
  }

  if (!isAuthenticated) {
    return <Unlock />;
  }

  return <Layout />;
};

function App() {
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <EventsProvider>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/" element={<Timeline />} />
              <Route path="/insights" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/new" element={<EventEditor />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </EventsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
