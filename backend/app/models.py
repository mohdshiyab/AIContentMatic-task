"""
Pydantic data models for request validation and API responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class TradeRequest(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol (e.g. AAPL)")
    shares: int = Field(..., gt=0, description="Number of shares to trade (must be > 0)")
    simulation_time: str = Field(..., description="Selected simulation timestamp (YYYY-MM-DD HH:MM:SS)")

class StockPriceItem(BaseModel):
    symbol: str
    name: str
    sector: str
    description: Optional[str] = None
    timestamp: str
    price: float
    open: float
    high: float
    low: float
    close: float
    volume: int
    day_open: float
    day_change: float
    day_change_percent: float
    interval_change: float
    interval_change_percent: float

class CandleStickItem(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class HoldingItem(BaseModel):
    symbol: str
    name: str
    shares: int
    avg_buy_price: float
    total_cost: float
    current_price: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    portfolio_percent: float

class PortfolioSummary(BaseModel):
    cash_balance: float
    invested_value: float
    total_portfolio_value: float
    total_unrealized_pnl: float
    total_unrealized_pnl_percent: float
    total_realized_pnl: float
    total_pnl: float
    initial_balance: float
    holdings: List[HoldingItem]
    timestamp: str

class TransactionItem(BaseModel):
    id: int
    symbol: str
    name: str
    type: str
    shares: int
    price: float
    total_amount: float
    realized_pnl: float
    simulation_time: str
    created_at: str

class TimestampsResponse(BaseModel):
    timestamps: List[str]
    days: List[str]
    default_timestamp: str
    start_timestamp: str
    end_timestamp: str

class MessageResponse(BaseModel):
    success: bool
    message: str
