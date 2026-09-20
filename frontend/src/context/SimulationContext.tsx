import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { StockPriceItem, PortfolioSummary, TimestampsResponse } from '../types';

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SimulationContextType {
  timestamps: string[];
  days: string[];
  currentIndex: number;
  currentTime: string;
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 5x, 10x
  stocks: StockPriceItem[];
  portfolio: PortfolioSummary | null;
  isLoading: boolean;
  toasts: ToastInfo[];
  setTimeIndex: (index: number) => void;
  setTime: (timestamp: string) => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpDay: (delta: number) => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
  refreshMarketAndPortfolio: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetAccount: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [stocks, setStocks] = useState<StockPriceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const timerRef = useRef<any>(null);
  const toastIdRef = useRef<number>(1);

  const currentTime = timestamps[currentIndex] || '';

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch initial timestamps
  useEffect(() => {
    async function initSimulation() {
      try {
        const data: TimestampsResponse = await api.getTimestamps();
        setTimestamps(data.timestamps);
        setDays(data.days);
        // Start around day 3 or first day
        const startIndex = 0;
        setCurrentIndex(startIndex);
      } catch (err: any) {
        showToast(`Failed to load simulation timestamps: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
    initSimulation();
  }, [showToast]);

  // Load stocks and portfolio whenever currentTime changes
  const refreshMarketAndPortfolio = useCallback(async () => {
    if (!currentTime) return;
    try {
      const [stocksData, portfolioData] = await Promise.all([
        api.getStocks(currentTime),
        api.getPortfolio(currentTime),
      ]);
      setStocks(stocksData);
      setPortfolio(portfolioData);
    } catch (err: any) {
      console.error('Data refresh error:', err);
    }
  }, [currentTime]);

  useEffect(() => {
    if (currentTime) {
      refreshMarketAndPortfolio();
    }
  }, [currentTime, refreshMarketAndPortfolio]);

  // Playback timer handling
  useEffect(() => {
    if (isPlaying) {
      // Calculate delay based on playback speed (1x = 2000ms, 2x = 1000ms, 5x = 400ms, 10x = 200ms)
      const delay = Math.max(150, Math.floor(2000 / playbackSpeed));

      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timestamps.length - 1) {
            setIsPlaying(false);
            showToast('Reached the end of market test data.', 'info');
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, timestamps.length, showToast]);

  const setTimeIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(timestamps.length - 1, index));
    setCurrentIndex(clamped);
  };

  const setTime = (timestamp: string) => {
    const idx = timestamps.indexOf(timestamp);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  const stepForward = () => {
    if (currentIndex < timestamps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const jumpDay = (delta: number) => {
    // 14 intervals per day
    const target = currentIndex + delta * 14;
    setTimeIndex(target);
  };

  const togglePlay = () => {
    if (!isPlaying && currentIndex >= timestamps.length - 1) {
      // Loop back to start if at end
      setCurrentIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const resetAccount = async () => {
    try {
      const res = await api.resetSimulation();
      showToast(res.message, 'success');
      await refreshMarketAndPortfolio();
    } catch (err: any) {
      showToast(`Failed to reset account: ${err.message}`, 'error');
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        timestamps,
        days,
        currentIndex,
        currentTime,
        isPlaying,
        playbackSpeed,
        stocks,
        portfolio,
        isLoading,
        toasts,
        setTimeIndex,
        setTime,
        stepForward,
        stepBackward,
        jumpDay,
        togglePlay,
        setPlaybackSpeed,
        refreshMarketAndPortfolio,
        showToast,
        resetAccount,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 text-sm font-medium transition-all transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
