# QuantumTrade — Virtual Stock Trading Platform

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://virtual-stock-trading-alpha.vercel.app)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

A modern, full-stack **Virtual Stock Trading Platform** built for market simulation, time-travel analysis, and virtual portfolio management. The application simulates the US stock market across 10 major companies using 30-minute interval CSV test data covering 15 trading days.

### 🔗 Quick Links
- **🚀 Live Application (Hosted on Vercel)**: **[https://virtual-stock-trading-alpha.vercel.app](https://virtual-stock-trading-alpha.vercel.app)**
- **📁 GitHub Repository**: **[https://github.com/mohdshiyab/AIContentMatic-task](https://github.com/mohdshiyab/AIContentMatic-task)**
- **⚡ Live API Health Check**: **[https://virtual-stock-trading-alpha.vercel.app/api/stocks](https://virtual-stock-trading-alpha.vercel.app/api/stocks)**

> **Note**: This is a virtual simulation platform designed for paper trading. There are **no real-money transactions** and no real assets involved.

---

## Requirements & Implementation Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **View Available Stocks** | 10 major stocks (`AAPL`, `MSFT`, `NVDA`, `GOOGL`, `AMZN`, `META`, `TSLA`, `JPM`, `V`, `WMT`) across Technology, Semiconductors, Consumer Discretionary, Financial Services, and Consumer Staples. | ✅ Complete |
| **Changing Stock Prices** | Real-time prices dynamically change according to the simulation clock, with visual green/red flash animations and day/interval percentage indicators. | ✅ Complete |
| **Time-Travel by Date & Time** | Display stock price based on selected date & time using CSV data. Features timeline scrub slider, dropdown date/time picker, step buttons (`+30m`, `-30m`, `+1D`, `-1D`), and Auto-Play simulation mode (`1x`, `2x`, `5x`, `10x`). | ✅ Complete |
| **Interactive Price Charts** | Detailed historical Area Chart rendered up to the selected simulation timestamp without leaking future data. | ✅ Complete |
| **Buy & Sell with Virtual Money** | Trade execution at the exact simulation timestamp's price with **\$100,000.00** starting virtual cash, real-time cost calculation, and overdraft safeguards. | ✅ Complete |
| **Portfolio Management** | Dynamic tracking of Total Net Worth, Cash Balance, Invested Capital, active holdings, and an interactive **Asset Allocation Donut Chart**. | ✅ Complete |
| **Track Profit / Loss (P&L)** | Computes both **Unrealized P&L** (\$ and %) on open positions and **Realized P&L** (\$) on closed/partially closed positions using weighted average cost basis. | ✅ Complete |
| **Transaction History** | Chronological audit log with Order ID, Type (`BUY`/`SELL`), Shares, Execution Price, Total Value, Realized P&L, and simulation timestamps. Filterable by ticker and order type. | ✅ Complete |
| **CSV Test Market Data** | 10 stocks $\times$ 15 trading days $\times$ 14 intervals/day = **2,100 OHLCV records** stored in `data/csv/` and indexed in SQLite `market_data.db`. | ✅ Complete |
| **No Auth / Single User** | Predefined virtual account (`Demo Trader`) with zero registration/login hurdles for immediate testing. | ✅ Complete |
| **One-Click Account Reset** | Easily resets funds to \$100,000.00 and clears positions/trades to test new trading strategies. | ✅ Complete |

---

## Architecture & Technology Stack

```
[ Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide ]
                                 │
                                 ▼ REST API (JSON)
[ Backend: Python 3.12/3.13 + FastAPI + SQLite Serverless Handler ]
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
[ SQLite Database: market_data.db ]      [ CSV Files: data/csv/*.csv ]
- stocks, stock_prices (2,100 rows)      - AAPL.csv, MSFT.csv, ...
- user_account, portfolio_positions      - all_stocks_market_data.csv
- transactions audit log
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts (Interactive Area & Donut charts).
- **Backend**: FastAPI, Python, Pydantic, SQLite3 (with serverless `/tmp` fallback for zero-write-error hosting on Vercel).
- **Cloud Hosting**: Deployed on **Vercel** with edge routing (`vercel.json`), serverless Python functions (`api/index.py`), and CDN static caching.

---

## Project Structure

```
virtual-stock-trading/
├── api/
│   ├── index.py                       # Vercel serverless Python handler
│   └── requirements.txt               # Vercel dependencies
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
│   ├── market_data.db                 # SQLite database seeded from CSVs
│   └── generate_market_data.py        # Generates CSVs and seeds SQLite
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, CORS, routers, static mount
│   │   ├── database.py                # SQLite connection & serverless fallback
│   │   ├── models.py                  # Pydantic schemas
│   │   └── routers/
│   │       ├── stocks.py              # /api/stocks, /api/stocks/{sym}/history
│   │       ├── portfolio.py           # /api/portfolio valuation & P&L
│   │       ├── trade.py               # /api/trade/buy, /api/trade/sell
│   │       ├── history.py             # /api/transactions
│   │       └── simulation.py          # /api/simulation/timestamps, /reset
│   ├── requirements.txt
│   └── test_backend.py                # Automated backend & trading logic test suite
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
│   ├── dist/                          # Production bundle served by FastAPI / Vercel
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── vercel.json                        # Vercel deployment configuration
├── run.py                             # Root runner for local unified hosting
├── run_app.bat                        # Windows 1-click launcher
├── run_app.ps1                        # PowerShell 1-click launcher
└── README.md                          # Documentation
```

---

## Running Locally

### Option 1: One-Click Windows Launcher (Recommended)
Double-click `run_app.bat` or run in PowerShell:
```powershell
.\run_app.ps1
```

### Option 2: Run with Python directly
```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Start the unified application
python run.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your web browser.

---

## Automated Testing

Run the automated backend test suite:
```bash
cd backend
python test_backend.py
```
**Tests Verified**:
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

## Author & License
- **Author**: Mohammad Shiyab ([@mohdshiyab](https://github.com/mohdshiyab))
- **License**: MIT License
