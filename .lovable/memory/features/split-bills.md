---
name: Flexible Split Bills
description: Multi-method bill splitting with partial payments and dynamic participants
type: feature
---

Route: `/splits` (page: `src/pages/SplitBills.tsx`, store: `src/lib/splitStore.ts`).

Categories: vacation, family, household, dining, groceries, other.

Split methods (sum == total via drift correction, except `exact` which validates UI-side):
- **equal**, **shares** (weighted), **exact** (manual), **items** (line items assigned to subsets)

Dynamic adjustment:
- `splitStore.addParticipant(billId, name)` / `removeParticipant(billId, pid)` — payer cannot be removed; item assignments are cleaned up.
- `splitStore.recordPartialPayment(billId, pid, amount, owedNow)` updates `paidAmount`; auto-flips `paid=true` when `paidAmount ≥ owed`.
- `computeRemaining(bill)` returns `owed - paid` per participant.

UI exposes per-participant: Remind, Record partial (Banknote icon), Mark Paid, Remove. Inline "Add a person…" input at bottom of participant list.

Persistence: `localStorage` `tipidpay_splits`. First listed participant is payer (auto-paid).
