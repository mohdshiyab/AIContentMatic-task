"""
Portfolio router: handles holdings, cash balance, and dynamic P&L calculations.
"""

from typing import Optional
from fastapi import APIRouter, Query
from ..database import get_db_connection
from ..models import PortfolioSummary, HoldingItem

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("", response_model=PortfolioSummary)
def get_portfolio(at_time: Optional[str] = Query(None, description="Simulation timestamp for valuation")):
    """Calculates user portfolio holdings, values, and P&L at the given simulation time."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Determine simulation time
    if not at_time:
        cursor.execute("SELECT MAX(timestamp) as max_time FROM stock_prices")
        row = cursor.fetchone()
        at_time = row["max_time"] if row and row["max_time"] else "2026-08-31 09:30:00"

    # User account data
    cursor.execute("SELECT id, username, cash_balance, initial_balance FROM user_account WHERE id = 1")
    user = cursor.fetchone()
    if not user:
        cash_balance = 100000.0
        initial_balance = 100000.0
    else:
        cash_balance = round(user["cash_balance"], 2)
        initial_balance = round(user["initial_balance"], 2)

    # Realized P&L from transactions executed on or before this simulation time
    cursor.execute("""
        SELECT SUM(realized_pnl) as total_realized
        FROM transactions
        WHERE user_id = 1 AND simulation_time <= ?
    """, (at_time,))
    realized_row = cursor.fetchone()
    total_realized_pnl = round(realized_row["total_realized"] or 0.0, 2)

    # Fetch active positions
    cursor.execute("""
        SELECT p.symbol, s.name, p.shares, p.avg_buy_price, p.total_cost
        FROM portfolio_positions p
        JOIN stocks s ON p.symbol = s.symbol
        WHERE p.user_id = 1 AND p.shares > 0
    """)
    positions = cursor.fetchall()

    holdings = []
    invested_value = 0.0
    current_equity_value = 0.0
    total_unrealized_pnl = 0.0

    for pos in positions:
        sym = pos["symbol"]
        shares = pos["shares"]
        avg_buy_price = round(pos["avg_buy_price"], 2)
        total_cost = round(pos["total_cost"], 2)
        invested_value += total_cost

        # Get current price of the stock at or before at_time
        cursor.execute("""
            SELECT close
            FROM stock_prices
            WHERE symbol = ? AND timestamp <= ?
            ORDER BY timestamp DESC
            LIMIT 1
        """, (sym, at_time))
        price_row = cursor.fetchone()
        current_price = price_row["close"] if price_row else avg_buy_price

        current_value = round(shares * current_price, 2)
        current_equity_value += current_value

        unrealized_pnl = round(current_value - total_cost, 2)
        unrealized_pnl_percent = round((unrealized_pnl / total_cost) * 100, 2) if total_cost > 0 else 0.0
        total_unrealized_pnl += unrealized_pnl

        holdings.append({
            "symbol": sym,
            "name": pos["name"],
            "shares": shares,
            "avg_buy_price": avg_buy_price,
            "total_cost": total_cost,
            "current_price": round(current_price, 2),
            "current_value": current_value,
            "unrealized_pnl": unrealized_pnl,
            "unrealized_pnl_percent": unrealized_pnl_percent,
            "portfolio_percent": 0.0 # Will calculate once total is known
        })

    total_portfolio_value = round(cash_balance + current_equity_value, 2)
    
    # Calculate percentage allocation for each holding
    holding_items = []
    for h in holdings:
        pct = round((h["current_value"] / total_portfolio_value) * 100, 2) if total_portfolio_value > 0 else 0.0
        h["portfolio_percent"] = pct
        holding_items.append(HoldingItem(**h))

    total_unrealized_pnl = round(total_unrealized_pnl, 2)
    total_unrealized_pnl_percent = round((total_unrealized_pnl / invested_value) * 100, 2) if invested_value > 0 else 0.0
    total_pnl = round(total_realized_pnl + total_unrealized_pnl, 2)

    conn.close()

    return PortfolioSummary(
        cash_balance=cash_balance,
        invested_value=round(invested_value, 2),
        total_portfolio_value=total_portfolio_value,
        total_unrealized_pnl=total_unrealized_pnl,
        total_unrealized_pnl_percent=total_unrealized_pnl_percent,
        total_realized_pnl=total_realized_pnl,
        total_pnl=total_pnl,
        initial_balance=initial_balance,
        holdings=holding_items,
        timestamp=at_time
    )
