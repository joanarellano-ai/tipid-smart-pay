---
name: Solo vs Group Mode
description: Account modes that toggle bill-splitting features and dedicated solo bill prediction
type: feature
---
Account has two modes stored in `accountStore` (localStorage `tipidpay_account`): `solo` and `group`.
- Set during Onboarding (Living Alone → solo, With Others/Create/Join → group).
- Switchable anytime via Profile → "Switch to Solo/Group Mode" dialog. Data is preserved on switch.
- Solo mode: hides /bills (shows empty state with switch CTA), bottom nav replaces Bills with History tab, Dashboard hides Split Bill action.
- Group mode: full shared-bills page with roommates, invite, and reminder send buttons.
