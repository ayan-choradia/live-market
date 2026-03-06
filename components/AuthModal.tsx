'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import axios from 'axios';

export default function AuthModal() {
  const { qhToken, setQhToken } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (qhToken) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('https://qh-api.corp.hertshtengroup.com/api/token/', {
        username,
        password
      });
      setQhToken(res.data.access);
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-96 font-mono">
        <h2 className="text-emerald-400 font-bold mb-4">QH TERMINAL LOGIN</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">USERNAME</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              required
            />
          </div>
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'CONNECT'}
          </button>
        </form>
      </div>
    </div>
  );
}
