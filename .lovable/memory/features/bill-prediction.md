---
name: Bill Prediction Engine
description: 3-month linear-trend bill forecasting per utility with confidence and due date
type: feature
---
`billHistoryStore` (localStorage `tipidpay_bill_history`) seeds 3 months (Jan/Feb/Mar 2026) of editable history per utility:
- Electricity: kWh + amount + dueDay (15)
- Water: m³ + amount + dueDay (10)
- Internet: fixed plan amount + dueDay (5)

`predict(utility)` returns: predictedAmount = lastAmount + avgDelta; predictedUsage similarly; trendPercent = (last-first)/first*100; confidence = 50-98 based on coefficient of variation (lower variance → higher confidence); nextDueDate = next month using last entry's dueDay; significantChange flagged when |trend| ≥ 10%.

Dashboard shows aggregated total + avg confidence; /bill-history page lets user tap any month entry to edit usage/amount inline.
