'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { fedRate, rrpBalance, sofrRate, qtMode } = useStore();

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 text-xs font-mono">
      <div className="flex items-center space-x-6">
        <div className="text-emerald-400 font-bold text-sm tracking-tight">
          QH LIQUIDITY TERMINAL
        </div>
        <div className="text-zinc-400">
          {mounted ? format(time, 'yyyy-MM-dd HH:mm:ss') : '----/--/-- --:--:--'}
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-500">FED RATE:</span>
          <span className="text-zinc-200">{fedRate ? `${fedRate}%` : '---'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-zinc-500">RRP:</span>
          <span className="text-zinc-200">{rrpBalance ? `$${(rrpBalance / 1000).toFixed(2)}T` : '---'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-zinc-500">SOFR:</span>
          <span className="text-zinc-200">{sofrRate ? `${sofrRate}%` : '---'}</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${qtMode === 'QT' ? 'bg-red-900/50 text-red-400 border border-red-800' : qtMode === 'QE' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
          {qtMode ? `${qtMode} MODE` : 'CALCULATING...'}
        </div>
      </div>
    </header>
  );
}
