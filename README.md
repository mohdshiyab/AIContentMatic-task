# QuantumTrade — Virtual Stock Trading Platform

A modern, high-performance **Virtual Stock Trading Platform** designed for paper trading, market simulation, and portfolio management. Users can explore 10 major stocks, navigate through historical test market data using an interactive **Date & Time Controller**, execute virtual Buy and Sell orders, manage portfolio holdings, track realized & unrealized P&L in real-time, and review complete transaction audit logs.

> **Note**: This is a virtual simulation platform. There are **no real-money transactions** and no real assets involved.

---

## Key Features

- **10 Representative Stocks Watchlist**: AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA, JPM, V, WMT across Technology, Semiconductors, Financial Services, Consumer Discretionary, and Consumer Staples sectors.
- **CSV-Based Market Data & Time Travel**:
  - Test market data covering **15 trading days** at **30-minute intervals** (09:30 AM to 04:00 PM EST, 210 intervals per stock, 2,100 total OHLCV records).
  - **Time Travel & Playback Controller**:
    - Scrub through time with a timeline slider.
    - Select any specific date and 30-minute interval from a dropdown picker.
    - Step forward/backward by 30 minutes (`+30m`, `-30m`) or by 1 full day (`+1D`, `-1D`).
    - **Auto-Play Simulation Mode**: Click "Play" to watch market prices update across the platform with selectable speeds (`1x`, `2x`, `5x`, `10x`).
- **Interactive Stock Detail & Charting**:
  - Historical Price Area chart rendered dynamically up to the currently selected simulation time (preventing future peek).
  - Key statistics: Day Open, Interval High, Interval Low, Interval Volume.
  - Sector tags and company profiles.
- **Virtual Paper Trading (Buy / Sell Orders)**:
  - Starting virtual cash capital: **\$100,000.00 USD**.
  - Orders executed at the **exact selected simulation timestamp's market price**.
  - Real-time cost/proceeds calculation, instant max-affordable shares calculator, and 25%/50%/75%/100% quick presets.
  - Safeguards against overdrafting cash balance or selling more shares than owned.
- **Portfolio Management & Real-Time P&L Tracking**:
  - Dynamic valuation of all holdings based on current simulation timestamp prices.
  - Tracks **Unrealized P&L** (\$ and %) on active positions.
  - Tracks **Realized P&L** (\$) computed from closed/partially closed positions using weighted average cost basis.
  - Interactive **Asset Allocation Donut Chart** (Cash vs. Equities breakdown).
- **Execution History & Audit Trail**:
  - Chronological log of all executed trades with Order ID, Type (`BUY`/`SELL`), Execution Price, Shares, Total Value, Realized P&L, and Simulation Timestamp.
  - Filterable by stock ticker and trade type.
- **One-Click Account Reset**:
  - Easily reset virtual funds to \$100,000.00 and wipe trade history to test fresh trading strategies.

---

## Architecture & Technology Stack

```
[ Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide ]
                                 │
                                 ▼ REST API (JSON)
[ Backend: Python 3.13 + FastAPI + Uvicorn + Pydantic ]
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
[ SQLite Database: market_data.db ]      [ CSV Files: data/csv/*.csv ]
- stocks, stock_prices (2,100 rows)      - AAPL.csv, MSFT.csv, ...
- user_account, portfolio_positions      - all_stocks_market_data.csv
- transactions audit log
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts (AreaChart, PieChart).
- **Backend**: FastAPI, Uvicorn, Pydantic, SQLite3 (standard library), HTTPX.
- **Unified Delivery**: The FastAPI server serves both the RESTful API endpoints at `/api/...` and the compiled single-page application at `/`.

---

## Project Structure

```
virtual-stock-trading/
├── data/
│   ├── csv/                           # Individual & consolidated CSV files
│   │   ├── AAPL.csv
│   │   ├── MSFT.csv
│   │   ├── NVDA.csv
│   │   ├── GOOGL.csv
│   │   ├── AMZN.csv
│   │   ├── META.csv
│   │   ├── TSLA.csv
│   │   ├── JPM.csv
│   │   ├── V.csv
│   │   ├── WMT.csv
│   │   └── all_stocks_market_data.csv # 2,100 OHLCV records
│   ├── market_data.db                 # SQLite database loaded from CSVs
│   └── generate_market_data.py        # Generates CSVs and seeds SQLite
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry, CORS, static file mount
│   │   ├── database.py                # SQLite connection & schema helpers
│   │   ├── models.py                  # Pydantic schemas
│   │   └── routers/
│   │       ├── stocks.py              # /api/stocks, /api/stocks/{sym}/history
│   │       ├── portfolio.py           # /api/portfolio valuation & P&L
│   │       ├── trade.py               # /api/trade/buy, /api/trade/sell
│   │       ├── history.py             # /api/transactions
│   │       └── simulation.py          # /api/simulation/timestamps, /reset
│   ├── requirements.txt
│   └── test_backend.py                # Automated API & trading logic tests
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── SimulationContext.tsx  # Central time-travel & playback state
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Navigation, account pills, reset button
│   │   │   ├── TimeTravelController.tsx # Rich playback scrubber & date picker
│   │   │   ├── MarketOverview.tsx     # Stock grid/table, filters, quick actions
│   │   │   ├── StockDetailModal.tsx   # Interactive price chart & stats
│   │   │   ├── TradeModal.tsx         # Buy & Sell modal with safeguards
│   │   │   ├── PortfolioView.tsx      # Net worth, holdings, allocation chart
│   │   │   └── TransactionHistory.tsx # Trade audit trail & filters
│   │   ├── services/api.ts            # Frontend API client
│   │   ├── types/index.ts             # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── dist/                          # Production build served by FastAPI
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── run.py                             # Root runner: starts unified server
├── run_app.bat                        # Windows 1-click launcher
├── run_app.ps1                        # PowerShell 1-click launcher
└── README.md                          # Documentation
```

---

## Quick Start & Running the Platform

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node 24)

### Option 1: 1-Click Windows Launch (Recommended)
Double-click `run_app.bat` or run in PowerShell:
```powershell
.\run_app.ps1
```

### Option 2: Run with Python directly
```bash
# 1. Install backend requirements
pip install -r backend/requirements.txt

