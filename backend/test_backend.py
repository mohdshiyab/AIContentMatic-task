"""
Test script to verify all backend API endpoints and trading math.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("--- 1. Testing Simulation Timestamps ---")
    res = client.get("/api/simulation/timestamps")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    ts_data = res.json()
    assert len(ts_data["timestamps"]) == 210, f"Expected 210 timestamps, got {len(ts_data['timestamps'])}"
    assert len(ts_data["days"]) == 15, f"Expected 15 days, got {len(ts_data['days'])}"
    print(f"PASS: Found {len(ts_data['timestamps'])} intervals across {len(ts_data['days'])} days.")

    first_time = ts_data["timestamps"][0]
    mid_time = ts_data["timestamps"][30]
    print(f"First timestamp: {first_time}, Mid timestamp: {mid_time}")

    print("\n--- 2. Testing Stocks List at Simulation Timestamp ---")
    res = client.get(f"/api/stocks?at_time={mid_time}")
    assert res.status_code == 200
    stocks = res.json()
    assert len(stocks) == 10, f"Expected 10 stocks, got {len(stocks)}"
    print(f"PASS: Retrieved 10 stocks. Sample: {stocks[0]['symbol']} at ${stocks[0]['price']} (Day change: {stocks[0]['day_change_percent']}%)")

    print("\n--- 3. Testing Single Stock History ---")
    res = client.get(f"/api/stocks/AAPL/history?to_time={mid_time}")
    assert res.status_code == 200
    history = res.json()
    assert len(history) == 31, f"Expected 31 bars up to index 30, got {len(history)}"
    print(f"PASS: Retrieved {len(history)} historical bars for AAPL.")

    print("\n--- 4. Testing Reset Simulation ---")
    res = client.post("/api/simulation/reset")
    assert res.status_code == 200
    res = client.get(f"/api/portfolio?at_time={mid_time}")
    assert res.status_code == 200
    port = res.json()
    assert port["cash_balance"] == 100000.0, f"Expected 100000.0, got {port['cash_balance']}"
    assert len(port["holdings"]) == 0
    print("PASS: Portfolio reset confirmed ($100,000.00 cash).")

    print("\n--- 5. Testing Buy Order ---")
    buy_res = client.post("/api/trade/buy", json={
        "symbol": "AAPL",
        "shares": 10,
        "simulation_time": mid_time
    })
    assert buy_res.status_code == 200, f"Buy failed: {buy_res.text}"
    print(f"PASS: Buy Order Result: {buy_res.json()['message']}")

    # Check portfolio after buy
    port_after_buy = client.get(f"/api/portfolio?at_time={mid_time}").json()
    assert len(port_after_buy["holdings"]) == 1
    assert port_after_buy["holdings"][0]["shares"] == 10
    assert port_after_buy["cash_balance"] < 100000.0
    print(f"PASS: Portfolio updated: {port_after_buy['holdings'][0]['shares']} shares of AAPL, Remaining cash: ${port_after_buy['cash_balance']:,.2f}")

    print("\n--- 6. Testing Sell Order ---")
    sell_res = client.post("/api/trade/sell", json={
        "symbol": "AAPL",
        "shares": 5,
        "simulation_time": mid_time
    })
    assert sell_res.status_code == 200, f"Sell failed: {sell_res.text}"
    print(f"PASS: Sell Order Result: {sell_res.json()['message']}")

    # Check portfolio after sell
    port_after_sell = client.get(f"/api/portfolio?at_time={mid_time}").json()
    assert port_after_sell["holdings"][0]["shares"] == 5
    print(f"PASS: 5 shares remaining in portfolio.")

    print("\n--- 7. Testing Over-selling Rejection ---")
    bad_sell = client.post("/api/trade/sell", json={
        "symbol": "AAPL",
        "shares": 50,
        "simulation_time": mid_time
    })
    assert bad_sell.status_code == 400
    print(f"PASS: Correctly rejected over-selling: {bad_sell.json()['detail']}")

    print("\n--- 8. Testing Transaction History ---")
    tx_res = client.get("/api/transactions")
    assert tx_res.status_code == 200
    txs = tx_res.json()
    assert len(txs) == 2, f"Expected 2 transactions, got {len(txs)}"
    print(f"PASS: Recorded {len(txs)} transactions:")
    for t in txs:
        print(f"  - [{t['type']}] {t['shares']}x {t['symbol']} @ ${t['price']:.2f} (Total: ${t['total_amount']:.2f}, Realized PnL: ${t['realized_pnl']:.2f})")

    # Reset for clean state
    client.post("/api/simulation/reset")
    print("\nAll Backend tests PASSED successfully!")

if __name__ == "__main__":
    test_api()
