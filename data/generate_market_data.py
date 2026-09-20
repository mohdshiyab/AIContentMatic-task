"""
Market Data Generator
Generates realistic 30-minute interval OHLCV CSV test data for 10 stocks
covering 15 trading days (August 31, 2026 to September 18, 2026).
Also seeds the SQLite database.
"""

import os
import csv
import math
import random
import sqlite3
from datetime import datetime, time, timedelta

# Project directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_DIR = os.path.join(BASE_DIR, "csv")
DB_PATH = os.path.join(BASE_DIR, "market_data.db")

# 10 Representative Stocks
STOCKS = [
    {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "sector": "Technology",
        "base_price": 224.50,
        "volatility": 0.012,
        "description": "Designs, manufactures, and markets smartphones, personal computers, tablets, and accessories."
    },
    {
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "sector": "Technology",
        "base_price": 448.20,
        "volatility": 0.011,
        "description": "Develops and supports software, services, devices, and cloud computing solutions worldwide."
    },
    {
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "sector": "Semiconductors",
        "base_price": 126.80,
        "volatility": 0.022,
        "description": "Pioneered accelerated computing to tackle challenges in AI, data science, and gaming graphics."
    },
    {
        "symbol": "GOOGL",
        "name": "Alphabet Inc.",
        "sector": "Technology",
        "base_price": 179.30,
        "volatility": 0.013,
        "description": "Provider of search, advertising, cloud, enterprise software, and mobile operating systems."
    },
    {
        "symbol": "AMZN",
        "name": "Amazon.com, Inc.",
        "sector": "Consumer Discretionary",
        "base_price": 185.75,
        "volatility": 0.015,
        "description": "Focuses on retail, e-commerce, cloud computing (AWS), online advertising, and digital streaming."
    },
    {
        "symbol": "META",
        "name": "Meta Platforms, Inc.",
        "sector": "Technology",
        "base_price": 512.40,
        "volatility": 0.018,
        "description": "Builds technologies that help people connect, find communities, and grow businesses."
    },
    {
        "symbol": "TSLA",
        "name": "Tesla, Inc.",
        "sector": "Automotive / Clean Energy",
        "base_price": 238.90,
        "volatility": 0.025,
        "description": "Designs, develops, manufactures, sells, and leases electric vehicles and energy storage products."
    },
    {
        "symbol": "JPM",
        "name": "JPMorgan Chase & Co.",
        "sector": "Financial Services",
        "base_price": 214.60,
        "volatility": 0.010,
        "description": "Financial holding company providing investment banking, asset management, and commercial banking."
    },
    {
        "symbol": "V",
        "name": "Visa Inc.",
        "sector": "Financial Services",
        "base_price": 284.10,
        "volatility": 0.009,
        "description": "Operates the world's largest retail electronic payments network connecting consumers and merchants."
    },
    {
        "symbol": "WMT",
        "name": "Walmart Inc.",
        "sector": "Consumer Staples",
        "base_price": 76.20,
        "volatility": 0.008,
        "description": "Operates a chain of hypermarkets, discount department stores, and grocery retail locations."
    },
]

# 15 Trading Days (August 31, 2026 - September 18, 2026, Monday to Friday)
TRADING_DAYS = [
    # Week 1
    "2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
    # Week 2
    "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
    # Week 3
    "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
]

# 30-Minute Intervals from 09:30 to 16:00
TIMES_OF_DAY = [
    "09:30:00", "10:00:00", "10:30:00", "11:00:00",
    "11:30:00", "12:00:00", "12:30:00", "13:00:00",
    "13:30:00", "14:00:00", "14:30:00", "15:00:00",
    "15:30:00", "16:00:00"
]

