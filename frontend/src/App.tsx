import React, { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Navbar } from './components/Navbar';
import { TimeTravelController } from './components/TimeTravelController';
import { MarketOverview } from './components/MarketOverview';
import { PortfolioView } from './components/PortfolioView';
import { TransactionHistory } from './components/TransactionHistory';
import { StockDetailModal } from './components/StockDetailModal';
import { TradeModal } from './components/TradeModal';
import { StockPriceItem } from './types';

export const TradingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'history'>('market');
  const [detailStock, setDetailStock] = useState<StockPriceItem | null>(null);
  const [tradeModalState, setTradeModalState] = useState<{
    isOpen: boolean;
    stock: StockPriceItem | null;
    type: 'BUY' | 'SELL';
  }>({
    isOpen: false,
    stock: null,
    type: 'BUY',
  });

  const handleOpenTrade = (stock: StockPriceItem, type: 'BUY' | 'SELL') => {
    setTradeModalState({
      isOpen: true,
      stock,
      type,
    });
  };

  const handleCloseTrade = () => {
    setTradeModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-[#E2E8F0] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTradeModal={() => {}}
      />

      {/* Market Time-Travel Playback Bar */}
      <TimeTravelController />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'market' && (
          <MarketOverview
            onSelectStock={(stock) => setDetailStock(stock)}
            onTradeStock={handleOpenTrade}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            onTradeStock={handleOpenTrade}
            onExploreMarket={() => setActiveTab('market')}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-[#0B0F19] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">QuantumTrade</span>
            <span>•</span>
            <span>Virtual Market Simulator (Paper Trading MVP)</span>
          </div>
          <div className="text-slate-400">
            Simulated 30-min market test data • No real money transactions
          </div>
        </div>
      </footer>

      {/* Stock Detail & Interactive Chart Modal */}
      {detailStock && (
        <StockDetailModal
          stock={detailStock}
          onClose={() => setDetailStock(null)}
          onTrade={(stock, type) => {
            setDetailStock(null);
            handleOpenTrade(stock, type);
          }}
        />
      )}

      {/* Buy / Sell Order Modal */}
      {tradeModalState.isOpen && tradeModalState.stock && (
        <TradeModal
          stock={tradeModalState.stock}
          initialType={tradeModalState.type}
          onClose={handleCloseTrade}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <TradingApp />
    </SimulationProvider>
  );
}
