'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { qhApi } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthCodes: Record<number, string> = {
  1: "F", 2: "G", 3: "H", 4: "J", 5: "K", 6: "M",
  7: "N", 8: "Q", 9: "U", 10: "V", 11: "X", 12: "Z"
};

const generateQhCodes = () => {
  const qhcodes = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const future = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthCode = monthCodes[future.getMonth() + 1];
    const yearCode = future.getFullYear().toString().slice(-2);
    qhcodes.push(`NG${monthCode}${yearCode}`);
  }
  return qhcodes;
};

export default function ForwardCurveChart() {
  const { qhToken } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qhToken) return;

    const fetchForwardCurve = async () => {
      setLoading(true);
      setError('');
      try {
        const codes = generateQhCodes();
        const qhcode_str = codes.join(',');

        const res = await qhApi.get('/api/dailymarketdata', {
          params: {
            limit: 20000,
            qhcode: qhcode_str
          }
        });

        if (res.data && res.data.results) {
          // Group by qhcode and find the latest close price for each
          const latestPrices: Record<string, number> = {};
          
          // Sort results by datetime descending so we get the latest first
          const sortedResults = [...res.data.results].sort((a, b) => 
            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          );

          for (const item of sortedResults) {
            if (!latestPrices[item.qhcode] && item.close !== null) {
              latestPrices[item.qhcode] = item.close;
            }
          }

          // Map back to the ordered codes
          const chartData = codes.map(code => ({
            contract: code,
            price: latestPrices[code] || null
          })).filter(item => item.price !== null);

          if (chartData.length === 0) {
            setError('No valid price data found for the generated contracts.');
          } else {
            setData(chartData);
          }
        } else {
          setError('No results found in response.');
        }
      } catch (err: any) {
        console.error('Failed to fetch forward curve data', err);
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch data';
        setError(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchForwardCurve();
  }, [qhToken]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-500 font-mono text-xs">
        LOADING FORWARD CURVE...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-red-500 font-mono text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 p-4">
      <h2 className="text-zinc-400 text-xs font-bold mb-4">NATURAL GAS (NG) FORWARD CURVE</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="contract" 
              stroke="#a1a1aa" 
              fontSize={10} 
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={10} 
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value.toFixed(3)}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px' }}
              itemStyle={{ color: '#10b981' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(value: number | undefined) => [value !== undefined ? `$${value.toFixed(3)}` : 'N/A', 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#09090b', stroke: '#10b981', strokeWidth: 2 }} 
              activeDot={{ r: 5, fill: '#10b981' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
