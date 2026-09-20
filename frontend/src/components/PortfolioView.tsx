import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StockPriceItem, HoldingItem } from '../types';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PortfolioViewProps {
  onTradeStock: (stock: StockPriceItem, type: 'BUY' | 'SELL') => void;
  onExploreMarket: () => void;
}

const PIE_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EC4899', '#06B6D4', '#14B8A6', '#F97316', 
  '#6366F1', '#84CC16', '#64748B'
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onTradeStock, onExploreMarket }) => {
  const { portfolio, stocks, currentTime } = useSimulation();

  const cash = portfolio?.cash_balance ?? 100000;
  const invested = portfolio?.invested_value ?? 0;
  const totalValue = portfolio?.total_portfolio_value ?? 100000;
  const unrealizedPnl = portfolio?.total_unrealized_pnl ?? 0;
  const unrealizedPnlPct = portfolio?.total_unrealized_pnl_percent ?? 0;
  const realizedPnl = portfolio?.total_realized_pnl ?? 0;
  const totalPnl = portfolio?.total_pnl ?? 0;
  const holdings = portfolio?.holdings ?? [];

  // Pie chart data: Cash + each holding
  const allocationData = [
    { name: 'Cash', value: cash },
    ...holdings.map((h) => ({
      name: h.symbol,
      value: h.current_value,
    })),
  ].filter((item) => item.value > 0);

  // Helper to find stock object for trade
  const getStockObject = (symbol: string): StockPriceItem | undefined => {
    return stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  };

  return (
    <div className="space-y-6">
      
      {/* Portfolio Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Worth */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Net Worth</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl lg:text-3xl font-black font-mono-num text-white">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span>Starting capital:</span>
            <span className="font-mono-num text-slate-300 font-semibold">$100,000.00</span>
          </div>
        </div>

        {/* Available Cash & Invested */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Cash & Equity</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-num text-emerald-400">
            ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Invested Equity:</span>
            <span className="font-mono-num text-blue-400 font-semibold">
              ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Unrealized Profit / Loss */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Unrealized P&L</span>
            {unrealizedPnl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
          </div>
          <div className={`text-2xl font-black font-mono-num ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs font-mono-num font-semibold text-slate-300 flex items-center gap-1">
            <span>Return on Open:</span>
            <span className={unrealizedPnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {unrealizedPnlPct >= 0 ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Total Realized & Combined P&L */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Realized P&L</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-black font-mono-num ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs font-mono-num text-slate-400 flex items-center justify-between">
            <span>Combined Total P&L:</span>
            <span className={`font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* Main Content: Holdings Table + Asset Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Holdings Table */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Active Positions ({holdings.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Market prices & valuation dynamically calculated as of {currentTime}
                </p>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Your portfolio is empty</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                  You have $100,000.00 in virtual paper cash ready to deploy. Explore available market stocks to place your first trade!
                </p>
                <button
                  onClick={onExploreMarket}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
                >
                  Browse Market Stocks
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-3 py-3 text-right">Shares</th>
                      <th className="px-3 py-3 text-right">Avg Cost</th>
                      <th className="px-3 py-3 text-right">Market Price</th>
                      <th className="px-3 py-3 text-right">Current Value</th>
                      <th className="px-3 py-3 text-right">Unrealized P&L</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {holdings.map((h) => {
                      const isHoldingPos = h.unrealized_pnl >= 0;
                      const stockObj = getStockObject(h.symbol);

                      return (
                        <tr key={h.symbol} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-sm">{h.symbol}</span>
                              <span className="text-slate-400 truncate max-w-[120px]">{h.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono-num">
                              {h.portfolio_percent.toFixed(1)}% of Portfolio
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-right font-mono-num font-bold text-white text-sm">
                            {h.shares}
                          </td>
                          <td className="px-3 py-3.5 text-right font-mono-num text-slate-300">
                            ${h.avg_buy_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-3.5 text-right font-mono-num font-bold text-slate-200">
                            ${h.current_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-3.5 text-right font-mono-num font-extrabold text-white text-sm">
                            ${h.current_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-3.5 text-right font-mono-num">
                            <div className={`font-bold ${isHoldingPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isHoldingPos ? '+' : ''}${h.unrealized_pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-[10px] ${isHoldingPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isHoldingPos ? '+' : ''}{h.unrealized_pnl_percent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => stockObj && onTradeStock(stockObj, 'BUY')}
                                title="Buy More Shares"
                                className="p-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => stockObj && onTradeStock(stockObj, 'SELL')}
                                title="Sell Shares"
                                className="p-1.5 rounded-lg bg-rose-600/15 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Asset Allocation Chart */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Asset Allocation
            </h3>
            <p className="text-xs text-slate-400 mb-4">Capital distribution across cash and holdings</p>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Capital allocation summary */}
          <div className="border-t border-slate-800 pt-4 mt-2 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Virtual Cash Balance
              </span>
              <span className="font-mono-num font-bold text-white">
                {((cash / totalValue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Equities Portfolio
              </span>
              <span className="font-mono-num font-bold text-white">
                {((invested / totalValue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
