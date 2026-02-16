import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import GlobalChat from './pages/GlobalChat';
import PersonalChat from './pages/PersonalChat';
import Settings from './pages/Settings';

import AIChat from './pages/AIChat';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Navbar />
              <GlobalChat />
            </Protected>
          }
        />
        <Route
          path="/chat"
          element={
            <Protected>
              <Navbar />
              <PersonalChat />
            </Protected>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <Protected>
              <Navbar />
              <PersonalChat />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <Navbar />
              <Settings />
            </Protected>
          }
        />
        <Route
          path="/ai"
          element={
            <Protected>
              <AIChat />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
