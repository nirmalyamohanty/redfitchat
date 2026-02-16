import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as usersApi } from '../api';

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const [bio, setBio] = useState('');
  const [translationDefault, setTranslationDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setTranslationDefault(user.translationDefault ?? false);
    }
  }, [user]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.update({ bio, translationDefault });
      if (avatarFile) {
        await usersApi.avatar(avatarFile);
        setAvatarFile(null);
      }
      await refreshUser();
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save settings. If uploading a photo, ensure Cloudinary is configured.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen relative overflow-hidden bg-dark-950 flex items-center justify-center">
      {/* Background Elements */}
      {/* Static Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-600/5 via-dark-950 to-dark-950 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl mx-4 glass rounded-3xl p-8 border border-white/10 shadow-neon">
        <h1 className="text-3xl font-display font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Settings</h1>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <img
                src={user?.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`}
                alt=""
                className="relative w-24 h-24 rounded-full border-2 border-dark-900 object-cover"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-dark-800 rounded-full border border-white/10 cursor-pointer hover:bg-primary hover:border-primary transition-colors text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0])}
                />
              </label>
            </div>
            {avatarFile && <span className="text-xs text-primary font-mono">{avatarFile.name}</span>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Username</label>
              <input
                value={user?.username || ''}
                readOnly
                className="w-full bg-dark-900/50 rounded-xl px-4 py-3 text-gray-400 font-mono text-sm border border-white/5 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={3}
                className="w-full bg-dark-900/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all resize-none"
                placeholder="Tell others about yourself..."
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-500 font-mono">{bio.length}/200</span>
              </div>
            </div>

            <div className="bg-dark-900/30 p-4 rounded-xl border border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${translationDefault ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-primary/50'}`}>
                  {translationDefault && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={translationDefault}
                  onChange={(e) => setTranslationDefault(e.target.checked)}
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Auto-translate messages to English</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            {(user?.username?.startsWith('guest_') || user?.isGuest) && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <div className="text-xs text-yellow-500/90 leading-relaxed">
                  You are using a Guest account. Changes might not be permanent.
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-hover hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] text-white rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
              <button
                onClick={logout}
                className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white rounded-xl font-medium border border-white/5 transition-all text-sm uppercase tracking-wider"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
