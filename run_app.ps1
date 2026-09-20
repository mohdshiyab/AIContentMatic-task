# QuantumTrade PowerShell Runner
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       QuantumTrade - Virtual Stock Trading Simulator" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure dependencies
python -m pip install -r backend\requirements.txt

# Run unified server
python run.py
