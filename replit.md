# CloudsWork

An investment and task platform with user wallets, deposits/withdrawals, referral commissions, and an admin panel.

## Run & Operate

- **"API Server" workflow** — runs the Express API on port 8080 (`PORT=8080 pnpm --filter @workspace/api-server run dev`)
- **"CloudsWork" workflow** — runs the React/Vite frontend on port 5173 (`PORT=5173 BASE_PATH=/ pnpm --filter @workspace/cloudswork run dev`); proxies `/api` to `localhost:8080`
- Both workflows must be running together for the app to work
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — auto-provided by Replit's built-in PostgreSQL

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