def generate_market_data():
    """Generates realistic OHLCV market data for 10 stocks and saves to CSV files and SQLite."""
    os.makedirs(CSV_DIR, exist_ok=True)
    random.seed(42)  # Deterministic seed for reproducible realistic market data

    all_records = []
    stock_files = {}

    for stock in STOCKS:
        stock_files[stock["symbol"]] = []
        current_price = stock["base_price"]
        volatility = stock["volatility"]

        for day in TRADING_DAYS:
            # Daily overnight jump (slight gap up/down)
            overnight_return = random.gauss(0.0005, volatility * 0.8)
            current_price = max(1.0, current_price * (1 + overnight_return))

            for time_str in TIMES_OF_DAY:
                timestamp = f"{day} {time_str}"
                
                # Intraday 30-min price movement
                step_return = random.gauss(0.0002, volatility * 0.5)
                open_p = current_price
                close_p = max(1.0, round(open_p * (1 + step_return), 2))
                
                # High and Low within interval
                wick_up = abs(random.gauss(0, volatility * 0.35))
                wick_down = abs(random.gauss(0, volatility * 0.35))
                
                high_p = round(max(open_p, close_p) * (1 + wick_up), 2)
                low_p = round(min(open_p, close_p) * (1 - wick_down), 2)
                
                # Ensure High is strictly >= max and Low <= min
                high_p = max(high_p, open_p, close_p)
                low_p = min(low_p, open_p, close_p)
                
                # Volume: higher volume near market open (09:30) and market close (16:00)
                if time_str in ("09:30:00", "16:00:00"):
                    base_vol = random.randint(450000, 1800000)
                elif time_str in ("10:00:00", "15:30:00"):
                    base_vol = random.randint(250000, 950000)
                else:
                    base_vol = random.randint(80000, 450000)

                record = {
                    "timestamp": timestamp,
                    "symbol": stock["symbol"],
                    "open": f"{open_p:.2f}",
                    "high": f"{high_p:.2f}",
                    "low": f"{low_p:.2f}",
                    "close": f"{close_p:.2f}",
                    "volume": base_vol
                }
                
                all_records.append(record)
                stock_files[stock["symbol"]].append(record)
                
                # Update current price for next interval
                current_price = close_p

    # 1. Write individual CSV files per stock
    fieldnames = ["timestamp", "symbol", "open", "high", "low", "close", "volume"]
    for symbol, records in stock_files.items():
        csv_path = os.path.join(CSV_DIR, f"{symbol}.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        print(f"Generated {csv_path} ({len(records)} rows)")

    # 2. Write consolidated CSV file
    consolidated_path = os.path.join(CSV_DIR, "all_stocks_market_data.csv")
    with open(consolidated_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_records)
    print(f"Generated {consolidated_path} ({len(all_records)} rows)")

    # 3. Initialize SQLite Database and load CSV records
    init_and_seed_sqlite(all_records)

def init_and_seed_sqlite(records):
    """Creates SQLite tables and seeds stock info and market price records."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop existing tables to allow clean re-runs
    cursor.execute("DROP TABLE IF EXISTS transactions")
    cursor.execute("DROP TABLE IF EXISTS portfolio_positions")
    cursor.execute("DROP TABLE IF EXISTS user_account")
    cursor.execute("DROP TABLE IF EXISTS stock_prices")
    cursor.execute("DROP TABLE IF EXISTS stocks")

    # Table: stocks
    cursor.execute("""
        CREATE TABLE stocks (
            symbol TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sector TEXT NOT NULL,
            description TEXT,
            base_price REAL NOT NULL
        )
    """)

    # Table: stock_prices (30-minute interval OHLCV)
    cursor.execute("""
        CREATE TABLE stock_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            symbol TEXT NOT NULL,
            open REAL NOT NULL,
            high REAL NOT NULL,
            low REAL NOT NULL,
            close REAL NOT NULL,
            volume INTEGER NOT NULL,
            FOREIGN KEY(symbol) REFERENCES stocks(symbol)
        )
    """)
    cursor.execute("CREATE INDEX idx_prices_sym_time ON stock_prices(symbol, timestamp)")
    cursor.execute("CREATE INDEX idx_prices_time ON stock_prices(timestamp)")

    # Table: user_account (predefined single user, virtual money)
    cursor.execute("""
        CREATE TABLE user_account (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            cash_balance REAL NOT NULL,
            initial_balance REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Table: portfolio_positions
    cursor.execute("""
        CREATE TABLE portfolio_positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            shares INTEGER NOT NULL,
            avg_buy_price REAL NOT NULL,
            total_cost REAL NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user_account(id),
            FOREIGN KEY(symbol) REFERENCES stocks(symbol),
            UNIQUE(user_id, symbol)
        )
    """)

    # Table: transactions
    cursor.execute("""
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            type TEXT NOT NULL,          -- 'BUY' or 'SELL'
            shares INTEGER NOT NULL,
            price REAL NOT NULL,
            total_amount REAL NOT NULL,
            realized_pnl REAL DEFAULT 0.0,
            simulation_time TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES user_account(id)
        )
    """)

    # Seed Stocks Table
    for s in STOCKS:
        cursor.execute(
            "INSERT INTO stocks (symbol, name, sector, description, base_price) VALUES (?, ?, ?, ?, ?)",
            (s["symbol"], s["name"], s["sector"], s["description"], s["base_price"])
        )

    # Seed Stock Prices Table from generated records
    price_tuples = [
        (r["timestamp"], r["symbol"], float(r["open"]), float(r["high"]), float(r["low"]), float(r["close"]), int(r["volume"]))
        for r in records
    ]
    cursor.executemany(
        "INSERT INTO stock_prices (timestamp, symbol, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?)",
        price_tuples
    )

    # Seed Predefined User Account with $100,000 virtual balance
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO user_account (id, username, cash_balance, initial_balance, created_at) VALUES (?, ?, ?, ?, ?)",
        (1, "Demo Trader", 100000.00, 100000.00, now_str)
    )

    conn.commit()
    conn.close()
    print(f"Successfully seeded SQLite database at {DB_PATH}")

if __name__ == "__main__":
    generate_market_data()
