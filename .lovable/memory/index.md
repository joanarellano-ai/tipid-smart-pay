# Memory: index.md
Updated: now

# Project Memory

## Core
TIPIDPAY: Mobile-first fintech MVP for utility tracking & bill splitting for Gen Z shared living in the Philippines.
Currency: Localized to Philippine Peso (₱), e.g., ₱1,000.00.
Visuals: Emerald Green (#10B981) & Deep Blue (#1E3A8A), card-based layout (12-16px rounded).
Typography: Inter/Poppins.
Dark mode is supported.
Account has SOLO/GROUP modes (accountStore) — solo hides bill-splitting; toggle via Profile.

## Memories
- [Design System](mem://style/design-system) — Visual language, color palette, UI elements, and typography
- [Core Modules](mem://features/core-modules) — App main features: AI bill forecasting, shared splitting, and gamification
- [Onboarding Flow](mem://features/onboarding-entry) — Splash, Welcome, and 4-step onboarding with living arrangement selection
- [Registration Rules](mem://features/registration-requirements) — Form fields, password rules, and real-time validation states
- [Splash Screen](mem://features/splash-screen) — Minimalist initial loading state and animation timing
- [Financial System](mem://features/financial-system) — Wallet top-ups, transfers, multi-bill payments, and modular components
- [Security](mem://features/security-verification) — 4-digit PIN entry requirement for transaction authorization
- [Persistence Strategy](mem://technical/persistence) — Client-side localStorage and reactive store pattern for MVP state
- [Account Modes](mem://features/account-modes) — Solo vs Group mode toggle with persisted state and UI gating
- [Bill Prediction](mem://features/bill-prediction) — 3-month history-based forecasting per utility with confidence + due date
- [Split Bills](mem://features/split-bills) — Multi-method splits (equal/shares/exact/items) for trips, family, dining at /splits
