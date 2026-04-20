---
name: Flexible Split Bills
description: Multi-method bill splitting for vacations, family trips, dining, groceries with accuracy guarantees
type: feature
---

Route: `/splits` (page: `src/pages/SplitBills.tsx`, store: `src/lib/splitStore.ts`).

Categories: vacation, family, household, dining, groceries, other.

Split methods (all guarantee sum == total via drift correction on the last participant, except `exact`):
- **equal**: total / N
- **shares**: weighted by integer shares (e.g. couple = 2)
- **exact**: user sets each amount; UI shows imbalance if not equal to total
- **items**: add line items, assign each to a subset of participants; per-item cost split equally among assignees

Persistence: `localStorage` key `tipidpay_splits`. First listed participant is the payer and is auto-marked paid. Reminder & toggle-paid actions wired per participant.

Accessible from group-mode dashboard quick action and via SharedBills "New custom split" link.
