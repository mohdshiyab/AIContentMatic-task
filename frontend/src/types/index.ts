export interface StockPriceItem {
  symbol: string;
  name: string;
  sector: string;
  description?: string;
  timestamp: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  day_open: number;
  day_change: number;
  day_change_percent: number;
  interval_change: number;
  interval_change_percent: number;
}

export interface CandleStickItem {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HoldingItem {
  symbol: string;
  name: string;
  shares: number;
  avg_buy_price: number;
  total_cost: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  portfolio_percent: number;
}

export interface PortfolioSummary {
  cash_balance: number;
  invested_value: number;
  total_portfolio_value: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percent: number;
  total_realized_pnl: number;
  total_pnl: number;
  initial_balance: number;
  holdings: HoldingItem[];
  timestamp: string;
}

export interface TransactionItem {
  id: number;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_amount: number;
  realized_pnl: number;
  simulation_time: string;
  created_at: string;
}

export interface TimestampsResponse {
  timestamps: string[];
  days: string[];
  default_timestamp: string;
  start_timestamp: string;
  end_timestamp: string;
}
