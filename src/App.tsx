import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventsProvider } from './context/EventsContext';
import { Layout } from './components/Layout';
// New View Components
import StandardTimeline from './components/views/StandardTimeline';
import CalendarView from './components/views/CalendarView';
import AnalyticsCharts from './components/views/AnalyticsCharts';
import ActivityPunchCard from './components/views/ActivityPunchCard';
import EventEditor from './components/views/EventEditor';
import SearchGlobal from './components/views/SearchGlobal';
import SettingsMain from './components/views/SettingsMain';
import AuthLock from './components/views/AuthLock';

import { Loader2 } from 'lucide-react';

// Guard component
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading, hasAccount } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
      </div>
    );
  }

  // If user has an account, they must be authenticated (unlocked)
  if (hasAccount && !isAuthenticated) {
    return <AuthLock />;
  }

  // If no account (guest) or authenticated, show the app
  return <Layout />;
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  // Theme logic is now handled in ThemeProvider

  return (
    <Router>
      <AuthProvider>
        <EventsProvider>
          <ThemeProvider>
            <Routes>
              <Route element={<AuthGuard />}>
                <Route path="/" element={<StandardTimeline />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/insights" element={<AnalyticsCharts />} />
                <Route path="/punch" element={<ActivityPunchCard />} />
                <Route path="/search" element={<SearchGlobal />} />
                <Route path="/new" element={<EventEditor />} />
                <Route path="/settings" element={<SettingsMain />} />
              </Route>
            </Routes>
          </ThemeProvider>
        </EventsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

