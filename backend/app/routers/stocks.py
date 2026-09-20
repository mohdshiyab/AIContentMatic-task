"""
Stocks router: provides stock listings, quotes at selected simulation times, and historical candle bars.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..database import get_db_connection
from ..models import StockPriceItem, CandleStickItem

router = APIRouter(prefix="/api/stocks", tags=["Stocks"])

@router.get("", response_model=List[StockPriceItem])
def get_stocks(at_time: Optional[str] = Query(None, description="Simulation timestamp (YYYY-MM-DD HH:MM:SS)")):
    """Returns quotes and statistics for all 10 stocks at the specified simulation time."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Determine effective simulation time
    if not at_time:
        cursor.execute("SELECT MAX(timestamp) as max_time FROM stock_prices")
        row = cursor.fetchone()
        at_time = row["max_time"] if row and row["max_time"] else "2026-08-31 09:30:00"

    # Extract date portion for day-open calculation
    date_part = at_time.split(" ")[0] if " " in at_time else at_time

    # Fetch all registered stocks
    cursor.execute("SELECT symbol, name, sector, description FROM stocks ORDER BY symbol ASC")
    stocks = cursor.fetchall()

    results = []
    for s in stocks:
        sym = s["symbol"]
        
        # Get the latest price record for this stock at or before at_time
        cursor.execute("""
            SELECT timestamp, open, high, low, close, volume
            FROM stock_prices
            WHERE symbol = ? AND timestamp <= ?
            ORDER BY timestamp DESC
            LIMIT 1
        """, (sym, at_time))
        current_record = cursor.fetchone()

        if not current_record:
            # Fallback to earliest record if simulation time is before data start
            cursor.execute("""
                SELECT timestamp, open, high, low, close, volume
                FROM stock_prices
                WHERE symbol = ?
                ORDER BY timestamp ASC
                LIMIT 1
            """, (sym,))
            current_record = cursor.fetchone()

        if not current_record:
            continue

        current_price = current_record["close"]
        rec_time = current_record["timestamp"]
        rec_date = rec_time.split(" ")[0]

        # Day Open: first record of the same day as rec_time
        cursor.execute("""
            SELECT open
            FROM stock_prices
            WHERE symbol = ? AND timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC
            LIMIT 1
        """, (sym, f"{rec_date} 00:00:00", rec_time))
        day_open_rec = cursor.fetchone()
        day_open = day_open_rec["open"] if day_open_rec else current_record["open"]

        # Interval Open: previous interval close (to show 30m change)
        cursor.execute("""
            SELECT close
            FROM stock_prices
            WHERE symbol = ? AND timestamp < ?
            ORDER BY timestamp DESC
            LIMIT 1
        """, (sym, rec_time))
        prev_rec = cursor.fetchone()
        prev_price = prev_rec["close"] if prev_rec else current_record["open"]

        # Calculations
        day_change = round(current_price - day_open, 2)
        day_change_percent = round((day_change / day_open) * 100, 2) if day_open > 0 else 0.0

        interval_change = round(current_price - prev_price, 2)
        interval_change_percent = round((interval_change / prev_price) * 100, 2) if prev_price > 0 else 0.0

        results.append(StockPriceItem(
            symbol=sym,
            name=s["name"],
            sector=s["sector"],
            description=s["description"],
            timestamp=rec_time,
            price=current_price,
            open=current_record["open"],
            high=current_record["high"],
            low=current_record["low"],
            close=current_record["close"],
            volume=current_record["volume"],
            day_open=round(day_open, 2),
            day_change=day_change,
            day_change_percent=day_change_percent,
            interval_change=interval_change,
            interval_change_percent=interval_change_percent,
        ))

    conn.close()
    return results

@router.get("/{symbol}", response_model=StockPriceItem)
def get_stock(symbol: str, at_time: Optional[str] = Query(None)):
    """Returns single stock detail and quote at selected simulation time."""
    stocks = get_stocks(at_time=at_time)
    for s in stocks:
        if s.symbol.upper() == symbol.upper():
            return s
    raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")

@router.get("/{symbol}/history", response_model=List[CandleStickItem])
def get_stock_history(
    symbol: str,
    to_time: Optional[str] = Query(None, description="Upper bound timestamp (prevents looking into future)")
):
    """Returns historical OHLCV candles up to the selected simulation timestamp."""
    conn = get_db_connection()
    cursor = conn.cursor()

    symbol = symbol.upper()
    if to_time:
        cursor.execute("""
            SELECT timestamp, open, high, low, close, volume
            FROM stock_prices
            WHERE symbol = ? AND timestamp <= ?
            ORDER BY timestamp ASC
        """, (symbol, to_time))
    else:
        cursor.execute("""
            SELECT timestamp, open, high, low, close, volume
            FROM stock_prices
            WHERE symbol = ?
            ORDER BY timestamp ASC
        """, (symbol,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail=f"No price history found for symbol {symbol}")

    return [
        CandleStickItem(
            timestamp=r["timestamp"],
            open=r["open"],
            high=r["high"],
            low=r["low"],
            close=r["close"],
            volume=r["volume"]
        )
        for r in rows
    ]
