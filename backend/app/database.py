"""
Database access and helper utilities for SQLite.
"""

import os
import shutil
import sqlite3
from typing import Generator

# Database path in data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_DB_PATH = os.path.join(BASE_DIR, "data", "market_data.db")

def get_effective_db_path() -> str:
    """Returns DB path, copying to /tmp in serverless (e.g. Vercel) read-only environments."""
    if os.environ.get("VERCEL") or not os.access(os.path.dirname(SOURCE_DB_PATH), os.W_OK):
        tmp_dir = "/tmp"
        tmp_db = os.path.join(tmp_dir, "market_data.db")
        if not os.path.exists(tmp_db):
            if os.path.exists(SOURCE_DB_PATH):
                shutil.copyfile(SOURCE_DB_PATH, tmp_db)
            else:
                from data.generate_market_data import generate_market_data
                generate_market_data()
                if os.path.exists(SOURCE_DB_PATH):
                    shutil.copyfile(SOURCE_DB_PATH, tmp_db)
        return tmp_db
    return SOURCE_DB_PATH

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with Row row_factory for dict-like access."""
    db_path = get_effective_db_path()
    conn = sqlite3.connect(db_path)
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
