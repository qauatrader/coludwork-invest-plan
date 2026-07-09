---
name: CloudsWork financial mutations
description: Rules for keeping deposit, plan purchase, and withdrawal balance changes safe under concurrency and replay.
---

Any endpoint that changes a numeric balance or distributes commissions must be wrapped in a DB transaction and must be idempotent where admins can retry the same action.

**Why:** A `read → modify → write` balance update without a transaction or row lock can be overwritten by a concurrent request, and an admin approving the same deposit twice can double-credit the user and double-pay commissions.

**How to apply:**
1. Lock both the affected resource row (deposit/withdrawal/plan) and the user row with `for("update")` inside the transaction.
2. Check the resource is in the expected state before mutating it (e.g. `status = 'pending'`). If already approved, short-circuit safely instead of re-crediting.
3. Update balances with SQL expressions like `sql\`${usersTable.depositBalance} + ${amount}\`` rather than computing a new value in app code.
4. Create the transaction log, notification, and referral commission records inside the same transaction so they roll back together if the commission step fails.
5. Return a clear error status (409 for already-processed resources, 400 for bad state, 500 with generic message on unexpected failures) and never leak raw DB errors to the client.
