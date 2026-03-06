'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useStore } from '@/store/useStore';
import { qhApi } from '@/lib/api';

export default function CenterPanel() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { selectedProduct, setSelectedProduct, interval, setInterval, qhToken } = useStore();
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<"Histogram"> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#27272a',
      },
    });

    const newSeries = newChart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const newVolumeSeries = newChart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });

    newVolumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });

    setChart(newChart);
    setCandlestickSeries(newSeries);
    setVolumeSeries(newVolumeSeries);

    const handleResize = () => {
      if (chartContainerRef.current) {
        newChart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
    };
  }, []);

  useEffect(() => {
    if (!qhToken || !candlestickSeries || !volumeSeries) return;

    const fetchData = async () => {
      setLoading(true);
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
          const ohlcData = res.data[selectedProduct].map((d: any) => ({
            time: d.timestamp,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })).sort((a: any, b: any) => a.time - b.time);

          const volData = res.data[selectedProduct].map((d: any) => ({
            time: d.timestamp,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
          })).sort((a: any, b: any) => a.time - b.time);

          candlestickSeries.setData(ohlcData);
          volumeSeries.setData(volData);
        }
      } catch (err) {
        console.error('Failed to fetch OHLC data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [qhToken, selectedProduct, interval, candlestickSeries, volumeSeries]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-4">
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
          
          {loading && <span className="text-xs text-zinc-500 animate-pulse">LOADING...</span>}
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
            <input type="checkbox" className="accent-emerald-500" defaultChecked />
            <span>TAS Overlay</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
            <input type="checkbox" className="accent-emerald-500" />
            <span>Greeks</span>
          </label>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative" ref={chartContainerRef} />
    </div>
  );
}
