"""
History router: retrieves past virtual trading transactions.
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from ..database import get_db_connection
from ..models import TransactionItem

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionItem])
def get_transactions(
    symbol: Optional[str] = Query(None, description="Filter by stock ticker"),
    trade_type: Optional[str] = Query(None, description="Filter by BUY or SELL")
):
    """Returns chronological trade history for the user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT t.id, t.symbol, s.name, t.type, t.shares, t.price, t.total_amount,
               t.realized_pnl, t.simulation_time, t.created_at
        FROM transactions t
        JOIN stocks s ON t.symbol = s.symbol
        WHERE t.user_id = 1
    """
    params = []

    if symbol:
        query += " AND t.symbol = ?"
        params.append(symbol.upper())

    if trade_type:
        query += " AND t.type = ?"
        params.append(trade_type.upper())

    query += " ORDER BY t.id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [
        TransactionItem(
            id=r["id"],
            symbol=r["symbol"],
            name=r["name"],
            type=r["type"],
            shares=r["shares"],
            price=round(r["price"], 2),
            total_amount=round(r["total_amount"], 2),
            realized_pnl=round(r["realized_pnl"] or 0.0, 2),
            simulation_time=r["simulation_time"],
            created_at=r["created_at"]
        )
        for r in rows
    ]
