'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { fetchFredData } from '@/lib/fred';

export default function LeftPanel() {
  const { liquidityScore, setLiquidityScore, setFedRate, setRrpBalance, setSofrRate, setQtMode, qtMode } = useStore();
  const [walclData, setWalclData] = useState<any[]>([]);
  const [rrpData, setRrpData] = useState<any[]>([]);
  
  useEffect(() => {
    const loadFredData = async () => {
      try {
        const walcl = await fetchFredData('WALCL');
        const rrp = await fetchFredData('RRPONTSYD');
        const dff = await fetchFredData('DFF');
        const sofr = await fetchFredData('SOFR');

        if (walcl && walcl.length > 0) {
          const reversed = [...walcl].reverse();
          setWalclData(reversed.map(d => ({ v: parseFloat(d.value) })));
          
          // Determine QT/QE
          if (walcl.length >= 2) {
            const current = parseFloat(walcl[0].value);
            const prev = parseFloat(walcl[1].value);
            setQtMode(current < prev ? 'QT' : 'QE');
          }
        }

        if (rrp && rrp.length > 0) {
          const reversed = [...rrp].reverse();
          setRrpData(reversed.map(d => ({ v: parseFloat(d.value) })));
          setRrpBalance(parseFloat(rrp[0].value));
        }

        if (dff && dff.length > 0) {
          setFedRate(parseFloat(dff[0].value));
        }

        if (sofr && sofr.length > 0) {
          setSofrRate(parseFloat(sofr[0].value));
        }
      } catch (err) {
        console.error('Failed to load FRED data', err);
      }
    };

    loadFredData();
  }, [setFedRate, setRrpBalance, setSofrRate, setQtMode]);

  useEffect(() => {
    let score = 50;
    
    // QT Mode
    if (qtMode === 'QT') score += 15;
    else if (qtMode === 'QE') score -= 15;

    // RRP Balance falling
    if (rrpData.length >= 2) {
      const current = rrpData[rrpData.length - 1].v;
      const prev = rrpData[rrpData.length - 2].v;
      if (current < prev) score -= 10;
      else score += 5;
    }

    // Tax dates (mock check)
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();
    if ((month === 3 || month === 5 || month === 8 || month === 11) && date >= 5 && date <= 15) {
      score += 20;
    }

    // Bound between 0 and 100
    score = Math.max(0, Math.min(100, score));
    setLiquidityScore(score);
  }, [qtMode, rrpData, setLiquidityScore]);
  
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-y-auto shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">LIQUIDITY PRESSURE</h2>
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold ${liquidityScore > 70 ? 'text-red-400' : liquidityScore > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {liquidityScore}
          </div>
          <div className="text-xs text-zinc-400">0-100</div>
        </div>
        <div className="w-full bg-zinc-800 h-2 mt-2 rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${liquidityScore > 70 ? 'bg-red-500' : liquidityScore > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
            style={{ width: `${liquidityScore}%` }}
          />
        </div>
      </div>
      
      {/* Treasury Issuances */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">TREASURY ISSUANCE</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">4W Bill</span>
            <span className="text-red-400">-$45B</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">8W Bill</span>
            <span className="text-red-400">-$30B</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Paydown</span>
            <span className="text-emerald-400">+$12B</span>
          </div>
        </div>
      </div>

      {/* Fed Balance Sheet */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">FED BALANCE SHEET</h2>
        <div className="h-16 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={walclData.length ? walclData : [{v: 100}, {v: 98}, {v: 95}, {v: 90}, {v: 85}]}>
              <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-zinc-400">Total Assets</span>
          <span className="text-red-400">-$15B (1W)</span>
        </div>
      </div>

      {/* RRP & Reserves */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">RRP & RESERVES</h2>
        <div className="h-16 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rrpData.length ? rrpData : [{v: 50}, {v: 45}, {v: 40}, {v: 35}, {v: 30}]}>
              <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-zinc-400">RRP Balance</span>
          <span className="text-emerald-400">-$20B (1W)</span>
        </div>
      </div>

      {/* Tax Dates */}
      <div className="p-4">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">TAX DATES (DRAIN)</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Mid-April</span>
            <span className="text-zinc-500">Individual</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Mid-June</span>
            <span className="text-zinc-500">Est Q2</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Mid-Sept</span>
            <span className="text-zinc-500">Est Q3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Mid-Dec</span>
            <span className="text-zinc-500">Est Q4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
