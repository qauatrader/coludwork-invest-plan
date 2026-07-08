---
name: CloudsWork referral/commission system
description: How the multi-level referral chain and commission distribution are wired in CloudsWork; check both halves when referrals seem broken.
---

The referral program has two independent halves that must both work, and each was previously missing:

1. **Chain creation** — registering with a `referralCode` only stored `referredBy` on the new user; it did NOT insert rows into `referralsTable` for L1/L2/L3. Team lists and referral counts read from `referralsTable`, so without explicit inserts at registration time, referred users never showed up anywhere. Fix: at registration, walk up the `referredBy` chain (via `usersTable.referralCode`) up to 3 levels and insert one `referralsTable` row per level.

2. **Commission payout** — commissions are only generated when a deposit is approved (admin `/deposits/:id/approve`), by looking up the depositor's upline in `referralsTable` and paying L1/L2/L3 rates (7%/3%/1%) into `commissionsTable` + crediting the referrer's balance. Any other money-in event (tasks, plan purchases) does NOT trigger commissions unless explicitly added there too.

**Why:** "Referral Program is not working" was a real bug, not user error — the schema/relations existed but nothing ever populated them. Always check both the relationship table AND the payout trigger when this feature seems broken.

**How to apply:** Users have 4 separate balance fields on `usersTable`: `walletBalance`, `depositBalance`, `withdrawBalance`, `profitBalance`, `commissionBalance`. The `/wallet` endpoint sums `deposit+withdraw+profit+commission` into `totalBalance` — it does NOT read `walletBalance`. Referral commissions must credit `commissionBalance`, not `walletBalance`, or they'll be silently invisible in the wallet UI despite being recorded correctly in `commissionsTable`.
