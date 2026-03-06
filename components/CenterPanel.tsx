'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { qhApi } from '@/lib/api';
import ForwardCurveChart from './ForwardCurveChart';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CenterPanel() {
  const { selectedProduct, setSelectedProduct, interval, setInterval, qhToken } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'OHLC' | 'FORWARD_CURVE'>('OHLC');

  useEffect(() => {
    if (activeTab !== 'OHLC' || !qhToken) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const end = Math.floor(Date.now() / 1000);
        const start = end - (30 * 24 * 60 * 60); // 30 days ago
        const res = await qhApi.get('/api/v2/ohlc/', {
          params: {
            instruments: selectedProduct,
            interval: interval,
            count: 500,
            end,
            start
          }
        });

        if (res.data && res.data[selectedProduct]) {
          const formattedData = res.data[selectedProduct].map((d: any) => {
            const date = new Date(d.timestamp * 1000);
            return {
              time: d.timestamp,
              dateStr: date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
              volume: d.volume,
              isUp: d.close >= d.open
            };
          }).sort((a: any, b: any) => a.time - b.time);

          setData(formattedData);
        } else {
          setError('No data returned for this product.');
        }
      } catch (err: any) {
        console.error('Failed to fetch OHLC data', err);
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch data';
        setError(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [qhToken, selectedProduct, interval, activeTab]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex bg-zinc-900 rounded border border-zinc-700 p-0.5">
            <button
              className={`px-3 py-0.5 text-xs rounded ${activeTab === 'OHLC' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setActiveTab('OHLC')}
            >
              PRICE CHART
            </button>
            <button
              className={`px-3 py-0.5 text-xs rounded ${activeTab === 'FORWARD_CURVE' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setActiveTab('FORWARD_CURVE')}
            >
              FORWARD CURVE
            </button>
          </div>

          {activeTab === 'OHLC' && (
            <>
              <select 
                className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1 outline-none focus:border-emerald-500"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="SRAH26">SRAH26 (SOFR)</option>
                <option value="ZN">ZN (10Y Note)</option>
                <option value="ES">ES (S&P 500)</option>
                <option value="CL">CL (Crude)</option>
              </select>

              <div className="flex bg-zinc-900 rounded border border-zinc-700 p-0.5">
                {['1M', '5M', '1H', '1D'].map((int) => (
                  <button
                    key={int}
                    className={`px-3 py-0.5 text-xs rounded ${interval === int ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                    onClick={() => setInterval(int)}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </>
          )}
          
          {loading && activeTab === 'OHLC' && <span className="text-xs text-zinc-500 animate-pulse">LOADING...</span>}
        </div>
      </div>

      {/* Chart Container */}
      {activeTab === 'OHLC' ? (
        <div className="flex-1 relative p-4 flex flex-col">
          {error ? (
            <div className="flex-1 flex items-center justify-center text-red-500 font-mono text-xs">
              {error}
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="dateStr" 
                  stroke="#a1a1aa" 
                  fontSize={10} 
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={50}
                />
                <YAxis 
                  yAxisId="price"
                  stroke="#a1a1aa" 
                  fontSize={10} 
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  stroke="#a1a1aa" 
                  fontSize={10} 
                  domain={[0, 'dataMax * 3']} // Keep volume at the bottom
                  axisLine={false}
                  tickLine={false}
                  hide={true}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px' }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Bar yAxisId="volume" dataKey="volume" fill="#26a69a" opacity={0.3}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isUp ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-xs">
              NO DATA AVAILABLE
            </div>
          )}
        </div>
      ) : (
        <ForwardCurveChart />
      )}
    </div>
  );
}
