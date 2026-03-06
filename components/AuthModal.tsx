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
      const res = await axios.post('/api/auth/login', {
        username,
        password
      });
      setQhToken(res.data.access);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Authentication failed: ${err.response.data?.detail || err.response.statusText || 'Invalid credentials'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error: Could not connect to the authentication server. This might be a CORS issue or the server is down.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-96 font-mono">
        <h2 className="text-emerald-400 font-bold mb-4">QH TERMINAL LOGIN</h2>
        
        <div className="mb-6 p-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-400 space-y-2">
          <p className="font-bold text-zinc-300">How to get credentials:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              Go to <a href="https://qh-api.corp.hertshtengroup.com/api/auth/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">QH API Auth</a>
            </li>
            <li>Log in with your Microsoft credentials</li>
            <li>Copy the generated Username and Password</li>
            <li>Paste them below (do NOT use your Microsoft password here)</li>
          </ol>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">GENERATED USERNAME</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">GENERATED PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              required
            />
          </div>
          {error && <div className="text-red-400 text-xs break-words">{error}</div>}
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
