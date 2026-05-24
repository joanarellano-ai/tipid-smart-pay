---
name: Vacation & Group Expense Dashboard
description: Trip-scoped group expense management with multi-mode splitting, balances, settlements, analytics, and CSV export
type: feature
---

Route: `/trips` (page: `src/pages/VacationDashboard.tsx`, store: `src/lib/vacationStore.ts`).

Entry point: card on Dashboard ("Vacation & Group Expenses") → `/trips`.

## Data model (`vacationStore.ts`)
- `Trip { id, name, destination, startDate, endDate, description, coverEmoji, budget, members[], expenses[], createdAt }`
- `TripMember { id, name, isAdmin? }` — first member is admin.
- `TripExpense { id, title, category, amount, paidById, date, mode, splits[], note?, receiptName? }`
- `ExpenseCategory`: accommodation, food, transportation, fuel, flights, activities, shopping, emergency, entertainment, misc.
- Persistence: `localStorage` key `tipidpay_trips`.

## Split modes (`buildSplits`)
- `equal` — among all members
- `selected` — among chosen subset
- `percentage` — must total 100% (validated)
- `custom` — exact peso amounts, must sum to expense total (validated)
- Drift correction on equal/selected/percentage guarantees sum == total.

## Calculations
- `computeBalances(trip)` → per member `{ paid, share, net }`.
- `computeSettlements(trip)` → greedy minimum-transaction "who pays whom" suggestions.
- `totalSpent(trip)`, daily limit = budget / days, per-person = spent / members.

## UI tabs
- **Expenses** — list + add/delete; receipts via file input (name stored only).
- **Balances** — member net positions + Settle-up suggestions card.
- **Stats** — pie (categories), bar (contributions), forecast card.
- **People** — add/remove members (cannot remove if involved in expenses or admin).

## Other
- Overspending banner when spent > budget.
- Invite dialog: shareable link `/splits?join={tripId}` + QR via api.qrserver.com.
- CSV export via Blob download.