# 2. Start the unified application
python run.py
```
Open your browser and navigate to:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

Interactive API Swagger documentation is available at:
**[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## How to Test & Verify

Run the automated backend test suite:
```bash
cd backend
python test_backend.py
```
This tests:
1. Timestamp extraction (210 intervals across 15 trading days).
2. Quotes calculation at simulation time with day open and interval changes.
3. Historical price chart generation without future peek.
4. Account reset back to \$100,000.00.
5. Buy order execution (cash deduction & position calculation).
6. Sell order execution (realized P&L calculation & share reduction).
7. Rejection of over-selling shares.
8. Transaction history recording.

---

## Demo Video Walkthrough Script

When recording your demonstration video, follow this recommended sequence:

1. **Market Watch & Time-Travel (0:00 - 0:45)**:
   - Point out the **\$100,000.00** virtual starting cash balance and the "Paper Trading" indicator.
   - Show the 10 stocks across different sectors with current prices, day change, and volume.
   - Click the **"Play"** button on the Time-Travel Controller — demonstrate how prices, percentages, and timestamps update automatically every interval.
   - Toggle playback speed to **2x** or **5x**.
   - Use the **date/time dropdown or scrub slider** to jump to a specific date (e.g. Sep 08, 2026, 11:30 AM).
2. **Interactive Stock Chart (0:45 - 1:15)**:
   - Click the chart icon on a stock (e.g. **AAPL** or **NVDA**).
   - Show how the historical area chart plots price movements strictly up to the selected simulation time.
   - Review key statistics (Day Open, Interval High/Low, Volume).
3. **Placing a Buy Order (1:15 - 1:45)**:
   - Click **"Buy AAPL"**.
   - Show the real-time cost calculation and percentage buttons (e.g. 25% or 50% of available cash).
   - Click **"Confirm Buy"** — highlight the success toast and updated available cash balance.
4. **Time Jump & P&L Observation (1:45 - 2:15)**:
   - Step forward by a few intervals or jump forward 2 days (`+1D`).
   - Navigate to the **"Portfolio"** tab.
   - Show how the portfolio net worth and **Unrealized P&L** dynamically recalculate based on the new prices!
   - Highlight the **Asset Allocation Donut Chart** showing Cash vs. Stock positions.
5. **Placing a Sell Order & Realized P&L (2:15 - 2:45)**:
   - Click the **Sell** button on your position.
   - Sell a portion of the shares (e.g. 50%).
   - Show how the trade executes, cash increases, and **Realized P&L** is recorded.
6. **Transaction History & Reset (2:45 - 3:00)**:
   - Navigate to the **"History"** tab.
   - Show the audit log of your BUY and SELL orders with timestamps.
   - Click **"Reset"** in the top navigation to demonstrate restoring the account back to initial \$100,000.00 virtual cash.

---

## Pushing to GitHub

To push the project to your GitHub account:

```bash
# In the project directory:
git init
git add .
git commit -m "Initial commit: Virtual Stock Trading Platform"

# Create a new repository on GitHub (e.g., virtual-stock-trading)
# Then link and push:
git remote add origin https://github.com/<YOUR_USERNAME>/virtual-stock-trading.git
git branch -M main
git push -u origin main
```

---

## License
MIT License. Built for assessment / educational simulation purposes.
