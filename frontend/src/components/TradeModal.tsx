import React, { useState, useEffect } from 'react';
import { StockPriceItem } from '../types';
import { useSimulation } from '../context/SimulationContext';
import { api } from '../services/api';
import { 
  X, 
  ShoppingCart, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface TradeModalProps {
  stock: StockPriceItem | null;
  initialType?: 'BUY' | 'SELL';
  onClose: () => void;
  onTradeSuccess?: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  stock,
  initialType = 'BUY',
  onClose,
  onTradeSuccess,
}) => {
  const { currentTime, portfolio, refreshMarketAndPortfolio, showToast } = useSimulation();
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>(initialType);
  const [sharesInput, setSharesInput] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setTradeType(initialType);
    setSharesInput('1');
    setErrorMessage(null);
  }, [initialType, stock]);

  if (!stock) return null;

  const currentPrice = stock.price;
  const cashBalance = portfolio?.cash_balance ?? 0;
  
  // Find current holding for this stock
  const currentHolding = portfolio?.holdings.find(
    (h) => h.symbol.toUpperCase() === stock.symbol.toUpperCase()
  );
  const ownedShares = currentHolding?.shares ?? 0;

  const sharesNumber = parseInt(sharesInput, 10) || 0;
  const totalAmount = Math.round(sharesNumber * currentPrice * 100) / 100;

  // Max calculations
  const maxBuyShares = currentPrice > 0 ? Math.floor(cashBalance / currentPrice) : 0;
  const maxSellShares = ownedShares;

  const handlePercentage = (pct: number) => {
    if (tradeType === 'BUY') {
      const target = Math.floor(maxBuyShares * (pct / 100));
      setSharesInput(Math.max(1, target).toString());
    } else {
      const target = Math.floor(maxSellShares * (pct / 100));
      setSharesInput(Math.max(1, target).toString());
    }
  };

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (sharesNumber <= 0) {
      setErrorMessage('Please enter at least 1 share.');
      return;
    }

    if (tradeType === 'BUY' && totalAmount > cashBalance) {
      setErrorMessage(`Insufficient virtual funds. You need $${totalAmount.toFixed(2)}, but have $${cashBalance.toFixed(2)}.`);
      return;
    }

    if (tradeType === 'SELL' && sharesNumber > ownedShares) {
      setErrorMessage(`You cannot sell ${sharesNumber} shares. You currently own ${ownedShares} shares.`);
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (tradeType === 'BUY') {
        res = await api.buyStock(stock.symbol, sharesNumber, currentTime);
      } else {
        res = await api.sellStock(stock.symbol, sharesNumber, currentTime);
      }

      showToast(res.message, 'success');
      await refreshMarketAndPortfolio();
      if (onTradeSuccess) onTradeSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Trade execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400">
              {stock.symbol}
            </div>
            <div>
              <h3 className="font-bold text-white leading-none">{stock.name}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono-num">
                Market: ${currentPrice.toFixed(2)} • {currentTime.slice(5)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buy / Sell Tab Selector */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setTradeType('BUY'); setErrorMessage(null); }}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Buy {stock.symbol}
            </button>
            <button
              type="button"
              onClick={() => { setTradeType('SELL'); setErrorMessage(null); }}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                tradeType === 'SELL'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Sell {stock.symbol}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleExecuteTrade} className="p-6 pt-2 space-y-4">
          
          {/* Virtual Account Balance Pill */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            {tradeType === 'BUY' ? (
              <>
                <span className="text-slate-400 font-medium">Available Cash:</span>
                <span className="font-mono-num font-bold text-emerald-400">
                  ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400 font-medium">Owned Shares:</span>
                <span className="font-mono-num font-bold text-blue-400">
                  {ownedShares} shares (${(ownedShares * currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </>
            )}
          </div>

          {/* Shares Input */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <label htmlFor="shares">Number of Shares</label>
              <span className="text-slate-400">
                Max: {tradeType === 'BUY' ? maxBuyShares : maxSellShares}
              </span>
            </div>
            <div className="relative">
              <input
                id="shares"
                type="number"
                min="1"
                step="1"
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono-num text-lg font-bold focus:outline-none focus:border-blue-500 transition"
                placeholder="0"
                required
              />
              <button
                type="button"
                onClick={() => setSharesInput((tradeType === 'BUY' ? maxBuyShares : maxSellShares).toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Percentage Shortcut Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Cost / Proceeds Calculation */}
          <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Price per Share</span>
              <span className="font-mono-num text-slate-200">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Order Type</span>
              <span className="font-medium text-slate-200">Market Order (Virtual)</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-800/60 font-bold text-sm">
              <span className="text-white">
                {tradeType === 'BUY' ? 'Estimated Total Cost' : 'Estimated Proceeds'}
              </span>
              <span className={`font-mono-num text-base ${tradeType === 'BUY' ? 'text-emerald-400' : 'text-blue-400'}`}>
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Simulation Disclaimer */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Virtual Simulation. No real money or real assets are used.</span>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || sharesNumber <= 0}
            className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              tradeType === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
            }`}
          >
            {isSubmitting ? (
              <span>Executing Order...</span>
            ) : (
              <>
                <span>{tradeType === 'BUY' ? `Confirm Buy ${sharesNumber} Shares` : `Confirm Sell ${sharesNumber} Shares`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
