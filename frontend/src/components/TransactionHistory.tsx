import React, { useState, useEffect } from 'react';
import { TransactionItem } from '../types';
import { api } from '../services/api';
import { useSimulation } from '../context/SimulationContext';
import { 
  History, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Layers
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { currentTime, portfolio } = useSimulation();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const sym = selectedSymbol === 'All' ? undefined : selectedSymbol;
        const typ = selectedType === 'All' ? undefined : selectedType;
        const data = await api.getTransactions(sym, typ);
        if (isMounted) setTransactions(data);
      } catch (err) {
        console.error('Failed to load transaction history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTransactions();
    return () => { isMounted = false; };
  }, [selectedSymbol, selectedType, currentTime, portfolio]);

  // Unique symbols from transactions
  const uniqueSymbols = ['All', ...Array.from(new Set(transactions.map((t) => t.symbol)))];

  // Quick stats
  const totalTrades = transactions.length;
  const totalVolumeShares = transactions.reduce((acc, t) => acc + t.shares, 0);
  const totalRealizedPnl = transactions.reduce((acc, t) => acc + (t.realized_pnl || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Orders Executed
          </span>
          <div className="text-2xl font-black font-mono-num text-white">
            {totalTrades}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Shares Traded
          </span>
          <div className="text-2xl font-black font-mono-num text-blue-400">
            {totalVolumeShares.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cumulative Realized P&L
          </span>
          <div className={`text-2xl font-black font-mono-num ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Execution Audit Log</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Symbol Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Symbol:</span>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-950 border border-slate-750 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
            >
              {uniqueSymbols.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-750 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading order history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center px-4">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No transactions found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Your trade orders will be logged here with complete execution timestamps and realized P&L.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5 text-right">Shares</th>
                  <th className="px-4 py-3.5 text-right">Execution Price</th>
                  <th className="px-4 py-3.5 text-right">Total Amount</th>
                  <th className="px-4 py-3.5 text-right">Realized P&L</th>
                  <th className="px-5 py-3.5">Simulation Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  const isPositivePnl = tx.realized_pnl >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono-num text-slate-400">
                        #{tx.id}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-white text-sm">{tx.symbol}</div>
                        <div className="text-[11px] text-slate-400">{tx.name}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num font-bold text-white text-sm">
                        {tx.shares}
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num text-slate-300">
                        ${tx.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num font-extrabold text-white text-sm">
                        ${tx.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right font-mono-num">
                        {isBuy ? (
                          <span className="text-slate-600">—</span>
                        ) : (
                          <span className={`font-bold ${isPositivePnl ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositivePnl ? '+' : ''}${tx.realized_pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono-num text-xs">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{tx.simulation_time}</span>
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
  );
};
