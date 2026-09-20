import { 
  StockPriceItem, 
  CandleStickItem, 
  PortfolioSummary, 
  TransactionItem, 
  TimestampsResponse 
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errObj = await res.json();
      if (errObj && errObj.detail) {
        errorMsg = errObj.detail;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getTimestamps: (): Promise<TimestampsResponse> => {
    return fetchJson<TimestampsResponse>(`${API_BASE}/simulation/timestamps`);
  },

  getStocks: (atTime?: string): Promise<StockPriceItem[]> => {
    const query = atTime ? `?at_time=${encodeURIComponent(atTime)}` : '';
    return fetchJson<StockPriceItem[]>(`${API_BASE}/stocks${query}`);
  },

  getStockHistory: (symbol: string, toTime?: string): Promise<CandleStickItem[]> => {
    const query = toTime ? `?to_time=${encodeURIComponent(toTime)}` : '';
    return fetchJson<CandleStickItem[]>(`${API_BASE}/stocks/${symbol}/history${query}`);
  },

  getPortfolio: (atTime?: string): Promise<PortfolioSummary> => {
    const query = atTime ? `?at_time=${encodeURIComponent(atTime)}` : '';
    return fetchJson<PortfolioSummary>(`${API_BASE}/portfolio${query}`);
  },

  buyStock: (symbol: string, shares: number, simulationTime: string) => {
    return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/trade/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, shares, simulation_time: simulationTime }),
    });
  },

  sellStock: (symbol: string, shares: number, simulationTime: string) => {
    return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/trade/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, shares, simulation_time: simulationTime }),
    });
  },

  getTransactions: (symbol?: string, tradeType?: string): Promise<TransactionItem[]> => {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol);
    if (tradeType) params.append('trade_type', tradeType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<TransactionItem[]>(`${API_BASE}/transactions${qs}`);
  },

  resetSimulation: () => {
    return fetchJson<{ success: boolean; message: string }>(`${API_BASE}/simulation/reset`, {
      method: 'POST',
    });
  },
};
