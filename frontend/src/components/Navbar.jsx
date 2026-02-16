import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold tracking-tight text-white select-none">
          <span className="text-primary text-glow">Red</span>Fit<span className="text-primary">.</span>Chat
        </h1>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            Global
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            Messages
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-600/10'}`}>
            ✨ AI Chat
          </NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NavLink to="/settings" className="flex items-center gap-2 group">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user?.username}</span>
          <div className="relative">
            <img src={user?.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`} alt="" className="w-9 h-9 rounded-full border-2 border-transparent group-hover:border-primary transition-colors object-cover" />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dark-800 ${user ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>
        </NavLink>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
