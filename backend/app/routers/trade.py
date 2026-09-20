"""
Trade router: executes Buy and Sell orders with virtual funds at the selected simulation timestamp.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from ..database import get_db_connection
from ..models import TradeRequest, MessageResponse

router = APIRouter(prefix="/api/trade", tags=["Trade"])

@router.post("/buy", response_model=MessageResponse)
def buy_stock(req: TradeRequest):
    """Executes a virtual buy order at the current simulation timestamp."""
    sym = req.symbol.upper()
    shares = req.shares
    sim_time = req.simulation_time

    if shares <= 0:
        raise HTTPException(status_code=400, detail="Number of shares must be greater than 0")

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch stock price at the selected simulation time
    cursor.execute("""
        SELECT close FROM stock_prices
        WHERE symbol = ? AND timestamp <= ?
        ORDER BY timestamp DESC
        LIMIT 1
    """, (sym, sim_time))
    price_row = cursor.fetchone()

    if not price_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Market price unavailable for {sym} at {sim_time}")

    price = price_row["close"]
    total_cost = round(shares * price, 2)

    # 2. Check user's available virtual cash balance
    cursor.execute("SELECT cash_balance FROM user_account WHERE id = 1")
    user = cursor.fetchone()
    if not user or user["cash_balance"] < total_cost:
        conn.close()
        available = user["cash_balance"] if user else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient virtual funds. Total cost: ${total_cost:,.2f}, Available cash: ${available:,.2f}"
        )

    new_cash = round(user["cash_balance"] - total_cost, 2)

    # 3. Update or Insert portfolio position
    cursor.execute("SELECT shares, avg_buy_price, total_cost FROM portfolio_positions WHERE user_id = 1 AND symbol = ?", (sym,))
    existing_pos = cursor.fetchone()

    if existing_pos:
        existing_shares = existing_pos["shares"]
        existing_total_cost = existing_pos["total_cost"]
        new_shares = existing_shares + shares
        new_total_cost = round(existing_total_cost + total_cost, 2)
        new_avg_price = round(new_total_cost / new_shares, 2)

        cursor.execute("""
            UPDATE portfolio_positions
            SET shares = ?, avg_buy_price = ?, total_cost = ?
            WHERE user_id = 1 AND symbol = ?
        """, (new_shares, new_avg_price, new_total_cost, sym))
    else:
        cursor.execute("""
            INSERT INTO portfolio_positions (user_id, symbol, shares, avg_buy_price, total_cost)
            VALUES (1, ?, ?, ?, ?)
        """, (sym, shares, price, total_cost))

    # 4. Update user cash balance
    cursor.execute("UPDATE user_account SET cash_balance = ? WHERE id = 1", (new_cash,))

    # 5. Insert transaction record
    now_real = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO transactions (user_id, symbol, type, shares, price, total_amount, realized_pnl, simulation_time, created_at)
        VALUES (1, ?, 'BUY', ?, ?, ?, 0.0, ?, ?)
    """, (sym, shares, price, total_cost, sim_time, now_real))

    conn.commit()
    conn.close()

    return MessageResponse(
        success=True,
        message=f"Successfully purchased {shares} shares of {sym} at ${price:.2f} (Total: ${total_cost:,.2f})"
    )

@router.post("/sell", response_model=MessageResponse)
def sell_stock(req: TradeRequest):
    """Executes a virtual sell order at the current simulation timestamp."""
    sym = req.symbol.upper()
    shares = req.shares
    sim_time = req.simulation_time

    if shares <= 0:
        raise HTTPException(status_code=400, detail="Number of shares must be greater than 0")

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch current position to verify user owns enough shares
    cursor.execute("SELECT shares, avg_buy_price, total_cost FROM portfolio_positions WHERE user_id = 1 AND symbol = ?", (sym,))
    existing_pos = cursor.fetchone()

    if not existing_pos or existing_pos["shares"] < shares:
        conn.close()
        owned = existing_pos["shares"] if existing_pos else 0
        raise HTTPException(
            status_code=400,
            detail=f"Cannot sell {shares} shares of {sym}. You currently hold {owned} shares."
        )

    # 2. Fetch market price at the simulation timestamp
    cursor.execute("""
        SELECT close FROM stock_prices
        WHERE symbol = ? AND timestamp <= ?
        ORDER BY timestamp DESC
        LIMIT 1
    """, (sym, sim_time))
    price_row = cursor.fetchone()

    if not price_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Market price unavailable for {sym} at {sim_time}")

    price = price_row["close"]
    total_proceeds = round(shares * price, 2)
    avg_buy_price = existing_pos["avg_buy_price"]

    # 3. Calculate realized P&L on this sale
    cost_basis = round(shares * avg_buy_price, 2)
    realized_pnl = round(total_proceeds - cost_basis, 2)

    # 4. Update portfolio positions
    remaining_shares = existing_pos["shares"] - shares
    if remaining_shares == 0:
        cursor.execute("DELETE FROM portfolio_positions WHERE user_id = 1 AND symbol = ?", (sym,))
    else:
        new_total_cost = round(remaining_shares * avg_buy_price, 2)
        cursor.execute("""
            UPDATE portfolio_positions
            SET shares = ?, total_cost = ?
            WHERE user_id = 1 AND symbol = ?
        """, (remaining_shares, new_total_cost, sym))

    # 5. Credit user's cash balance
    cursor.execute("SELECT cash_balance FROM user_account WHERE id = 1")
    user = cursor.fetchone()
    current_cash = user["cash_balance"] if user else 0.0
    new_cash = round(current_cash + total_proceeds, 2)
    cursor.execute("UPDATE user_account SET cash_balance = ? WHERE id = 1", (new_cash,))

    # 6. Record transaction
    now_real = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO transactions (user_id, symbol, type, shares, price, total_amount, realized_pnl, simulation_time, created_at)
        VALUES (1, ?, 'SELL', ?, ?, ?, ?, ?, ?)
    """, (sym, shares, price, total_proceeds, realized_pnl, sim_time, now_real))

    conn.commit()
    conn.close()

    pnl_str = f"+${realized_pnl:,.2f}" if realized_pnl >= 0 else f"-${abs(realized_pnl):,.2f}"
    return MessageResponse(
        success=True,
        message=f"Successfully sold {shares} shares of {sym} at ${price:.2f} (Proceeds: ${total_proceeds:,.2f}, Realized P&L: {pnl_str})"
    )
