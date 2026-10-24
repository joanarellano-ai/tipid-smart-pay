# Architecture
- Keep the existing local prototype modules intact; new personal finance records use authenticated Cloud tables with owner-only policies, so legacy records are not silently overwritten or assigned to another user.
- Keep subscription entitlements read-only to clients and separate from editable profiles; only trusted billing infrastructure may activate Premium.
- Calculate personal budgets and vacation projections in shared pure functions using integer centavos, so UI estimates and tests use identical rules.
- Generate scheduled in-app reminders in one authenticated daily job using each bill's calendar timezone and unique bill/due-date keys, preventing repeated delivery.