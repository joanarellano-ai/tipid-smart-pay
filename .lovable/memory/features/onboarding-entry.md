---
name: New User Entry & Bill Tracking Mode
description: Mandatory choice between Survey vs Track-Bills mode for new users; analytics gated by data
type: feature
---

After signup → Splash → Welcome → Onboarding (4 steps) → `/bill-survey`.

**Mandatory entry choice** (cannot proceed without picking one):
1. **Start Survey (Recommended)** — collects 3 months of electricity/water/internet → predictions ready immediately. Sets nothing special; clears `tipidpay_track_mode`.
2. **Skip Survey – Track Bills Instead** — sets `localStorage.tipidpay_track_mode = "1"`, clears bill history, navigates to `/reminders`, auto-opens Add Bill dialog.

**Track-mode rules** (`src/pages/Reminders.tsx` + `walletStore.addReminder/setReminderStatus/removeReminder`):
- Every added bill REQUIRES `status` (paid | upcoming/unpaid | overdue) — submit blocked otherwise.
- Amount must be > 0 and ≤ 1,000,000.
- Per-bill action buttons: **Mark as Paid** (records `paidDate`), **Mark as Unpaid**, **Mark as Overdue** (toasts a reminder).
- Banner: warning until ≥1 tracked bill, then "System is learning…" message.
- Tracked bills carry `tracked: true` and can be removed.

**Gating** (until ≥1 bill history entry OR ≥1 tracked bill):
- Dashboard: shows "Predictions locked" / "Tracking mode active" empty state.
- `/analytics`: full lock screen with CTA to survey or add a bill.

User can switch anytime via Profile → Update Bill Survey (re-enters the choice).
