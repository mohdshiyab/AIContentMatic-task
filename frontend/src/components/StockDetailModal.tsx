import React, { useEffect, useState } from 'react';
import { StockPriceItem, CandleStickItem } from '../types';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart,
  Send
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

interface StockDetailModalProps {
  stock: StockPriceItem | null;
  onClose: () => void;
  onTrade: (stock: StockPriceItem, initialType: 'BUY' | 'SELL') => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, onTrade }) => {
  const { currentTime } = useSimulation();
  const [history, setHistory] = useState<CandleStickItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!stock) return;
    let isMounted = true;
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const data = await api.getStockHistory(stock!.symbol, currentTime);
        if (isMounted) setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [stock, currentTime]);

  if (!stock) return null;

  const isPositive = stock.day_change >= 0;
  const chartColor = isPositive ? '#10B981' : '#EF4444';

  // Format history for chart
  const chartData = history.map((item) => {
    const timeOnly = item.timestamp.split(' ')[1]?.slice(0, 5) || '';
    const dateOnly = item.timestamp.split(' ')[0]?.slice(5) || '';
    return {
      label: `${dateOnly} ${timeOnly}`,
      close: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
    };
  });

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.low)) * 0.99 : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.high)) * 1.01 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-lg">
              {stock.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{stock.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400">Simulation Price as of {currentTime}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Price & Change Banner */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Market Price</span>
              <div className="text-3xl font-extrabold font-mono-num text-white mt-0.5">
                ${stock.price.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs font-semibold text-slate-400">Day Change</span>
                <div className={`flex items-center gap-1 font-mono-num font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}${stock.day_change.toFixed(2)} ({stock.day_change_percent.toFixed(2)}%)</span>
                </div>
              </div>

              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-slate-400">30-Min Interval Change</span>
                <div className={`flex items-center gap-1 font-mono-num font-semibold text-sm ${stock.interval_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span>{stock.interval_change >= 0 ? '+' : ''}${stock.interval_change.toFixed(2)} ({stock.interval_change_percent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price History Area Chart */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                Historical Price Chart ({chartData.length} Intervals)
              </h3>
              <span className="text-xs text-slate-400 font-mono-num">
                Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
              </span>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                Loading price history...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No price data available for selected timestamp.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="#64748B" 
                      tick={{ fontSize: 10, fill: '#64748B' }} 
                      interval={Math.max(1, Math.floor(chartData.length / 6))} 
                    />
                    <YAxis 
                      domain={[minPrice, maxPrice]} 
                      stroke="#64748B" 
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
                      formatter={(val: any) => [`$${parseFloat(val).toFixed(2)}`, 'Price']}
                      labelStyle={{ color: '#94A3B8', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke={chartColor} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#priceGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Day Open</span>
              <span className="font-mono-num font-bold text-slate-200 text-sm">${stock.day_open.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Interval High</span>
              <span className="font-mono-num font-bold text-slate-200 text-sm">${stock.high.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Interval Low</span>
              <span className="font-mono-num font-bold text-slate-200 text-sm">${stock.low.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Interval Volume</span>
              <span className="font-mono-num font-bold text-slate-200 text-sm">{stock.volume.toLocaleString()}</span>
            </div>
          </div>

          {/* Company Profile Description */}
          {stock.description && (
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-300 block mb-1">About {stock.name}:</span>
              {stock.description}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              onTrade(stock, 'SELL');
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600/20 font-bold text-sm flex items-center gap-2 transition"
          >
            <Send className="w-4 h-4 rotate-45" />
            Sell {stock.symbol}
          </button>
          <button
            onClick={() => {
              onClose();
              onTrade(stock, 'BUY');
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy {stock.symbol}
          </button>
        </div>

      </div>
    </div>
  );
};
