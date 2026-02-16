import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const divRef = useRef(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/login');
      login(token).then(() => navigate('/', { replace: true }));
      return;
    }
  }, [login, navigate]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Missing Google Client ID');
      // Set a visible error/warning state if you have one, or alert for now
      // setGuestError('System Error: Google Client ID is missing in Vercel settings.');
      return;
    }
    if (loading) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google && divRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (res) => {
            try {
              const r = await fetch(`${API_URL}/api/auth/google/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ credential: res.credential })
              });

              if (!r.ok) throw new Error('Failed to verify token');

              const data = await r.json();
              if (data.token) {
                localStorage.setItem('token', data.token);
                await login(data.token);
                // Force navigation to clear history stack
                window.location.href = '/';
              }
            } catch (e) {
              console.error(e);
              alert('Google Sign-In failed. Please try again.');
            }
          }
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 250
        });
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [loading, login, navigate]);

  const handleRedirectLogin = () => {
    window.location.href = (API_URL || window.location.origin) + '/api/auth/google';
  };

  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  const handleGuestLogin = async () => {
    setGuestError('');
    setGuestLoading(true);
    try {
      // CLEAR any existing token to prevent cross-account contamination
      localStorage.removeItem('token');

      const { data } = await auth.guest();
      if (data.token) {
        localStorage.setItem('token', data.token);
        await login(data.token);
        navigate('/', { replace: true });
      } else {
        setGuestError(data.message || 'Login failed');
      }
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Cannot reach server. Is the backend running on port 5000?';
      setGuestError(msg);
    } finally {
      setGuestLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 px-4 relative overflow-hidden">
      {/* Animated Background */}
      {/* Static Background - Light Orange-Black Neon Shade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600/10 via-dark-950 to-dark-950"></div>

      <div className="relative glass p-10 rounded-2xl w-full max-w-md text-center border-t border-white/10 shadow-2xl animate-fade-in transform hover:scale-[1.01] transition-transform duration-500">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-2 selection:bg-primary">
            <span className="text-primary text-glow">Red</span>Fit<span className="text-primary">.</span>Chat
          </h1>
          <p className="text-gray-400 text-lg font-light">Join the elite conversation.</p>
        </div>

        <div ref={divRef} className="min-h-[44px] mb-6 flex justify-center" />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-800 text-gray-500">or continue as</span></div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={guestLoading}
          className="w-full px-6 py-4 bg-dark-700/50 text-white rounded-xl font-medium hover:bg-dark-600 hover:text-primary transition-all border border-white/5 hover:border-primary/50 flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center gap-2">
            {guestLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Entering...
              </>
            ) : (
              <>
                <span>Anonymous Guest</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </>
            )}
          </span>
        </button>

        {guestError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {guestError}
          </div>
        )}
      </div>

      {!GOOGLE_CLIENT_ID && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-200 text-xs font-mono">
          ⚠️ Setup Required: Add VITE_GOOGLE_CLIENT_ID to Vercel
        </div>
      )}

      <div className="absolute bottom-6 text-gray-600 text-xs text-center">
        <p>&copy; 2026 RedFit Chat Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
