---
name: CloudsWork auth resilience
description: How the frontend session should behave when the current-user request fails.
---

The frontend session must not be destroyed by transient network or server errors. Only explicit authentication failures (401/403) should clear the stored token and force a re-login.

**Why:** Calling `logout()` on every `/auth/me` failure means a single 5xx error or network blip kicks the user back to the login screen and destroys their session state, which looks like a bug.

**How to apply:**
1. In `AuthProvider`, validate the token by calling the current-user endpoint.
2. On success, update the local user state.
3. On failure, inspect the error status (e.g. `(error as any).status`).
4. If the status is 401 or 403, clear the token and user.
5. If the status is anything else, keep the token and treat the app as still in a loading/error state; expose `isError` to UI so the user can retry or see a message.
