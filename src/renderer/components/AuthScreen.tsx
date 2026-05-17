import { useState, useRef } from 'react';
import { useAuthStore } from '../store';
import { Lock, User, Plus, Camera, ArrowRight, X } from 'lucide-react';

export default function AuthScreen() {
  const { users, addUser, login } = useAuthStore();
  const [view, setView] = useState<'select' | 'pin' | 'create'>(users.length === 0 ? 'create' : 'select');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  // Create state
  const [name, setName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setAvatarUrl(event.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUserSelect = (id: string) => {
    setSelectedUserId(id);
    setView('pin');
    setPin('');
    setError('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && login(selectedUserId, pin)) {
      // successful login, parent component will unmount this screen
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || newPin.length < 4) {
      setError('Name and a PIN (min 4 digits) are required.');
      return;
    }
    
    // Auto-generate avatar if none uploaded
    const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    
    const newUser = {
      id: Date.now().toString(),
      name,
      pin: newPin,
      avatarUrl: finalAvatar
    };
    
    addUser(newUser);
    login(newUser.id, newUser.pin);
  };

  const handleBack = () => {
    if (users.length === 0) return;
    setView('select');
    setError('');
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-blue-900/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50"></div>
      
      <div className="relative w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl">
        {error && (
          <div className="absolute -top-16 left-0 right-0 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-center text-sm">
            {error}
          </div>
        )}

        {view === 'select' && (
          <div className="flex flex-col items-center">
            <Lock className="w-12 h-12 text-blue-500 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 mb-8 text-center">Select your profile to continue</p>
            
            <div className="w-full space-y-3 mb-6">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all group"
                >
                  <img src={u.avatarUrl} alt={u.name} className="w-12 h-12 rounded-full border-2 border-gray-700 group-hover:border-blue-500 transition-colors bg-gray-900" />
                  <span className="font-semibold text-lg text-gray-200">{u.name}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setView('create')}
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors py-2"
            >
              <Plus size={16} /> Add new profile
            </button>
          </div>
        )}

        {view === 'pin' && selectedUserId && (
          <div className="flex flex-col items-center">
            <button onClick={handleBack} className="absolute top-6 left-6 text-gray-500 hover:text-white">
               <X size={24} />
            </button>
            <div className="mb-6">
               <img src={users.find(u => u.id === selectedUserId)?.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full border-2 border-gray-700 bg-gray-900" />
            </div>
            <h1 className="text-xl font-bold text-white mb-6">Enter PIN for {users.find(u => u.id === selectedUserId)?.name}</h1>
            
            <form onSubmit={handlePinSubmit} className="w-full">
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-4 text-center text-3xl tracking-widest text-white focus:outline-none focus:border-blue-500 transition-colors mb-6"
                placeholder="••••"
              />
              <button 
                type="submit"
                disabled={!pin}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center"
              >
                Unlock
              </button>
            </form>
          </div>
        )}

        {view === 'create' && (
          <form onSubmit={handleCreate} className="flex flex-col items-center">
            {users.length > 0 && (
              <button type="button" onClick={handleBack} className="absolute top-6 left-6 text-gray-500 hover:text-white">
                 <X size={24} />
              </button>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2">Create Profile</h1>
            <p className="text-gray-400 mb-8 text-center text-sm">Set up your workspace identity</p>
            
            <div 
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 mb-8 cursor-pointer group overflow-hidden hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Upload preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white font-medium">Upload Pic</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            
            <div className="w-full space-y-4 mb-8">
              <div>
                <label className="block text-gray-400 text-sm mb-1 px-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Alex"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1 px-1">PIN Code</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="At least 4 digits"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group"
            >
              Create & Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
