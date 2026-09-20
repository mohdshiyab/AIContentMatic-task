"""
FastAPI application entry point for the Virtual Stock Trading Platform.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routers import stocks, portfolio, trade, history, simulation

app = FastAPI(
    title="Virtual Stock Trading Platform API",
    description="Backend API supporting market simulation, CSV-based time travel, paper trading, and portfolio tracking.",
    version="1.0.0"
)

# CORS middleware for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(stocks.router)
app.include_router(portfolio.router)
app.include_router(trade.router)
app.include_router(history.router)
app.include_router(simulation.router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": "Virtual Stock Trading Platform"}

# Serve frontend build if present
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
