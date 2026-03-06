'use client';

export default function BottomBar() {
  return (
    <div className="h-8 bg-zinc-950 border-t border-zinc-800 flex items-center overflow-hidden shrink-0">
      <div className="bg-emerald-900/50 text-emerald-400 px-4 h-full flex items-center text-xs font-bold border-r border-zinc-800 shrink-0">
        ECONOMIC CALENDAR
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex space-x-8 whitespace-nowrap px-4 text-xs items-center h-full">
          <span className="flex items-center space-x-2">
            <span className="text-zinc-400">CPI (YoY)</span>
            <span className="text-emerald-400 font-bold">2.9%</span>
            <span className="text-zinc-600">Est: 3.0%</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center space-x-2">
            <span className="text-zinc-400">Unemployment</span>
            <span className="text-red-400 font-bold">4.1%</span>
            <span className="text-zinc-600">Est: 4.0%</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center space-x-2">
            <span className="text-zinc-400">GDP (Q4)</span>
            <span className="text-emerald-400 font-bold">3.2%</span>
            <span className="text-zinc-600">Est: 3.0%</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="flex items-center space-x-2">
            <span className="text-zinc-400">10Y-2Y Spread</span>
            <span className="text-red-400 font-bold">-0.35%</span>
            <span className="text-zinc-600">Prior: -0.40%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
