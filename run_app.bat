@echo off
title QuantumTrade - Virtual Stock Trading Platform
echo =================================================================
echo        QuantumTrade - Virtual Stock Trading Simulator
echo =================================================================
echo.
echo Installing requirements (if needed)...
python -m pip install -r backend\requirements.txt
echo.
echo Launching unified platform...
python run.py
pause
