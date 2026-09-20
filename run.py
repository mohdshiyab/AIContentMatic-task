"""
Root runner for the Virtual Stock Trading Platform.
Starts the unified server (FastAPI API + React Frontend) on http://127.0.0.1:8000
"""

import os
import sys
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "market_data.db")

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

def main():
    # Ensure market data and SQLite database exist
    if not os.path.exists(DB_PATH):
        print("[*] Seeding market data and SQLite database...")
        from data.generate_market_data import generate_market_data
        generate_market_data()

    print("=" * 65)
    print("       QUANTUMTRADE - VIRTUAL STOCK TRADING PLATFORM")
    print("=" * 65)
    print("  * Unified Server running at: http://127.0.0.1:8000")
    print("  * API Documentation (Swagger): http://127.0.0.1:8000/docs")
    print("  * Predefined User: Demo Trader (Starting Capital: $100,000.00)")
    print("  * Mode: Paper Trading (No real-money transactions)")
    print("=" * 65)
    print("\nStarting Uvicorn server...\n")

    host = os.environ.get("HOST", "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
