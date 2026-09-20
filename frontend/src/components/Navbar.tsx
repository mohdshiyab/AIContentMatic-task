import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TrendingUp, Wallet, RefreshCw, Layers, History, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeTab: 'market' | 'portfolio' | 'history';
  setActiveTab: (tab: 'market' | 'portfolio' | 'history') => void;
  onOpenTradeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { portfolio, resetAccount } = useSimulation();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your virtual account? This will restore your balance to $100,000.00 and clear all transactions and holdings.")) {
      resetAccount();
    }
  };

  const totalValue = portfolio?.total_portfolio_value ?? 100000;
  const cashBalance = portfolio?.cash_balance ?? 100000;
  const totalPnl = portfolio?.total_pnl ?? 0;
  const isPositive = totalPnl >= 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">QuantumTrade</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Paper Trading
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Virtual Stock Market Simulator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'market'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Market Watch
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Portfolio
              {portfolio && portfolio.holdings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-blue-500/30 text-blue-200">
                  {portfolio.holdings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </nav>

          {/* Financial Account Stats & Reset */}
          <div className="flex items-center gap-3">
            {/* Account Summary Pill */}
            <div className="hidden sm:flex items-center gap-4 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-slate-500" />
                  Net Worth
                </div>
                <div className="font-mono-num font-bold text-sm text-white">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Available Cash</div>
                <div className="font-mono-num font-semibold text-xs text-emerald-400">
                  ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total P&L</div>
                <div className={`font-mono-num font-semibold text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Reset Account to $100,000"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${activeTab === 'market' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Market
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <Layers className="w-4 h-4" />
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>
    </header>
  );
};
