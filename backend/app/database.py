"""
Database access and helper utilities for SQLite.
"""

import os
import sqlite3
from typing import Generator

# Database path in data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "data", "market_data.db")

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with Row row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def reset_user_simulation():
    """Resets user account to $100,000 and clears all holdings and transactions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM portfolio_positions")
    cursor.execute("UPDATE user_account SET cash_balance = initial_balance WHERE id = 1")
    conn.commit()
    conn.close()
