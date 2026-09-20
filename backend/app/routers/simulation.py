"""
Simulation router: handles simulation clock intervals, timestamps, and account reset.
"""

from fastapi import APIRouter
from ..database import get_db_connection, reset_user_simulation
from ..models import TimestampsResponse, MessageResponse

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.get("/timestamps", response_model=TimestampsResponse)
def get_simulation_timestamps():
    """Returns all available 30-minute intervals and trading dates from the loaded CSV data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT timestamp
        FROM stock_prices
        ORDER BY timestamp ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    timestamps = [r["timestamp"] for r in rows]
    days = sorted(list(set(t.split(" ")[0] for t in timestamps)))

    # Default to first timestamp or a convenient midway point
    default_timestamp = timestamps[0] if timestamps else "2026-08-31 09:30:00"
    start_timestamp = timestamps[0] if timestamps else "2026-08-31 09:30:00"
    end_timestamp = timestamps[-1] if timestamps else "2026-09-18 16:00:00"

    return TimestampsResponse(
        timestamps=timestamps,
        days=days,
        default_timestamp=default_timestamp,
        start_timestamp=start_timestamp,
        end_timestamp=end_timestamp
    )

@router.post("/reset", response_model=MessageResponse)
def reset_simulation():
    """Resets the virtual account to initial $100,000 balance and wipes all trades and holdings."""
    reset_user_simulation()
    return MessageResponse(
        success=True,
        message="Simulation account has been reset. Virtual balance is restored to $100,000.00."
    )
