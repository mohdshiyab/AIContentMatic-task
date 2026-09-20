import React, { useState } from 'react';
import { StockPriceItem } from '../types';
import { useSimulation } from '../context/SimulationContext';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  ShoppingCart, 
  Send,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface MarketOverviewProps {
  onSelectStock: (stock: StockPriceItem) => void;
  onTradeStock: (stock: StockPriceItem, type: 'BUY' | 'SELL') => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ onSelectStock, onTradeStock }) => {
  const { stocks, portfolio, isLoading } = useSimulation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract sectors
  const sectors = ['All', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  // Filter stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Helper to get owned shares
  const getOwnedShares = (symbol: string) => {
    const pos = portfolio?.holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase());
    return pos?.shares ?? 0;
  };

  return (
    <div className="space-y-6">
      
      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stocks by ticker or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-750 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Sector Tabs & View Toggle */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedSector === sec
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-800 hidden sm:block" />

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Loading state */}
      {isLoading && stocks.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading test market data...</p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-base font-semibold text-slate-300">No stocks match your query</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing search filters or selecting another sector.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredStocks.map((stock) => {
            const isPos = stock.day_change >= 0;
            const owned = getOwnedShares(stock.symbol);

            return (
              <div
                key={stock.symbol}
                className="bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-200 group shadow-lg hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  {/* Card Header: Symbol & Sector */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">
                          {stock.symbol}
                        </span>
                        {owned > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {owned} owned
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs text-slate-400 font-medium truncate max-w-[140px]" title={stock.name}>
                        {stock.name}
                      </h4>
                    </div>

                    <button
                      onClick={() => onSelectStock(stock)}
                      title="View Detailed Chart"
                      className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-blue-600 transition"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price & Day Change */}
                  <div className="my-3">
                    <div className="text-2xl font-black font-mono-num text-white tracking-tight">
                      ${stock.price.toFixed(2)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center text-xs font-mono-num font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isPos ? '+' : ''}${stock.day_change.toFixed(2)} ({stock.day_change_percent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 mb-3">
                    <div>
                      <span className="text-slate-500 block">Day Range</span>
                      <span className="font-mono-num text-slate-300 font-medium">
                        ${stock.low.toFixed(1)} - ${stock.high.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Volume</span>
                      <span className="font-mono-num text-slate-300 font-medium">
                        {(stock.volume / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onTradeStock(stock, 'BUY')}
                    className="w-full py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Buy
                  </button>
                  <button
                    onClick={() => onTradeStock(stock, 'SELL')}
                    disabled={owned <= 0}
                    className="w-full py-1.5 rounded-lg bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:hover:bg-rose-600/15 disabled:hover:text-rose-400"
                  >
                    <Send className="w-3 h-3 rotate-45" />
                    Sell
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Sector</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5 text-right">Day Change</th>
                  <th className="px-4 py-3.5 text-right">30m Change</th>
                  <th className="px-4 py-3.5 text-right">Volume</th>
                  <th className="px-4 py-3.5 text-center">Your Holdings</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStocks.map((stock) => {
                  const isPos = stock.day_change >= 0;
                  const owned = getOwnedShares(stock.symbol);

                  return (
                    <tr key={stock.symbol} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 font-black flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition"
                          >
                            {stock.symbol}
                          </button>
                          <div>
                            <div className="font-bold text-white cursor-pointer hover:text-blue-400" onClick={() => onSelectStock(stock)}>
                              {stock.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{stock.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-400 font-medium">
                        {stock.sector}
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num font-extrabold text-sm text-white">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num font-bold">
                        <span className={`inline-flex items-center gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}${stock.day_change.toFixed(2)} ({stock.day_change_percent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num">
                        <span className={stock.interval_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {stock.interval_change >= 0 ? '+' : ''}${stock.interval_change.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num text-slate-400">
                        {stock.volume.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {owned > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {owned} shares
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono-num">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                            title="Interactive Chart"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onTradeStock(stock, 'BUY')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => onTradeStock(stock, 'SELL')}
                            disabled={owned <= 0}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition disabled:opacity-30 disabled:hover:bg-rose-600/20 disabled:hover:text-rose-300"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
