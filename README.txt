
████████████████████████████████████████████████████████████████████████████████
██                                                                            ██
██         ██████╗██╗      ██████╗ ██╗   ██╗██████╗ ███████╗                 ██
██        ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗██╔════╝                 ██
██        ██║     ██║     ██║   ██║██║   ██║██║  ██║███████╗                 ██
██        ██║     ██║     ██║   ██║██║   ██║██║  ██║╚════██║                 ██
██        ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝███████║                 ██
██         ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝                 ██
██                                                                            ██
██                    W O R K   &   E A R N   P L A T F O R M                ██
██                                                                            ██
██                         Created by: Qamar Shahzad                         ██
██                         Platform:   Replit                                 ██
██                         Version:    1.0.0                                  ██
██                                                                            ██
████████████████████████████████████████████████████████████████████████████████


================================================================================
  TABLE OF CONTENTS
================================================================================

  01. Project Overview
  02. Admin Login Credentials
  03. Tech Stack (Full Detail)
  04. Project Folder Structure (Every File Explained)
  05. Database — Complete Schema (Every Table, Column, Type, Constraint)
  06. Database — Relationships & Foreign Keys
  07. Database — Balance System Explained
  08. Database — How Data Flows Through the System
  09. Authentication System (Full Detail)
  10. API Routes — Complete Reference (Every Endpoint)
  11. Business Logic — Investment Plans System
  12. Business Logic — Wallet, Deposit & Withdrawal System
  13. Business Logic — 3-Level Referral & Commission System
  14. Business Logic — Task & Reward System
  15. Business Logic — Admin Panel (Every Feature)
  16. Frontend — Pages & Routing (Every Screen)
  17. Frontend — Components Library
  18. Frontend — Auth & State Management
  19. Frontend — API Client & Codegen
  20. Environment Variables (Every Variable Explained)
  21. Development Workflow (Step-by-Step)
  22. Build & Bundling System
  23. Monorepo Architecture (pnpm Workspaces)
  24. Security Features
  25. Deployment on Replit
  26. System Settings & Configuration
  27. Post-Merge Automation
  28. Author & Credits


================================================================================
  01. PROJECT OVERVIEW
================================================================================

  CloudsWork is a full-stack INVESTMENT & TASK platform where users can:

  ► Deposit money (PKR currency, via payment methods like bank/wallet)
  ► Purchase investment plans that earn daily profit automatically
  ► Withdraw earned profits to their bank accounts
  ► Complete daily tasks to earn bonus rewards
  ► Invite friends using a unique referral code and earn 3-level commissions
  ► Track all wallet activity (deposits, withdrawals, profits, commissions)
  ► Contact support and receive admin replies
  ► Manage their profile and account settings

  Admins can:
  ► View platform-wide statistics (users, deposits, withdrawals, revenue)
  ► Approve or reject all deposits and withdrawals
  ► Create and manage investment plans
  ► Create and manage earning tasks
  ► Manage all user accounts (suspend, promote, delete)
  ► Reply to support tickets
  ► Configure platform settings (fees, rates, site name, maintenance mode)
  ► Manage payment methods and banners


================================================================================
  02. ADMIN LOGIN CREDENTIALS
================================================================================

  ┌─────────────────────────────────────────────────────┐
  │  Phone Number:  09001234567                         │
  │  Password:      Admin@123456                        │
  │  Role:          Super Admin (is_admin = true)       │
  └─────────────────────────────────────────────────────┘

  Login URL: /auth/login
  Admin Panel: /admin

  ⚠ SECURITY NOTICE:
    - Change this password immediately after first login
    - Go to /profile → Change Password
    - Create additional admin accounts at /admin/users
    - Never share admin credentials with regular users


================================================================================
  03. TECH STACK (FULL DETAIL)
================================================================================

  ── RUNTIME ────────────────────────────────────────────────────────────────────
  Node.js 24             Latest LTS with native ESM support
  pnpm 10.x              Fast, disk-efficient package manager with workspaces

  ── LANGUAGE ───────────────────────────────────────────────────────────────────
  TypeScript 5.9         Strict mode enabled; target: ES2022
                         moduleResolution: "bundler" for Vite/esbuild compat
                         Project references for cross-package type checking

  ── BACKEND ────────────────────────────────────────────────────────────────────
  Express 5.x            HTTP framework; async error handling built-in
  Drizzle ORM            Type-safe SQL query builder for PostgreSQL
  drizzle-kit            Schema push / migration tooling
  Zod v4                 Runtime validation for all API inputs
  drizzle-zod            Auto-generates Zod schemas from Drizzle table definitions
  Pino                   High-performance structured JSON logger
  pino-http              HTTP request/response logging middleware
  pino-pretty            Human-readable log formatting in development
  cookie-parser          Cookie parsing middleware for Express
  cors                   CORS header middleware (allows all origins in dev)
  esbuild 0.27.3         Ultra-fast bundler for production API build
  esbuild-plugin-pino    Ensures Pino worker threads bundle correctly

  ── FRONTEND ───────────────────────────────────────────────────────────────────
  React 19               Latest React with concurrent features
  Vite 7.x               Lightning-fast dev server and bundler
  Tailwind CSS v4        Utility-first CSS framework (via @tailwindcss/vite)
  shadcn/ui              Pre-built accessible UI component library
  Radix UI               Headless accessible primitives (used by shadcn)
  TanStack React Query   Server state management, caching, background refetch
  Wouter                 Lightweight client-side router (React Router alternative)
  React Hook Form        Performant forms with minimal re-renders
  Zod (frontend)         Form validation schemas (via @hookform/resolvers/zod)
  Framer Motion          Animations and transitions
  Recharts               Chart library for admin dashboard stats
  Lucide React           Icon library
  React Icons            Extended icon set
  date-fns               Date formatting and manipulation
  class-variance-authority  Component variant styling utility
  clsx + tailwind-merge  Conditional className merging
  sonner                 Toast notification system
  vaul                   Drawer (bottom sheet) component
  cmdk                   Command palette component
  next-themes            Dark/light mode theming
  embla-carousel-react   Carousel/slider component
  react-day-picker       Date picker component
  input-otp              OTP input component
  react-resizable-panels Resizable panel layouts

  ── API CONTRACT ───────────────────────────────────────────────────────────────
  OpenAPI 3.x            openapi.yaml is single source of truth for all routes
  Orval                  Code generator: OpenAPI → React Query hooks + Zod schemas
                         Configured in lib/api-spec/orval.config.ts

  ── DATABASE ───────────────────────────────────────────────────────────────────
  PostgreSQL 16          Relational database (Replit built-in, auto-provisioned)
  pg (node-postgres)     Low-level PostgreSQL driver used by Drizzle
  numeric(18,2)          All monetary values use fixed-point decimal (not float!)
  numeric(8,4)           Profit rates stored with 4 decimal places (e.g. 0.0250)

  ── REPLIT-SPECIFIC ────────────────────────────────────────────────────────────
  @replit/vite-plugin-cartographer  Replit code navigation in dev
  @replit/vite-plugin-dev-banner    Replit dev environment banner
  @replit/vite-plugin-runtime-error-modal  Error overlay in browser


================================================================================
  04. PROJECT FOLDER STRUCTURE (EVERY FILE EXPLAINED)
================================================================================

  cloudswork/ (root)
  │
  ├── README.txt                    ← THIS FILE — full documentation
  │
  ├── package.json                  ← Root workspace package (no app code)
  │                                   Scripts: build, typecheck, typecheck:libs
  │                                   DevDeps: prettier, typescript
  │
  ├── pnpm-workspace.yaml           ← Defines monorepo packages:
  │                                   artifacts/*, lib/*, scripts
  │                                   Security: minimumReleaseAge: 1440min
  │
  ├── pnpm-lock.yaml                ← Exact locked dependency versions
  ├── .npmrc                        ← pnpm config (strict peer deps, etc.)
  ├── tsconfig.json                 ← Root TS config (references all packages)
  ├── tsconfig.base.json            ← Shared TS settings inherited by all packages
  │                                   target: es2022, strict: true,
  │                                   moduleResolution: bundler
  ├── .gitignore                    ← Git ignored files (node_modules, dist, etc.)
  ├── .replitignore                 ← Replit-specific ignored files
  │
  ├── artifacts/                    ← All runnable apps live here
  │   │
  │   ├── api-server/               ← Express REST API backend
  │   │   ├── package.json          ← @workspace/api-server
  │   │   │                           Scripts: dev, build, start, typecheck
  │   │   │                           Dev command: NODE_ENV=development &&
  │   │   │                             pnpm run build && pnpm run start
  │   │   ├── tsconfig.json         ← TS config for API (extends tsconfig.base)
  │   │   ├── build.mjs             ← esbuild bundler script
  │   │   │                           Entry: src/index.ts → dist/index.mjs
  │   │   │                           Also bundles pino workers separately
  │   │   │                           External: sharp, better-sqlite3, aws-sdk
  │   │   │                           Output: ESM format with source maps
  │   │   │
  │   │   ├── dist/                 ← Built output (git-ignored)
  │   │   │   ├── index.mjs         ← Bundled API server (~2.2MB)
  │   │   │   ├── index.mjs.map     ← Source map (~3.9MB)
  │   │   │   ├── pino-worker.mjs   ← Pino logger worker thread
  │   │   │   ├── pino-file.mjs     ← Pino file transport
  │   │   │   ├── pino-pretty.mjs   ← Pino pretty formatter
  │   │   │   └── thread-stream-worker.mjs
  │   │   │
  │   │   └── src/
  │   │       ├── index.ts          ← Entry point
  │   │       │                       Reads PORT env var (required)
  │   │       │                       Calls app.listen(port)
  │   │       │                       Logs: "Server listening" with port
  │   │       │
  │   │       ├── app.ts            ← Express app configuration
  │   │       │                       Middleware stack:
  │   │       │                         1. pino-http (request logging)
  │   │       │                         2. cors (all origins allowed in dev)
  │   │       │                         3. express.json() (body parser)
  │   │       │                         4. cookie-parser
  │   │       │                       Route mounting:
  │   │       │                         /api/healthz   → healthz router
  │   │       │                         /api/auth      → auth router
  │   │       │                         /api/dashboard → dashboard router
  │   │       │                         /api/plans     → plans router
  │   │       │                         /api/wallet    → wallet router
  │   │       │                         /api/referral  → referral router
  │   │       │                         /api/tasks     → tasks router
  │   │       │                         /api/notifications → notifications
  │   │       │                         /api/profile   → profile router
  │   │       │                         /api/support   → support router
  │   │       │                         /api/admin     → admin router
  │   │       │                       Global error handler at bottom
  │   │       │
  │   │       ├── routes/
  │   │       │   ├── healthz.ts    ← GET /api/healthz
  │   │       │   │                   Returns: { status: "ok", timestamp }
  │   │       │   │                   Used by Replit health checks
  │   │       │   │
  │   │       │   ├── auth.ts       ← Authentication routes
  │   │       │   │                   POST /api/auth/register
  │   │       │   │                   POST /api/auth/login  (rate limited)
  │   │       │   │                   POST /api/auth/logout
  │   │       │   │                   POST /api/auth/forgot-password
  │   │       │   │                   GET  /api/auth/me
  │   │       │   │
  │   │       │   ├── dashboard.ts  ← GET /api/dashboard
  │   │       │   │                   Returns user stats: balance, active plans,
  │   │       │   │                   today's earnings, referral count, etc.
  │   │       │   │
  │   │       │   ├── plans.ts      ← GET  /api/plans (list active plans)
  │   │       │   │                   POST /api/plans/:id/purchase
  │   │       │   │
  │   │       │   ├── wallet.ts     ← GET  /api/wallet (balances + totals)
  │   │       │   │                   POST /api/wallet/deposit
  │   │       │   │                   POST /api/wallet/withdraw
  │   │       │   │                   GET  /api/wallet/transactions
  │   │       │   │
  │   │       │   ├── referral.ts   ← GET /api/referral
  │   │       │   │                   Returns: referral code, link, team,
  │   │       │   │                   commission history, total earned
  │   │       │   │
  │   │       │   ├── tasks.ts      ← GET  /api/tasks
  │   │       │   │                   POST /api/tasks/:id/complete
  │   │       │   │
  │   │       │   ├── notifications.ts  GET /api/notifications
  │   │       │   │                     PATCH /api/notifications/:id/read
  │   │       │   │
  │   │       │   ├── profile.ts    ← GET   /api/profile
  │   │       │   │                   PATCH /api/profile (nickname, avatar)
  │   │       │   │                   POST  /api/profile/change-password
  │   │       │   │
  │   │       │   ├── support.ts    ← GET  /api/support (user's messages)
  │   │       │   │                   POST /api/support (send message)
  │   │       │   │
  │   │       │   └── admin.ts      ← All /api/admin/* routes
  │   │       │                       Requires: authenticateToken + requireAdmin
  │   │       │                       (see Section 15 for full admin route list)
  │   │       │
  │   │       └── lib/
  │   │           ├── auth.ts       ← JWT/session middleware
  │   │           │                   authenticateToken: reads cw_token from
  │   │           │                     Authorization: Bearer header
  │   │           │                   requireAdmin: checks is_admin on user
  │   │           │                   Token lookup: sessions table by token hash
  │   │           │
  │   │           ├── hashPassword.ts  Password hashing utilities
  │   │           │                   hashPassword(password): scrypt with
  │   │           │                     random 16-byte salt, returns
  │   │           │                     "salt:hash" string
  │   │           │                   verifyPassword(password, stored):
  │   │           │                     supports both new scrypt format AND
  │   │           │                     legacy SHA-256+static-salt for
  │   │           │                     backward compatibility
  │   │           │
  │   │           ├── rateLimiter.ts   Login rate limiter
  │   │           │                   Max: 10 attempts per 15 minutes
  │   │           │                   Key: IP address + phone number
  │   │           │                   Returns 429 Too Many Requests
  │   │           │
  │   │           ├── commissions.ts   Referral commission calculator
  │   │           │                   Level 1 rate: 7%
  │   │           │                   Level 2 rate: 3%
  │   │           │                   Level 3 rate: 1%
  │   │           │                   Triggers on deposit approval
  │   │           │                   Walks up referral chain 3 levels
  │   │           │
  │   │           └── logger.ts     ← Pino logger instance
  │   │                               Pretty-prints in development
  │   │                               JSON format in production
  │   │                               Log level from LOG_LEVEL env var
  │   │
  │   ├── cloudswork/               ← React + Vite frontend app
  │   │   ├── package.json          ← @workspace/cloudswork
  │   │   │                           Scripts: dev, build, serve, typecheck
  │   │   │                           Dev: vite --config vite.config.ts --host 0.0.0.0
  │   │   ├── tsconfig.json         ← Frontend TS config
  │   │   ├── index.html            ← HTML entry point
  │   │   ├── components.json       ← shadcn/ui configuration file
  │   │   │                           Defines component style, path aliases
  │   │   │
  │   │   ├── vite.config.ts        ← Vite build configuration
  │   │   │                           Requires PORT env var (throws if missing)
  │   │   │                           Requires BASE_PATH env var
  │   │   │                           Plugins: react, tailwindcss, runtimeErrorOverlay
  │   │   │                           Dev plugins: cartographer, devBanner
  │   │   │                           Path aliases: @ → src/, @assets → attached_assets/
  │   │   │                           Dev proxy: /api → http://localhost:8080
  │   │   │                           Build output: dist/public/
  │   │   │                           strictPort: true, host: 0.0.0.0
  │   │   │                           allowedHosts: true (allows Replit proxy)
  │   │   │
  │   │   └── src/
  │   │       ├── main.tsx          ← React root mount
  │   │       │                       Wraps: QueryClientProvider, ThemeProvider,
  │   │       │                         Toaster, App
  │   │       │
  │   │       ├── App.tsx           ← Router and auth setup
  │   │       │                       Calls setupApiClient() on mount
  │   │       │                       Route guards: ProtectedRoute, AdminRoute,
  │   │       │                         GuestRoute
  │   │       │                       Uses wouter for routing
  │   │       │                       BASE_URL from import.meta.env.BASE_URL
  │   │       │
  │   │       ├── index.css         ← Global styles + Tailwind CSS entry
  │   │       │                       @theme tokens for cartographer
  │   │       │
  │   │       ├── pages/
  │   │       │   ├── auth/
  │   │       │   │   ├── login.tsx       Phone + password login form
  │   │       │   │   │                   Stores token in localStorage (cw_token)
  │   │       │   │   │                   Redirects to /dashboard on success
  │   │       │   │   └── register.tsx    Phone + password + confirmPassword
  │   │       │   │                       Optional: referral code input
  │   │       │   │                       Auto-login on success
  │   │       │   │
  │   │       │   ├── dashboard.tsx       Main user home screen
  │   │       │   │                       Shows: wallet balance, active plans,
  │   │       │   │                         today earnings, quick stats,
  │   │       │   │                         recent transactions
  │   │       │   │
  │   │       │   ├── plans.tsx           Investment plan listing
  │   │       │   │                       Shows all active plans with price,
  │   │       │   │                         daily profit %, duration, purchase btn
  │   │       │   │
  │   │       │   ├── wallet.tsx          Wallet management page
  │   │       │   │                       Tabs: Balance, Deposit, Withdraw, History
  │   │       │   │                       Shows all 5 balance types separately
  │   │       │   │
  │   │       │   ├── referral.tsx        Referral program page
  │   │       │   │                       Shows: referral code, share link, QR code
  │   │       │   │                         Team members (L1/L2/L3), commission history
  │   │       │   │
  │   │       │   ├── tasks.tsx           Daily tasks listing
  │   │       │   │                       Each task: title, reward, link, complete btn
  │   │       │   │
  │   │       │   ├── notifications.tsx   Notifications list, mark as read
  │   │       │   │
  │   │       │   ├── profile.tsx         Edit nickname, avatar, change password
  │   │       │   │
  │   │       │   ├── support.tsx         Chat-style support messaging
  │   │       │   │                       User sends message, admin replies in panel
  │   │       │   │
  │   │       │   └── admin/
  │   │       │       ├── index.tsx       Admin dashboard
  │   │       │       │                   Stats: online users, today deposits,
  │   │       │       │                     today withdrawals, total revenue,
  │   │       │       │                     total profit, pending counts
  │   │       │       │                   Charts: revenue over time (Recharts)
  │   │       │       │
  │   │       │       ├── users.tsx       User management table
  │   │       │       │                   View all users, search, filter
  │   │       │       │                   Actions: suspend, unsuspend, delete,
  │   │       │       │                     promote to admin, edit balance
  │   │       │       │
  │   │       │       ├── plans.tsx       Investment plan CRUD
  │   │       │       │                   Create/edit: name, image, price,
  │   │       │       │                     daily rate, duration, max purchases,
  │   │       │       │                     description, active toggle
  │   │       │       │
  │   │       │       ├── deposits.tsx    Pending deposit approvals
  │   │       │       │                   Table: user, amount, method, reference
  │   │       │       │                   Actions: Approve (credits balance) /
  │   │       │       │                     Reject (adds notes)
  │   │       │       │
  │   │       │       ├── withdrawals.tsx Pending withdrawal approvals
  │   │       │       │                   Table: user, amount, fee, net amount,
  │   │       │       │                     wallet type, account details
  │   │       │       │                   Actions: Approve / Reject
  │   │       │       │
  │   │       │       ├── tasks.tsx       Task CRUD management
  │   │       │       │                   Fields: title, description, type,
  │   │       │       │                     link, reward, active toggle
  │   │       │       │
  │   │       │       ├── support.tsx     Admin support inbox
  │   │       │       │                   View all user messages
  │   │       │       │                   Reply to tickets from panel
  │   │       │       │
  │   │       │       ├── settings.tsx    Platform settings editor
  │   │       │       │                   Site name, withdrawal fee %,
  │   │       │       │                     min deposit, min withdrawal,
  │   │       │       │                     referral rates, maintenance mode
  │   │       │       │
  │   │       │       └── payment-methods.tsx
  │   │       │                           Payment method CRUD
  │   │       │                           Fields: name, type, account number,
  │   │       │                             account title, active toggle
  │   │       │
  │   │       ├── components/
  │   │       │   ├── ui/              50+ shadcn/ui components:
  │   │       │   │                    accordion, alert, alert-dialog, aspect-ratio,
  │   │       │   │                    avatar, badge, breadcrumb, button, calendar,
  │   │       │   │                    card, carousel, chart, checkbox, collapsible,
  │   │       │   │                    command, context-menu, dialog, drawer, dropdown-menu,
  │   │       │   │                    form, hover-card, input, input-otp, label,
  │   │       │   │                    menubar, navigation-menu, pagination, popover,
  │   │       │   │                    progress, radio-group, resizable, scroll-area,
  │   │       │   │                    select, separator, sheet, skeleton, slider,
  │   │       │   │                    sonner (toasts), switch, table, tabs, textarea,
  │   │       │   │                    toggle, toggle-group, tooltip
  │   │       │   │
  │   │       │   ├── app-layout.tsx   Standard user page shell
  │   │       │   │                    Header + bottom navigation for mobile
  │   │       │   │
  │   │       │   ├── admin-layout.tsx Admin page shell with sidebar navigation
  │   │       │   │
  │   │       │   ├── bottom-nav.tsx   Mobile bottom navigation bar
  │   │       │   │                    Links: Home, Plans, Wallet, Referral, Profile
  │   │       │   │
  │   │       │   └── install-app-button.tsx  PWA install prompt button
  │   │       │
  │   │       ├── hooks/
  │   │       │   ├── use-mobile.tsx     Returns true if viewport < 768px
  │   │       │   ├── use-toast.ts       Toast notification hook
  │   │       │   └── use-pwa-install.ts PWA install event handler
  │   │       │
  │   │       └── lib/
  │   │           ├── api-setup.ts    Configures API client token getter
  │   │           │                   setAuthTokenGetter(()=>
  │   │           │                     localStorage.getItem("cw_token"))
  │   │           │
  │   │           └── utils.ts       cn() helper: clsx + tailwind-merge
  │   │
  │   └── mockup-sandbox/           ← Design/component preview server
  │       (Used internally by Replit for UI prototyping — not end-user facing)
  │
  ├── lib/                          ← Shared libraries (no app code)
  │   │
  │   ├── db/                       ← Database schema & ORM
  │   │   ├── package.json          ← @workspace/db
  │   │   │                           Scripts: push (drizzle-kit push)
  │   │   ├── drizzle.config.ts     ← Drizzle config:
  │   │   │                           dialect: postgresql
  │   │   │                           schema: ./src/schema/index.ts
  │   │   │                           dbCredentials: DATABASE_URL env var
  │   │   │
  │   │   └── src/
  │   │       └── schema/
  │   │           ├── index.ts          Re-exports all table definitions
  │   │           ├── users.ts          Users table (see Section 05)
  │   │           ├── sessions.ts       Sessions table
  │   │           ├── plans.ts          Investment plans table
  │   │           ├── purchased-plans.ts Purchased plans table
  │   │           ├── deposits.ts       Deposits table
  │   │           ├── withdrawals.ts    Withdrawals table
  │   │           ├── transactions.ts   Transactions log table
  │   │           ├── referrals.ts      Referral relationships table
  │   │           ├── commissions.ts    Commission earnings table
  │   │           ├── tasks.ts          Tasks table
  │   │           ├── task-completions.ts Task completions table
  │   │           ├── notifications.ts  Notifications table
  │   │           ├── support-messages.ts Support chat messages
  │   │           ├── system-settings.ts Platform settings (single row)
  │   │           ├── banners.ts        Banner images table
  │   │           ├── payment-methods.ts Payment method options
  │   │           └── bank-accounts.ts  User bank accounts
  │   │
  │   ├── api-spec/                 ← OpenAPI specification (source of truth)
  │   │   ├── openapi.yaml          ← All API contracts defined here
  │   │   │                           Covers: auth, dashboard, plans, wallet,
  │   │   │                             referral, tasks, notifications, profile,
  │   │   │                             support, admin
  │   │   └── orval.config.ts       ← Orval codegen config
  │   │                               Input: openapi.yaml
  │   │                               Output 1: lib/api-client-react (React Query hooks)
  │   │                               Output 2: lib/api-zod (Zod schemas)
  │   │
  │   ├── api-client-react/         ← Generated frontend API client
  │   │   └── src/
  │   │       ├── index.ts           Re-exports everything
  │   │       ├── custom-fetch.ts    Custom fetch wrapper
  │   │       │                      Features:
  │   │       │                        - Base URL injection (setBaseUrl)
  │   │       │                        - Bearer token auth (setAuthTokenGetter)
  │   │       │                        - BOM stripping from JSON responses
  │   │       │                        - ApiError class with response + requestInfo
  │   │       │                        - ResponseParseError for bad JSON
  │   │       │                        - Auto content-type: application/json
  │   │       │                        - NO_BODY_STATUS: 204, 205, 304
  │   │       │
  │   │       └── generated/
  │   │           ├── api.ts         React Query hooks (DO NOT HAND-EDIT)
  │   │           │                  Examples: useLogin, useRegister,
  │   │           │                    useGetDashboard, useGetPlans,
  │   │           │                    usePurchasePlan, useGetWallet,
  │   │           │                    useDeposit, useWithdraw, useGetReferral,
  │   │           │                    useGetTasks, useCompleteTask,
  │   │           │                    useGetAdminStats, useGetAdminUsers,
  │   │           │                    useUpdateUser, useApproveDeposit, etc.
  │   │           └── api.schemas.ts  Zod schemas for all request/response types
  │   │
  │   └── api-zod/                  ← Generated Zod validation schemas
  │       └── src/
  │           ├── index.ts           Re-exports all schemas
  │           └── generated/
  │               ├── api.ts         Route-level Zod schemas
  │               └── types/         Per-model Zod schemas (User, Plan, Deposit...)
  │
  └── scripts/
      ├── package.json              ← @workspace/scripts
      ├── tsconfig.json
      ├── post-merge.sh             ← Auto-runs after task agent merges:
      │                               1. pnpm install (installs new deps)
      │                               2. pnpm --filter db push (applies schema)
      └── src/                      ← Additional automation scripts


================================================================================
  05. DATABASE — COMPLETE SCHEMA (EVERY TABLE, COLUMN, TYPE, CONSTRAINT)
================================================================================

  DATABASE ENGINE: PostgreSQL 16
  ORM: Drizzle ORM
  All timestamps: PostgreSQL TIMESTAMP (not TIMESTAMPTZ)
  All money: numeric(18,2) — 18 digits total, 2 decimal places
  All rates: numeric(8,4) — 8 digits total, 4 decimal places

  ════════════════════════════════════════════════════════════════════════════
  TABLE: users
  Purpose: Core user accounts. Every person who registers gets one row.
  ════════════════════════════════════════════════════════════════════════════

  Column            Type              Null  Default   Constraints
  ─────────────────────────────────────────────────────────────────────────
  id                SERIAL            NO    auto      PRIMARY KEY
  phone             TEXT              NO    —         UNIQUE NOT NULL
                                                      Used as username
  nickname          TEXT              NO    —         Display name
  email             TEXT              YES   NULL      Optional
  password_hash     TEXT              NO    —         scrypt "salt:hash" format
  avatar_url        TEXT              YES   NULL      Profile picture URL
  referral_code     TEXT              NO    —         UNIQUE — e.g. "F2B654B0"
                                                      Generated on registration
  referred_by       TEXT              YES   NULL      Referral code of who
                                                      invited this user
  is_admin          BOOLEAN           NO    false     Admin access flag
  is_suspended      BOOLEAN           NO    false     Account ban flag
  wallet_balance    NUMERIC(18,2)     NO    0         Legacy — not used for display
  deposit_balance   NUMERIC(18,2)     NO    0         Balance from approved deposits
  withdraw_balance  NUMERIC(18,2)     NO    0         Balance from withdrawals
  profit_balance    NUMERIC(18,2)     NO    0         Balance from plan profits
  commission_balance NUMERIC(18,2)   NO    0         Balance from referral commissions
  created_at        TIMESTAMP         NO    now()     Registration time
  updated_at        TIMESTAMP         NO    now()     Last update time

  IMPORTANT: totalBalance shown in wallet UI =
    deposit_balance + withdraw_balance + profit_balance + commission_balance
    (wallet_balance is NOT included in the sum)

  ════════════════════════════════════════════════════════════════════════════
  TABLE: sessions
  Purpose: Stores active login sessions. Token-based auth (not JWT).
  ════════════════════════════════════════════════════════════════════════════

  Column        Type          Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL        NO    auto     PRIMARY KEY
  user_id       INTEGER       NO    —        FK → users.id ON DELETE CASCADE
  token         TEXT          NO    —        UNIQUE — raw token stored in DB
                                             Sent to client as Bearer token
  expires_at    TIMESTAMP     NO    —        When the session expires
  created_at    TIMESTAMP     NO    now()    When session was created

  NOTE: The client stores this token in localStorage under key "cw_token"
  NOTE: Every login creates a new session row
  NOTE: Logout deletes the session row

  ════════════════════════════════════════════════════════════════════════════
  TABLE: plans
  Purpose: Investment plan definitions created by admin.
  ════════════════════════════════════════════════════════════════════════════

  Column              Type           Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id                  SERIAL         NO    auto     PRIMARY KEY
  name                TEXT           NO    —        Plan display name
  image_url           TEXT           YES   NULL     Plan banner/thumbnail image
  price               NUMERIC(18,2)  NO    —        Cost to purchase (PKR)
  daily_profit_rate   NUMERIC(8,4)   NO    —        Daily % return e.g. 0.0250 = 2.5%
  duration_days       INTEGER        NO    —        How many days plan runs
  max_purchases       INTEGER        YES   NULL     Max allowed purchases (NULL=unlimited)
  current_purchases   INTEGER        NO    0        How many have been purchased
  description         TEXT           YES   NULL     Plan description text
  is_active           BOOLEAN        NO    true     Whether plan is purchasable
  created_at          TIMESTAMP      NO    now()

  EXAMPLE: price=5000, daily_profit_rate=0.0250, duration_days=30
    → User pays 5000 PKR
    → Earns 5000 × 0.025 = 125 PKR per day
    → Total earnings over 30 days: 3750 PKR
    → ROI: 75%

  ════════════════════════════════════════════════════════════════════════════
  TABLE: purchased_plans
  Purpose: Each time a user buys a plan, one row is created here.
  ════════════════════════════════════════════════════════════════════════════

  Column        Type           Null  Default   Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL         NO    auto      PRIMARY KEY
  plan_id       INTEGER        NO    —         FK → plans.id
  user_id       INTEGER        NO    —         FK → users.id ON DELETE CASCADE
  start_date    TIMESTAMP      NO    —         When plan started
  end_date      TIMESTAMP      NO    —         When plan expires
  total_earned  NUMERIC(18,2)  NO    0         Cumulative profit credited so far
  status        TEXT           NO    "active"  active | completed | cancelled
  created_at    TIMESTAMP      NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: deposits
  Purpose: Every deposit request submitted by a user.
  ════════════════════════════════════════════════════════════════════════════

  Column          Type           Null  Default    Constraints
  ─────────────────────────────────────────────────────────────────────────
  id              SERIAL         NO    auto       PRIMARY KEY
  user_id         INTEGER        NO    —          FK → users.id ON DELETE CASCADE
  amount          NUMERIC(18,2)  NO    —          Deposited amount (PKR)
  currency        TEXT           NO    "PKR"      Currency code
  payment_method  TEXT           YES   NULL       e.g. "JazzCash", "EasyPaisa", "Bank"
  voucher_url     TEXT           YES   NULL       Screenshot/receipt image URL
  status          TEXT           NO    "pending"  pending | approved | rejected
  notes           TEXT           YES   NULL       Admin rejection reason or notes
  created_at      TIMESTAMP      NO    now()
  updated_at      TIMESTAMP      NO    now()

  FLOW: User submits deposit → status=pending → Admin reviews →
        Approve: user.deposit_balance += amount, commissions triggered
        Reject:  status=rejected, notes added, balance unchanged

  ════════════════════════════════════════════════════════════════════════════
  TABLE: withdrawals
  Purpose: Every withdrawal request submitted by a user.
  ════════════════════════════════════════════════════════════════════════════

  Column          Type           Null  Default    Constraints
  ─────────────────────────────────────────────────────────────────────────
  id              SERIAL         NO    auto       PRIMARY KEY
  user_id         INTEGER        NO    —          FK → users.id ON DELETE CASCADE
  amount          NUMERIC(18,2)  NO    —          Requested withdrawal amount
  fee             NUMERIC(18,2)  YES   NULL       Platform fee (% from settings)
  net_amount      NUMERIC(18,2)  YES   NULL       amount - fee (what user receives)
  wallet_type     TEXT           YES   NULL       e.g. "JazzCash", "Bank Transfer"
  account_title   TEXT           YES   NULL       Account holder name
  iban            TEXT           YES   NULL       Bank IBAN number
  wallet_address  TEXT           YES   NULL       Mobile wallet number
  status          TEXT           NO    "pending"  pending | approved | rejected
  notes           TEXT           YES   NULL       Admin notes or rejection reason
  created_at      TIMESTAMP      NO    now()
  updated_at      TIMESTAMP      NO    now()

  FLOW: User requests withdrawal → status=pending → Admin reviews →
        Approve: user balance deducted, status=approved
        Reject:  status=rejected, balance restored, notes added

  ════════════════════════════════════════════════════════════════════════════
  TABLE: transactions
  Purpose: Immutable log of every balance-changing event.
  ════════════════════════════════════════════════════════════════════════════

  Column        Type           Null  Default      Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL         NO    auto         PRIMARY KEY
  user_id       INTEGER        NO    —            FK → users.id ON DELETE CASCADE
  type          TEXT           NO    —            Type identifier string:
                                                  "deposit", "withdrawal",
                                                  "profit", "commission",
                                                  "task_reward", "plan_purchase"
  amount        NUMERIC(18,2)  NO    —            Transaction amount
  description   TEXT           YES   NULL         Human-readable description
  status        TEXT           NO    "completed"  completed | pending | failed
  created_at    TIMESTAMP      NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: referrals
  Purpose: Records referral relationships between users (L1, L2, L3).
  ════════════════════════════════════════════════════════════════════════════

  Column        Type       Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL     NO    auto     PRIMARY KEY
  referrer_id   INTEGER    NO    —        FK → users.id ON DELETE CASCADE
                                          The user who referred someone
  referred_id   INTEGER    NO    —        FK → users.id ON DELETE CASCADE
                                          The user who was referred
  level         INTEGER    NO    —        1, 2, or 3
  created_at    TIMESTAMP  NO    now()

  EXAMPLE: If A referred B, and B referred C, and C referred D:
    Row 1: referrer=A, referred=B, level=1  (A earns 7% of B's deposits)
    Row 2: referrer=A, referred=C, level=2  (A earns 3% of C's deposits)
    Row 3: referrer=A, referred=D, level=3  (A earns 1% of D's deposits)
    Row 4: referrer=B, referred=C, level=1  (B earns 7% of C's deposits)
    Row 5: referrer=B, referred=D, level=2  (B earns 3% of D's deposits)
    Row 6: referrer=C, referred=D, level=1  (C earns 7% of D's deposits)

  ════════════════════════════════════════════════════════════════════════════
  TABLE: commissions
  Purpose: Records each commission payment earned by a referrer.
  ════════════════════════════════════════════════════════════════════════════

  Column        Type           Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL         NO    auto     PRIMARY KEY
  user_id       INTEGER        NO    —        FK → users.id (who EARNED the commission)
  from_user_id  INTEGER        NO    —        FK → users.id (whose deposit triggered it)
  level         INTEGER        NO    —        1, 2, or 3
  amount        NUMERIC(18,2)  NO    —        Commission amount in PKR
  description   TEXT           YES   NULL     e.g. "Level 1 commission from deposit"
  created_at    TIMESTAMP      NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: tasks
  Purpose: Earning tasks created by admin that users can complete.
  ════════════════════════════════════════════════════════════════════════════

  Column        Type           Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL         NO    auto     PRIMARY KEY
  title         TEXT           NO    —        Task name/title
  description   TEXT           YES   NULL     What user must do
  type          TEXT           YES   NULL     Task category (e.g. "social", "video")
  link          TEXT           YES   NULL     URL to complete task (e.g. YouTube video)
  reward        NUMERIC(18,2)  NO    —        Amount paid on completion (PKR)
  is_active     BOOLEAN        NO    true     Whether task is visible to users
  created_at    TIMESTAMP      NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: task_completions
  Purpose: Records when a user completed a task (prevents double-completion).
  ════════════════════════════════════════════════════════════════════════════

  Column        Type       Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id            SERIAL     NO    auto     PRIMARY KEY
  task_id       INTEGER    NO    —        FK → tasks.id ON DELETE CASCADE
  user_id       INTEGER    NO    —        FK → users.id ON DELETE CASCADE
  completed_at  TIMESTAMP  NO    now()

  UNIQUE constraint: (task_id, user_id) — one completion per user per task

  ════════════════════════════════════════════════════════════════════════════
  TABLE: notifications
  Purpose: In-app notifications sent to users (system or admin-triggered).
  ════════════════════════════════════════════════════════════════════════════

  Column      Type       Null  Default   Constraints
  ─────────────────────────────────────────────────────────────────────────
  id          SERIAL     NO    auto      PRIMARY KEY
  user_id     INTEGER    NO    —         FK → users.id ON DELETE CASCADE
  title       TEXT       NO    —         Notification heading
  message     TEXT       NO    —         Notification body
  type        TEXT       NO    "system"  system | deposit | withdrawal | etc.
  is_read     BOOLEAN    NO    false     Read/unread status
  created_at  TIMESTAMP  NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: support_messages
  Purpose: Chat-style support thread between user and admin.
  ════════════════════════════════════════════════════════════════════════════

  Column      Type       Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id          SERIAL     NO    auto     PRIMARY KEY
  user_id     INTEGER    NO    —        FK → users.id ON DELETE CASCADE
  message     TEXT       NO    —        Message content
  is_admin    BOOLEAN    NO    false    true = admin sent, false = user sent
  is_read     BOOLEAN    NO    false    Whether the recipient has read it
  created_at  TIMESTAMP  NO    now()

  NOTE: All messages from one user form a single thread.
  NOTE: Admin sees all users' threads in /admin/support.
  NOTE: is_admin=true messages appear as "admin reply" in user's support page.

  ════════════════════════════════════════════════════════════════════════════
  TABLE: system_settings
  Purpose: Single-row configuration table for platform-wide settings.
  ════════════════════════════════════════════════════════════════════════════

  Column                  Type           Null  Default        Notes
  ─────────────────────────────────────────────────────────────────────────
  id                      SERIAL         NO    auto           PRIMARY KEY
  site_name               TEXT           NO    "CloudsWork"   Platform name
  withdrawal_fee_percent  NUMERIC(8,2)   NO    2              e.g. 2 = 2%
  min_deposit             NUMERIC(18,2)  NO    500            Minimum deposit (PKR)
  min_withdrawal          NUMERIC(18,2)  NO    1000           Minimum withdrawal (PKR)
  referral_level1_rate    NUMERIC(8,2)   NO    7              L1 commission % (default 7%)
  referral_level2_rate    NUMERIC(8,2)   NO    3              L2 commission % (default 3%)
  referral_level3_rate    NUMERIC(8,2)   NO    1              L3 commission % (default 1%)
  maintenance_mode        BOOLEAN        NO    false          Locks all user actions
  updated_at              TIMESTAMP      NO    now()

  NOTE: Only ONE row exists in this table. Admin edits it via /admin/settings.
  NOTE: Commission rates here override the hardcoded defaults in commissions.ts

  ════════════════════════════════════════════════════════════════════════════
  TABLE: banners
  Purpose: Homepage/app banner images managed by admin.
  ════════════════════════════════════════════════════════════════════════════

  Column      Type       Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id          SERIAL     NO    auto     PRIMARY KEY
  image_url   TEXT       NO    —        Banner image URL
  title       TEXT       YES   NULL     Optional banner title/alt text
  link        TEXT       YES   NULL     Where banner click goes
  is_active   BOOLEAN    NO    true     Show/hide toggle
  order       INTEGER    NO    —        Display order (lower = first)
  created_at  TIMESTAMP  NO    now()

  ════════════════════════════════════════════════════════════════════════════
  TABLE: payment_methods
  Purpose: Payment options users can deposit into (managed by admin).
  ════════════════════════════════════════════════════════════════════════════

  Column          Type     Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id              SERIAL   NO    auto     PRIMARY KEY
  name            TEXT     NO    —        e.g. "JazzCash", "EasyPaisa", "HBL Bank"
  type            TEXT     YES   NULL     "mobile_wallet" | "bank" | etc.
  account_number  TEXT     YES   NULL     Account/wallet number
  account_title   TEXT     YES   NULL     Account holder name
  is_active       BOOLEAN  NO    true     Show/hide from deposit page

  ════════════════════════════════════════════════════════════════════════════
  TABLE: bank_accounts
  Purpose: User's saved bank accounts for withdrawals.
  ════════════════════════════════════════════════════════════════════════════

  Column         Type       Null  Default  Constraints
  ─────────────────────────────────────────────────────────────────────────
  id             SERIAL     NO    auto     PRIMARY KEY
  user_id        INTEGER    NO    —        FK → users.id ON DELETE CASCADE
  account_title  TEXT       NO    —        Account holder name
  iban           TEXT       NO    —        Bank IBAN number
  bank_name      TEXT       NO    —        Bank name
  is_default     BOOLEAN    NO    false    User's default withdrawal account
  created_at     TIMESTAMP  NO    now()


================================================================================
  06. DATABASE — RELATIONSHIPS & FOREIGN KEYS
================================================================================

  users (parent)
    ├──< sessions.user_id         (CASCADE DELETE — sessions deleted with user)
    ├──< deposits.user_id         (CASCADE DELETE)
    ├──< withdrawals.user_id      (CASCADE DELETE)
    ├──< transactions.user_id     (CASCADE DELETE)
    ├──< purchased_plans.user_id  (CASCADE DELETE)
    ├──< referrals.referrer_id    (CASCADE DELETE)
    ├──< referrals.referred_id    (CASCADE DELETE)
    ├──< commissions.user_id      (CASCADE DELETE)
    ├──< commissions.from_user_id (CASCADE DELETE)
    ├──< tasks (none — tasks are global)
    ├──< task_completions.user_id (CASCADE DELETE)
    ├──< notifications.user_id    (CASCADE DELETE)
    ├──< support_messages.user_id (CASCADE DELETE)
    └──< bank_accounts.user_id    (CASCADE DELETE)

  plans (parent)
    └──< purchased_plans.plan_id  (no cascade — plan deletion blocked if purchased)

  tasks (parent)
    └──< task_completions.task_id (CASCADE DELETE)

  NOTE: ON DELETE CASCADE means if a user is deleted, ALL their related data
        (sessions, deposits, withdrawals, plans, referrals, etc.) is also
        automatically deleted by the database.


================================================================================
  07. DATABASE — BALANCE SYSTEM EXPLAINED
================================================================================

  Every user has 5 balance columns in the users table. Here is what each one
  means and when money goes in/out:

  ┌─────────────────────┬──────────────────────────────────────────────────────┐
  │ Balance Column      │ When Money Goes IN                                   │
  ├─────────────────────┼──────────────────────────────────────────────────────┤
  │ deposit_balance     │ Admin approves a user's deposit request              │
  │ profit_balance      │ Daily profit from active investment plans (cron job) │
  │ commission_balance  │ Someone in your referral tree makes an approved dep. │
  │ withdraw_balance    │ ??? (legacy / unused in current flow)                │
  │ wallet_balance      │ Legacy column — not used in totalBalance display     │
  └─────────────────────┴──────────────────────────────────────────────────────┘

  ┌─────────────────────┬──────────────────────────────────────────────────────┐
  │ Balance Column      │ When Money Goes OUT                                  │
  ├─────────────────────┼──────────────────────────────────────────────────────┤
  │ deposit_balance     │ User purchases an investment plan                    │
  │ profit_balance      │ User requests a withdrawal                           │
  │ commission_balance  │ User requests a withdrawal                           │
  └─────────────────────┴──────────────────────────────────────────────────────┘

  TOTAL BALANCE (shown in /wallet):
    totalBalance = deposit_balance + withdraw_balance + profit_balance + commission_balance

  The /api/wallet endpoint computes and returns this sum, not wallet_balance.


================================================================================
  08. DATABASE — HOW DATA FLOWS THROUGH THE SYSTEM
================================================================================

  ── REGISTRATION FLOW ──────────────────────────────────────────────────────────
  1. User submits: phone, password, confirmPassword, nickname, [referralCode]
  2. API validates all fields (Zod schema)
  3. Generates unique 8-character referral code for new user
  4. Hashes password with scrypt (random 16-byte salt)
  5. Inserts row into users table
  6. If referralCode provided:
     a. Finds user with that referral_code (this is user's L1 referrer)
     b. Finds L1's referred_by → L2 referrer
     c. Finds L2's referred_by → L3 referrer
     d. Inserts into referrals: (L1, newUser, level=1)
     e. Inserts into referrals: (L2, newUser, level=2) if L2 exists
     f. Inserts into referrals: (L3, newUser, level=3) if L3 exists
  7. Creates session token, stores in sessions table
  8. Returns token + user object to client
  9. Client stores token in localStorage["cw_token"]

  ── LOGIN FLOW ─────────────────────────────────────────────────────────────────
  1. Rate limiter checks: max 10 attempts / 15min for this IP+phone
  2. Finds user by phone number
  3. Verifies password (scrypt first, SHA-256 fallback for legacy hashes)
  4. Checks is_suspended — if true, returns 403 Forbidden
  5. Generates random session token
  6. Stores in sessions table with expiry date
  7. Returns token + user object

  ── DEPOSIT FLOW ───────────────────────────────────────────────────────────────
  1. User fills deposit form: amount, payment_method, uploads voucher image
  2. POST /api/wallet/deposit creates row in deposits (status=pending)
  3. Creates notification for user: "Deposit request submitted"
  4. Admin sees deposit in /admin/deposits
  5. Admin clicks Approve:
     a. deposits.status = "approved"
     b. users.deposit_balance += amount
     c. Creates transactions row (type="deposit")
     d. Walks referrals table for depositing user's upline
     e. For each referrer (up to 3 levels):
        - Calculates commission: amount × rate (7%/3%/1%)
        - referrer.commission_balance += commission
        - Inserts commissions row
        - Creates transactions row for referrer (type="commission")
     f. Creates notification for user: "Deposit approved"
  6. Admin clicks Reject:
     a. deposits.status = "rejected"
     b. deposits.notes = rejection reason
     c. User balance unchanged
     d. Creates notification for user: "Deposit rejected"

  ── WITHDRAWAL FLOW ────────────────────────────────────────────────────────────
  1. User fills withdrawal form: amount, wallet_type, account details
  2. System checks: amount >= min_withdrawal (from system_settings)
  3. System calculates fee: amount × withdrawal_fee_percent / 100
  4. net_amount = amount - fee
  5. System checks user has sufficient balance
  6. User's balance DEDUCTED immediately on request
  7. POST /api/wallet/withdraw creates row in withdrawals (status=pending)
  8. Admin reviews, approves or rejects
  9. On rejection: balance is restored

  ── PLAN PURCHASE FLOW ─────────────────────────────────────────────────────────
  1. User clicks "Purchase" on a plan
  2. POST /api/plans/:id/purchase
  3. Checks: plan is_active, user has sufficient balance
  4. Checks: max_purchases not exceeded (if set)
  5. Deducts plan price from user's deposit_balance
  6. Creates purchased_plans row:
     start_date = now(), end_date = now() + duration_days
  7. Increments plans.current_purchases
  8. Creates transactions row (type="plan_purchase")

  ── TASK COMPLETION FLOW ───────────────────────────────────────────────────────
  1. User clicks "Complete" on a task
  2. Checks: task_completions has no row for (task_id, user_id)
  3. Adds task reward to user's profit_balance
  4. Creates task_completions row
  5. Creates transactions row (type="task_reward")
  6. Creates notification: "Task completed, reward credited"


================================================================================
  09. AUTHENTICATION SYSTEM (FULL DETAIL)
================================================================================

  TOKEN TYPE: Opaque random token (NOT JWT)
    - Generated with: crypto.randomBytes(32).toString("hex")
    - Stored directly in sessions table
    - No expiry decoding needed — just DB lookup
    - Token is revoked by deleting session row (logout)

  CLIENT STORAGE:
    - localStorage key: "cw_token"
    - Sent as: Authorization: Bearer <token>
    - Set up in: artifacts/cloudswork/src/lib/api-setup.ts

  SERVER VERIFICATION (auth.ts middleware):
    1. Read Authorization header
    2. Extract token from "Bearer <token>"
    3. Look up sessions table WHERE token = $1
    4. Check expires_at > now()
    5. Join with users table to get user object
    6. Attach user to req.user
    7. If any step fails: return 401 Unauthorized

  ADMIN CHECK (requireAdmin middleware):
    1. Runs AFTER authenticateToken
    2. Checks req.user.isAdmin === true
    3. If false: return 403 Forbidden

  PASSWORD HASHING:
    New passwords (scrypt):
      - Generate 16 random bytes → hex salt (32 chars)
      - scrypt(password, salt, 64) → 64-byte hash → hex (128 chars)
      - Stored as: "salt:hash" (161 chars total)

    Legacy passwords (SHA-256, backward compat):
      - SHA-256(password + STATIC_SALT)
      - Identified by hash format (not "salt:hash" format)
      - Verified for existing users, then rehashed with scrypt on success

  RATE LIMITING (login only):
    - Library: custom in-memory rate limiter
    - Max attempts: 10
    - Window: 15 minutes
    - Key: IP_ADDRESS + ":" + phone_number
    - On exceed: HTTP 429 Too Many Requests
    - Auto-resets after window expires

  ROUTE PROTECTION:
    - Public routes: /auth/login, /auth/register, /auth/forgot-password, /api/healthz
    - Protected routes: ALL others require authenticateToken
    - Admin routes: require authenticateToken + requireAdmin

  FRONTEND GUARDS (wouter-based):
    - ProtectedRoute: redirects to /login if localStorage["cw_token"] is empty
    - AdminRoute: checks token + user.isAdmin, redirects non-admins to /dashboard
    - GuestRoute: redirects logged-in users away from /login and /register


================================================================================
  10. API ROUTES — COMPLETE REFERENCE (EVERY ENDPOINT)
================================================================================

  BASE URL: /api
  All routes return JSON. Errors return: { error: "message" }
  Auth required: All routes except those marked [PUBLIC]

  ── HEALTH ─────────────────────────────────────────────────────────────────────
  GET  /api/healthz                [PUBLIC]
       Returns: { status: "ok", timestamp: "ISO-8601" }
       Used by: Replit health monitoring

  ── AUTHENTICATION ─────────────────────────────────────────────────────────────
  POST /api/auth/register          [PUBLIC]
       Body: { phone, password, confirmPassword, nickname, referralCode? }
       Returns: { token, user }
       Creates: users row, sessions row, referrals rows (if referralCode)

  POST /api/auth/login             [PUBLIC] [RATE LIMITED: 10/15min]
       Body: { phone, password }
       Returns: { token, user }
       Errors: 401 wrong credentials, 403 suspended, 429 rate limited

  POST /api/auth/logout            [AUTH]
       Deletes current session from DB
       Returns: { success: true }

  POST /api/auth/forgot-password   [PUBLIC]
       Body: { phone }
       Returns: { message }
       (Implementation may vary — sends reset instructions)

  GET  /api/auth/me                [AUTH]
       Returns: current user object (without password_hash)

  ── DASHBOARD ──────────────────────────────────────────────────────────────────
  GET  /api/dashboard              [AUTH]
       Returns: {
         totalBalance,
         depositBalance, profitBalance, commissionBalance,
         activePlans,        ← count of purchased_plans where status=active
         todayEarnings,      ← today's profit credits
         totalReferrals,     ← count from referrals where referrer_id=me
         pendingDeposits,    ← count of my pending deposits
         recentTransactions  ← last 10 transactions
       }

  ── INVESTMENT PLANS ───────────────────────────────────────────────────────────
  GET  /api/plans                  [AUTH]
       Returns: array of plans where is_active=true
       Each plan: { id, name, imageUrl, price, dailyProfitRate,
                    durationDays, maxPurchases, currentPurchases, description }

  POST /api/plans/:id/purchase     [AUTH]
       Body: {} (planId from URL)
       Validates: plan exists, is_active, balance sufficient, max not exceeded
       Returns: { purchasedPlan, updatedBalance }

  ── WALLET ─────────────────────────────────────────────────────────────────────
  GET  /api/wallet                 [AUTH]
       Returns: {
         depositBalance,
         profitBalance,
         commissionBalance,
         withdrawBalance,
         totalBalance,           ← sum of all 4 above
         pendingDeposits,        ← list of user's pending deposits
         pendingWithdrawals      ← list of user's pending withdrawals
       }

  POST /api/wallet/deposit         [AUTH]
       Body: { amount, paymentMethod, voucherUrl? }
       Validates: amount >= min_deposit (from system_settings)
       Returns: { deposit } (status=pending)

  POST /api/wallet/withdraw        [AUTH]
       Body: { amount, walletType, accountTitle, iban?, walletAddress? }
       Validates: amount >= min_withdrawal, sufficient balance
       Calculates: fee = amount × withdrawal_fee_percent / 100
       Deducts balance immediately
       Returns: { withdrawal } (status=pending)

  GET  /api/wallet/transactions    [AUTH]
       Query params: page?, limit?, type?
       Returns: paginated transactions array

  ── REFERRAL ───────────────────────────────────────────────────────────────────
  GET  /api/referral               [AUTH]
       Returns: {
         referralCode,
         referralLink,           ← APP_URL + /register?ref=CODE
         totalReferrals,
         totalCommissions,       ← sum of all commission amounts
         commissionBalance,      ← current balance from commissions
         team: {
           level1: [users...],   ← direct referrals
           level2: [users...],   ← referrals of referrals
           level3: [users...]    ← 3 levels deep
         },
         commissionHistory       ← recent commissions array
       }

  ── TASKS ──────────────────────────────────────────────────────────────────────
  GET  /api/tasks                  [AUTH]
       Returns: all active tasks + completion status for current user
       Each task: { id, title, description, type, link, reward, completed }

  POST /api/tasks/:id/complete     [AUTH]
       Validates: task exists, is_active, not already completed
       Credits: profit_balance += reward
       Returns: { success, newBalance }

  ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
  GET  /api/notifications          [AUTH]
       Returns: user's notifications, newest first

  PATCH /api/notifications/:id/read  [AUTH]
       Marks notification as read (is_read=true)

  ── PROFILE ────────────────────────────────────────────────────────────────────
  GET  /api/profile                [AUTH]
       Returns: user object (no password_hash)

  PATCH /api/profile               [AUTH]
       Body: { nickname?, avatarUrl? }
       Returns: updated user object

  POST /api/profile/change-password  [AUTH]
       Body: { currentPassword, newPassword, confirmPassword }
       Validates: currentPassword correct, newPassword === confirmPassword
       Rehashes with scrypt
       Returns: { success: true }

  ── SUPPORT ────────────────────────────────────────────────────────────────────
  GET  /api/support                [AUTH]
       Returns: all support_messages for current user (both sent and received)

  POST /api/support                [AUTH]
       Body: { message }
       Creates: support_messages row (is_admin=false)
       Returns: { message }

  ── ADMIN — STATS ──────────────────────────────────────────────────────────────
  GET  /api/admin/stats            [ADMIN]
       Returns: {
         onlineUsers,        ← users with active sessions in last 15min
         todayDeposit,       ← sum of approved deposits today
         todayWithdrawal,    ← sum of approved withdrawals today
         totalRevenue,       ← all-time approved deposits sum
         totalProfit,        ← all-time profit credits sum
         pendingDeposits,    ← count of pending deposits
         pendingWithdrawals  ← count of pending withdrawals
       }

  ── ADMIN — USERS ──────────────────────────────────────────────────────────────
  GET    /api/admin/users          [ADMIN]
         Returns: all users (paginated), with balance info

  POST   /api/admin/users          [ADMIN]
         Body: { phone, password, nickname, isAdmin? }
         Creates new user (admin can create accounts)

  PATCH  /api/admin/users/:id      [ADMIN]
         Body: { isSuspended?, isAdmin?, nickname?, depositBalance? }
         Can suspend users, promote to admin, adjust balances

  DELETE /api/admin/users/:id      [ADMIN]
         Deletes user and ALL related data (CASCADE)

  ── ADMIN — PLANS ──────────────────────────────────────────────────────────────
  GET    /api/admin/plans          [ADMIN]
         Returns all plans (including inactive)

  POST   /api/admin/plans          [ADMIN]
         Body: { name, price, dailyProfitRate, durationDays, isActive,
                 imageUrl?, maxPurchases?, description? }

  PATCH  /api/admin/plans/:id      [ADMIN]
         Update any plan field

  DELETE /api/admin/plans/:id      [ADMIN]
         Delete plan (blocked if purchased_plans exist)

  ── ADMIN — DEPOSITS ───────────────────────────────────────────────────────────
  GET  /api/admin/deposits         [ADMIN]
       Query: status? (default: pending)
       Returns all deposits with user info

  POST /api/admin/deposits/:id/approve  [ADMIN]
       Credits user.deposit_balance, triggers commissions, sends notification

  POST /api/admin/deposits/:id/reject   [ADMIN]
       Body: { notes? }
       Sets status=rejected, saves rejection reason

  ── ADMIN — WITHDRAWALS ────────────────────────────────────────────────────────
  GET  /api/admin/withdrawals      [ADMIN]
       Returns all withdrawals with user info

  POST /api/admin/withdrawals/:id/approve  [ADMIN]
       Confirms withdrawal as paid out

  POST /api/admin/withdrawals/:id/reject   [ADMIN]
       Body: { notes? }
       Restores user balance, sets status=rejected

  ── ADMIN — TASKS ──────────────────────────────────────────────────────────────
  GET    /api/admin/tasks          [ADMIN]    Returns all tasks
  POST   /api/admin/tasks          [ADMIN]    Create new task
  PATCH  /api/admin/tasks/:id      [ADMIN]    Update task
  DELETE /api/admin/tasks/:id      [ADMIN]    Delete task

  ── ADMIN — SUPPORT ────────────────────────────────────────────────────────────
  GET  /api/admin/support          [ADMIN]
       Returns all users who have sent support messages

  POST /api/admin/support/:userId/reply  [ADMIN]
       Body: { message }
       Shape: { userId (path), data: { message } }
       Creates support_messages row (is_admin=true)

  ── ADMIN — SETTINGS ───────────────────────────────────────────────────────────
  GET   /api/admin/settings        [ADMIN]    Returns system_settings row
  PATCH /api/admin/settings        [ADMIN]    Update settings (any field)

  ── ADMIN — PAYMENT METHODS ────────────────────────────────────────────────────
  GET    /api/admin/payment-methods    [ADMIN]    List all
  POST   /api/admin/payment-methods    [ADMIN]    Create
  PATCH  /api/admin/payment-methods/:id [ADMIN]   Update
  DELETE /api/admin/payment-methods/:id [ADMIN]   Delete


================================================================================
  11. BUSINESS LOGIC — INVESTMENT PLANS SYSTEM
================================================================================

  HOW IT WORKS:
  ─────────────
  1. Admin creates investment plans (e.g. "Starter Plan", "Gold Plan")
  2. Each plan has: price (cost), daily_profit_rate (%), duration_days
  3. User purchases a plan — money deducted from their balance
  4. Every day, user earns: price × daily_profit_rate added to profit_balance
  5. After duration_days, plan status becomes "completed"

  EXAMPLE PLANS:
  ─────────────
  Starter Plan:  Price=1000  PKR, Daily=1.5%,  Duration=30 days → earns 450 PKR
  Silver Plan:   Price=5000  PKR, Daily=2.5%,  Duration=30 days → earns 3750 PKR
  Gold Plan:     Price=10000 PKR, Daily=3.0%,  Duration=30 days → earns 9000 PKR
  Diamond Plan:  Price=50000 PKR, Daily=5.0%,  Duration=30 days → earns 75000 PKR

  PROFIT DISTRIBUTION:
  ───────────────────
  A scheduled job (cron) or manual trigger runs daily profit distribution:
  - Finds all purchased_plans where status=active AND end_date > now()
  - For each: user.profit_balance += plan.price × plan.daily_profit_rate
  - Updates purchased_plans.total_earned
  - Creates transactions row (type="profit")
  - On end_date reached: status → "completed"


================================================================================
  12. BUSINESS LOGIC — WALLET, DEPOSIT & WITHDRAWAL SYSTEM
================================================================================

  DEPOSIT PROCESS (Step by Step):
  ───────────────────────────────
  User Side:
  1. Goes to /wallet → Deposit tab
  2. Sees available payment methods (from payment_methods table)
  3. Enters amount (must be >= system_settings.min_deposit, default 500 PKR)
  4. Selects payment method (e.g. JazzCash, EasyPaisa, Bank Transfer)
  5. Transfers money to platform's account
  6. Uploads voucher/screenshot as proof
  7. Submits form → POST /api/wallet/deposit
  8. Sees "Pending" status in history

  Admin Side:
  1. Goes to /admin/deposits
  2. Sees deposit with user info, amount, method, voucher image
  3. Verifies payment received in real account
  4. Clicks "Approve" or "Reject"

  WITHDRAWAL PROCESS (Step by Step):
  ─────────────────────────────────
  User Side:
  1. Goes to /wallet → Withdraw tab
  2. Enters amount (must be >= 1000 PKR, must have enough balance)
  3. Selects wallet type (JazzCash, Bank Transfer, etc.)
  4. Enters account details (IBAN for bank, wallet number for mobile)
  5. System shows fee deduction: e.g. 2% on 10000 = 200 fee, receives 9800
  6. Submits → balance IMMEDIATELY deducted
  7. Withdrawal shows as "Pending" in history

  Admin Side:
  1. Goes to /admin/withdrawals
  2. Sees withdrawal with user's account details
  3. Sends money manually to user's account
  4. Clicks "Approve" to confirm payment sent
  5. On rejection: user's balance is restored

  FEES:
  ────
  Withdrawal fee: system_settings.withdrawal_fee_percent (default 2%)
  No fee on deposits
  No fee on plan purchases


================================================================================
  13. BUSINESS LOGIC — 3-LEVEL REFERRAL & COMMISSION SYSTEM
================================================================================

  HOW TO REFER:
  ─────────────
  1. User copies their referral link: APP_URL/register?ref=MYCODE
  2. New user registers using this link
  3. New user's referred_by = referring user's referral_code
  4. referrals table rows created for all upline levels

  COMMISSION RATES (from system_settings, configurable by admin):
  ───────────────────────────────────────────────────────────────
  Level 1 (direct referral):       7%  (default)
  Level 2 (referral's referral):   3%  (default)
  Level 3 (3 levels deep):         1%  (default)

  WHEN COMMISSIONS ARE PAID:
  ──────────────────────────
  ONLY when an admin APPROVES a deposit.
  Other events do NOT trigger commissions:
    - Plan purchases: NO commission
    - Task completions: NO commission
    - Profit credits: NO commission

  COMMISSION CALCULATION EXAMPLE:
  ─────────────────────────────────
  Chain: Ahmad → Bilal → Chandra → Dawood
  Dawood deposits 10,000 PKR and admin approves it.

  Chandra (L1 to Dawood): earns 10,000 × 7% = 700 PKR → commission_balance += 700
  Bilal   (L2 to Dawood): earns 10,000 × 3% = 300 PKR → commission_balance += 300
  Ahmad   (L3 to Dawood): earns 10,000 × 1% = 100 PKR → commission_balance += 100

  All three get:
    - commissions row inserted
    - transactions row (type="commission")
    - Notification: "Commission earned from referral"

  WHERE IT SHOWS:
  ───────────────
  - /referral page: shows team members and commission history
  - /wallet: commission_balance shown separately, included in totalBalance


================================================================================
  14. BUSINESS LOGIC — TASK & REWARD SYSTEM
================================================================================

  Admin creates tasks with:
  - Title (e.g. "Subscribe to our YouTube channel")
  - Description (instructions)
  - Link (where to complete the task)
  - Reward (PKR amount)
  - Type (category: social, video, survey, etc.)
  - is_active toggle (visible to users or hidden)

  User flow:
  1. Goes to /tasks
  2. Sees available tasks with rewards
  3. Clicks task link (opens YouTube/social page)
  4. Clicks "Complete" button
  5. Reward instantly added to profit_balance
  6. Task marked as completed (can't complete same task twice)
  7. Notification sent: "Task reward credited"

  CONSTRAINT: Each user can complete each task exactly ONCE
  (enforced by UNIQUE constraint on task_completions(task_id, user_id))


================================================================================
  15. BUSINESS LOGIC — ADMIN PANEL (EVERY FEATURE)
================================================================================

  /admin — DASHBOARD
  ──────────────────
  Live Stats Cards:
    ► Online Users        — sessions active in last 15 minutes
    ► Today's Deposits    — sum of approved deposits today (PKR)
    ► Today's Withdrawals — sum of approved withdrawals today (PKR)
    ► Total Revenue       — all-time approved deposits (PKR)
    ► Total Profit        — all-time profit credited to users (PKR)
    ► Pending Deposits    — count needing approval
    ► Pending Withdrawals — count needing approval

  Revenue Chart (Recharts bar/line chart):
    ► Daily revenue over configurable period

  /admin/users — USER MANAGEMENT
  ───────────────────────────────
  Table shows: ID, Phone, Nickname, Balance, Status, Admin, Joined Date
  Actions per user:
    ► View full profile and balance breakdown
    ► Suspend account (is_suspended=true) — user can't login
    ► Unsuspend account
    ► Promote to Admin (is_admin=true)
    ► Edit balance (manually adjust deposit_balance)
    ► Delete account (CASCADE deletes all data)
  Search and filter by phone/nickname

  /admin/plans — INVESTMENT PLAN MANAGEMENT
  ──────────────────────────────────────────
  Create/Edit Plan Form:
    ► Name                (e.g. "Gold Plan")
    ► Image URL           (plan banner image)
    ► Price (PKR)         (cost to purchase)
    ► Daily Profit Rate % (e.g. 2.5 for 2.5%)
    ► Duration (days)     (how long plan runs)
    ► Max Purchases       (optional cap)
    ► Description         (HTML or text)
    ► Active toggle       (show/hide from users)

  /admin/deposits — DEPOSIT APPROVAL
  ───────────────────────────────────
  Table: User, Phone, Amount, Method, Reference, Date, Voucher, Status
  Filter by: All | Pending | Approved | Rejected
  Approve button: credits balance, triggers commissions
  Reject button: opens modal for rejection reason

  /admin/withdrawals — WITHDRAWAL APPROVAL
  ─────────────────────────────────────────
  Table: User, Amount, Fee, Net Amount, Wallet Type, Account Info, Date
  Approve button: confirms payment sent to user
  Reject button: restores user's balance

  /admin/tasks — TASK MANAGEMENT
  ────────────────────────────────
  Full CRUD for tasks
  Toggle active/inactive without deleting

  /admin/support — SUPPORT INBOX
  ────────────────────────────────
  See all users who have sent messages
  Click user to see full conversation thread
  Type and send admin reply (appears in user's support page)

  /admin/settings — PLATFORM CONFIGURATION
  ──────────────────────────────────────────
  ► Site Name
  ► Withdrawal Fee % (e.g. 2)
  ► Minimum Deposit Amount (PKR)
  ► Minimum Withdrawal Amount (PKR)
  ► Referral Level 1 Rate % (default 7)
  ► Referral Level 2 Rate % (default 3)
  ► Referral Level 3 Rate % (default 1)
  ► Maintenance Mode toggle (shuts down user actions)

  /admin/payment-methods — PAYMENT OPTIONS
  ─────────────────────────────────────────
  Manage which payment methods users see on deposit page
  Fields: Name, Type, Account Number, Account Title, Active toggle
  Examples: JazzCash, EasyPaisa, HBL Bank Transfer, Meezan Bank


================================================================================
  16. FRONTEND — PAGES & ROUTING (EVERY SCREEN)
================================================================================

  ROUTING LIBRARY: Wouter (lightweight, ~2KB React Router alternative)
  BASE PATH: Reads from import.meta.env.BASE_URL (set by Vite/Replit)

  ROUTE TABLE:
  ────────────────────────────────────────────────────────────────────────────
  Path                       Guard         Component            Description
  ────────────────────────────────────────────────────────────────────────────
  /auth/login                GuestRoute    pages/auth/login     Login form
  /auth/register             GuestRoute    pages/auth/register  Registration form
  /dashboard                 ProtectedRoute pages/dashboard     User home
  /plans                     ProtectedRoute pages/plans         Investment plans
  /wallet                    ProtectedRoute pages/wallet        Wallet management
  /referral                  ProtectedRoute pages/referral      Referral program
  /tasks                     ProtectedRoute pages/tasks         Daily tasks
  /notifications             ProtectedRoute pages/notifications Notifications
  /profile                   ProtectedRoute pages/profile       Profile settings
  /support                   ProtectedRoute pages/support       Chat support
  /admin                     AdminRoute    pages/admin/index    Admin dashboard
  /admin/users               AdminRoute    pages/admin/users    User management
  /admin/plans               AdminRoute    pages/admin/plans    Plan management
  /admin/deposits            AdminRoute    pages/admin/deposits Deposit approvals
  /admin/withdrawals         AdminRoute    pages/admin/withdrawals Withdrawals
  /admin/tasks               AdminRoute    pages/admin/tasks    Task management
  /admin/support             AdminRoute    pages/admin/support  Support inbox
  /admin/settings            AdminRoute    pages/admin/settings Platform settings
  /admin/payment-methods     AdminRoute    pages/admin/payment-methods Payments
  / (root)                   redirect      → /dashboard or /login

  ROUTE GUARDS:
  ─────────────
  GuestRoute:    localStorage["cw_token"] present → redirect to /dashboard
  ProtectedRoute: localStorage["cw_token"] empty → redirect to /auth/login
  AdminRoute:    token present + user.isAdmin=true, else → redirect to /dashboard


================================================================================
  17. FRONTEND — COMPONENTS LIBRARY
================================================================================

  All UI components are based on shadcn/ui + Radix UI primitives.
  Located in: artifacts/cloudswork/src/components/ui/

  LAYOUT COMPONENTS:
  ──────────────────
  app-layout.tsx      Standard user page shell with header + bottom navigation
  admin-layout.tsx    Admin panel shell with sidebar navigation links:
                        Dashboard, Users, Plans, Deposits, Withdrawals,
                        Tasks, Support, Settings, Payment Methods
  bottom-nav.tsx      Mobile bottom bar with 5 icons:
                        Home (Dashboard), Plans, Wallet, Referral, Profile

  SHADCN/UI COMPONENTS (50+ components):
  ───────────────────────────────────────
  accordion           Expandable sections
  alert               Colored alert messages (info, warning, error)
  alert-dialog        Confirmation dialog with cancel/confirm
  avatar              User profile picture with fallback initials
  badge               Status pills (pending, approved, rejected)
  breadcrumb          Navigation breadcrumbs
  button              Primary, secondary, outline, ghost, destructive variants
  calendar            Date picker calendar popup
  card                Content cards with header, content, footer
  carousel            Image/content slider (embla-carousel)
  chart               Recharts wrapper (line, bar, pie charts)
  checkbox            Checkbox input with label
  collapsible         Toggle-able content section
  command             Command palette (cmdk)
  context-menu        Right-click context menu
  dialog              Modal dialog (full featured)
  drawer              Bottom sheet drawer (vaul)
  dropdown-menu       Dropdown menus with items
  form                React Hook Form integration with validation errors
  hover-card          On-hover popup cards
  input               Text input with label and error support
  input-otp           OTP code input (input-otp library)
  label               Accessible form labels
  menubar             Horizontal menu bar
  navigation-menu     Multi-level navigation menus
  pagination          Page navigation with prev/next
  popover             Click-triggered popup panels
  progress            Progress bar
  radio-group         Radio button group
  resizable           Resizable panel layouts (react-resizable-panels)
  scroll-area         Custom scrollbar container
  select              Dropdown select input
  separator           Horizontal/vertical dividers
  sheet               Side panel drawer
  skeleton            Loading placeholder animations
  slider              Range slider input
  sonner              Toast notification system (sonner library)
  switch              Toggle switch
  table               Data table with header/body/footer
  tabs                Tab navigation with panels
  textarea            Multi-line text input
  toggle              Single toggle button
  toggle-group        Group of toggle buttons
  tooltip             Hover tooltips

  SPECIAL COMPONENTS:
  ───────────────────
  install-app-button.tsx   PWA install to home screen prompt
                           Uses beforeinstallprompt browser event
                           Hidden on desktop, shows on mobile Safari/Chrome


================================================================================
  18. FRONTEND — AUTH & STATE MANAGEMENT
================================================================================

  THEME:
  ──────
  ThemeProvider (next-themes) — wraps entire app
  Toggles: "light" | "dark" class on <html>
  Persists in localStorage["cw_theme"]
  Default: dark mode

  STATE MANAGEMENT:
  ─────────────────
  Library: TanStack React Query v5
  QueryClient configured in main.tsx with defaults:
    - staleTime: 30 seconds (data fresh for 30s)
    - retry: 1 (retry failed requests once)
    - refetchOnWindowFocus: true

  All API calls use generated React Query hooks:
    useQuery hooks  → GET requests (cached, auto-refetch)
    useMutation hooks → POST/PATCH/DELETE requests (invalidates queries)

  AUTH STATE:
  ───────────
  No global auth context — auth state is derived from:
    1. localStorage["cw_token"] — presence = logged in
    2. GET /api/auth/me — current user details (React Query cache)

  On login:   localStorage.setItem("cw_token", token)
  On logout:  localStorage.removeItem("cw_token") + invalidate queries


================================================================================
  19. FRONTEND — API CLIENT & CODEGEN
================================================================================

  SOURCE OF TRUTH: lib/api-spec/openapi.yaml
  GENERATOR: Orval (runs via pnpm --filter @workspace/api-spec run codegen)

  GENERATED OUTPUT:
  ─────────────────
  lib/api-client-react/src/generated/api.ts
    → One React Query hook per endpoint
    → useQuery for GET, useMutation for POST/PATCH/DELETE
    → All fully typed with TypeScript

  lib/api-zod/src/generated/
    → Zod schemas for every request body and response type
    → Used server-side for validation in Express routes

  CUSTOM FETCH (lib/api-client-react/src/custom-fetch.ts):
  ──────────────────────────────────────────────────────────
  Wrapper around browser fetch API with:

  setBaseUrl(url)
    Prepends URL to all relative paths (used in Expo/mobile)
    Web app uses null (relative URLs handled by Vite proxy)

  setAuthTokenGetter(getter)
    Callback that returns the auth token
    Web: () => localStorage.getItem("cw_token")
    Attaches as: Authorization: Bearer <token>

  Request flow:
  1. applyBaseUrl()     — prepend base URL if set
  2. mergeHeaders()     — merge explicit headers
  3. Auto-detect JSON  — sets Content-Type if body looks like JSON
  4. Attach auth token — Bearer header if getter returns value
  5. fetch()            — make the request
  6. Check response.ok  — throw ApiError if HTTP error
  7. Parse body         — JSON, text, blob, or auto-detect

  ERROR CLASSES:
  ──────────────
  ApiError extends Error
    .response   — full Response object
    .data        — parsed error body
    .requestInfo — { method, url }

  ResponseParseError extends Error
    Thrown when response body can't be parsed as expected type

  DO NOT HAND-EDIT generated files:
    lib/api-client-react/src/generated/api.ts
    lib/api-client-react/src/generated/api.schemas.ts
    lib/api-zod/src/generated/*

  To update after API changes:
    1. Edit lib/api-spec/openapi.yaml
    2. Run: pnpm --filter @workspace/api-spec run codegen
    3. Update route handlers in artifacts/api-server/src/routes/


================================================================================
  20. ENVIRONMENT VARIABLES (EVERY VARIABLE EXPLAINED)
================================================================================

  ─────────────────────────────────────────────────────────────────────────────
  Variable          Required  Default  Where Used        Notes
  ─────────────────────────────────────────────────────────────────────────────
  DATABASE_URL      YES       —        api-server, db    Full PostgreSQL
                                                         connection string.
                                                         Auto-provided by
                                                         Replit PostgreSQL.
                                                         DO NOT SET MANUALLY.

  PORT              YES       —        api-server,       Set per-service by
                                       cloudswork        Replit workflows.
                                                         API: 8080
                                                         Frontend: 20174

  BASE_PATH         YES       "/"      cloudswork        URL path prefix for
                                                         frontend. Set by
                                                         Replit artifact
                                                         routing system.

  SESSION_SECRET    YES       —        api-server        Secret key for session
                                                         signing/hashing.
                                                         Set as Replit Secret.
                                                         Already configured ✓

  NODE_ENV          NO        "dev"    api-server,       Controls log format,
                                       cloudswork        error detail, and
                                                         dev-only plugins.
                                                         Values: development |
                                                         production

  LOG_LEVEL         NO        "info"   api-server        Pino log level.
                                                         Values: trace, debug,
                                                         info, warn, error

  APP_URL           NO        —        api-server        Base URL of app.
                                                         Used to generate
                                                         referral links.
                                                         e.g. https://myapp.co

  PGHOST            AUTO      —        auto from         PostgreSQL host.
  PGPORT            AUTO      5432     DATABASE_URL      Auto-set by Replit.
  PGUSER            AUTO      —                          DO NOT SET MANUALLY.
  PGPASSWORD        AUTO      —
  PGDATABASE        AUTO      —
  ─────────────────────────────────────────────────────────────────────────────

  REPLIT-MANAGED (never set manually):
    DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE,
    REPLIT_DOMAINS, REPLIT_DEV_DOMAIN, REPL_ID


================================================================================
  21. DEVELOPMENT WORKFLOW (STEP-BY-STEP)
================================================================================

  ── FIRST TIME SETUP ───────────────────────────────────────────────────────────

  Step 1: Install all dependencies
    pnpm install

  Step 2: Push database schema to PostgreSQL
    pnpm --filter @workspace/db run push
    (This runs: drizzle-kit push — creates all tables from schema files)

  Step 3: Start both workflows in Replit
    Start "artifacts/api-server: API Server"
    Start "artifacts/cloudswork: web"

  Step 4: Access the app
    Frontend: http://localhost:20174/ (or your Replit preview URL)
    API: http://localhost:8080/api/healthz

  ── DAILY DEVELOPMENT ──────────────────────────────────────────────────────────

  Both workflows auto-restart when you save files (Vite HMR for frontend,
  the API server rebuilds on workflow restart).

  Making backend changes (routes, logic):
    1. Edit files in artifacts/api-server/src/
    2. Restart "artifacts/api-server: API Server" workflow
    3. Wait ~10s for esbuild to bundle

  Making frontend changes (pages, components):
    1. Edit files in artifacts/cloudswork/src/
    2. Vite HMR auto-reloads (instant, no restart needed)

  Making database schema changes:
    1. Edit lib/db/src/schema/*.ts
    2. Run: pnpm --filter @workspace/db run push
    3. Restart API server workflow

  Changing API contracts (adding/modifying routes):
    1. Edit lib/api-spec/openapi.yaml
    2. Run: pnpm --filter @workspace/api-spec run codegen
    3. Update route handler in artifacts/api-server/src/routes/
    4. Frontend hooks auto-updated (generated files)

  ── USEFUL COMMANDS ────────────────────────────────────────────────────────────

  pnpm install                              Install / update all dependencies
  pnpm run typecheck                        TypeScript check all packages
  pnpm run build                            Build all packages (typecheck + bundle)
  pnpm --filter @workspace/db run push      Push DB schema changes
  pnpm --filter @workspace/api-spec run codegen  Regenerate API client
  pnpm --filter @workspace/api-server run dev    Run API server (dev mode)
  pnpm --filter @workspace/cloudswork run dev    Run frontend (dev mode)

  ── CHECKING LOGS ──────────────────────────────────────────────────────────────

  API Server logs: Replit workflow console (pino JSON or pretty format)
  Frontend logs: Browser DevTools Console
  DB queries: Drizzle logs to stdout in dev mode (verbose)


================================================================================
  22. BUILD & BUNDLING SYSTEM
================================================================================

  API SERVER BUILD (esbuild):
  ────────────────────────────
  Script: artifacts/api-server/build.mjs
  Tool: esbuild 0.27.3

  Configuration:
    Entry point: src/index.ts
    Output:      dist/index.mjs
    Format:      ESM (ES Modules)
    Target:      node22
    Bundle:      true (single file)
    Minify:      false (readable for debugging)
    Source maps: true (enables stack traces in prod)
    Platform:    node

  External packages (not bundled):
    sharp, better-sqlite3, @aws-sdk/*, aws-sdk, mock-aws-s3,
    nock, pg-native (large native modules excluded for size)

  Special handling:
    esbuild-plugin-pino: correctly bundles Pino worker thread files
    Worker files output separately: pino-worker.mjs, pino-file.mjs,
    pino-pretty.mjs, thread-stream-worker.mjs

  Output size: ~2.2MB (includes all dependencies)

  FRONTEND BUILD (Vite):
  ──────────────────────
  Script: pnpm --filter @workspace/cloudswork run build
  Tool: Vite 7 (uses Rollup internally)

  Configuration (vite.config.ts):
    Entry: index.html
    Output: dist/public/
    Base: $BASE_PATH env var (e.g. "/")
    Plugins: React, Tailwind CSS, runtime error overlay

  Production optimizations:
    - Code splitting (vendor chunks separate)
    - Tree shaking (unused code removed)
    - CSS extracted and minified
    - Assets hashed for cache busting

  Replit production serving:
    Static file server serves dist/public/
    All routes rewrite to /index.html (SPA routing)

  TYPECHECK:
  ──────────
  Root: pnpm run typecheck
    1. tsc --build (compiles lib packages with project references)
    2. pnpm -r typecheck (runs typecheck in each artifact)

  TypeScript project references:
    tsconfig.json (root) references: lib/db, lib/api-zod,
    lib/api-client-react, lib/api-spec


================================================================================
  23. MONOREPO ARCHITECTURE (pnpm WORKSPACES)
================================================================================

  WORKSPACE PACKAGES:
  ───────────────────

  @workspace/db             lib/db/
    Type: Library
    Exports: All Drizzle table schemas + database connection
    Used by: @workspace/api-server

  @workspace/api-spec       lib/api-spec/
    Type: Spec + codegen tool
    Contains: openapi.yaml (source of truth)
    Generates: @workspace/api-client-react, @workspace/api-zod
    Run codegen: pnpm run codegen

  @workspace/api-zod        lib/api-zod/
    Type: Generated library (DO NOT EDIT)
    Exports: Zod schemas for all API types
    Used by: @workspace/api-server (input validation)
    Re-generated by: pnpm --filter @workspace/api-spec run codegen

  @workspace/api-client-react  lib/api-client-react/
    Type: Generated library (DO NOT EDIT)
    Exports: React Query hooks, custom fetch, TypeScript types
    Used by: @workspace/cloudswork (frontend)
    Re-generated by: pnpm --filter @workspace/api-spec run codegen

  @workspace/api-server     artifacts/api-server/
    Type: Application (Express API)
    Depends on: @workspace/db, @workspace/api-zod
    Port: 8080 (dev), 8080 (prod)
    Workflow: "artifacts/api-server: API Server"

  @workspace/cloudswork     artifacts/cloudswork/
    Type: Application (React SPA)
    Depends on: @workspace/api-client-react
    Port: 20174 (dev), static files (prod)
    Workflow: "artifacts/cloudswork: web"

  @workspace/mockup-sandbox    artifacts/mockup-sandbox/
    Type: Internal Replit design tool
    Port: 8081
    Not end-user facing

  @workspace/scripts        scripts/
    Type: Automation scripts
    Contains: post-merge.sh

  DEPENDENCY GRAPH:
  ─────────────────
  openapi.yaml
      │
      ▼ (orval codegen)
  @workspace/api-zod ────────────► @workspace/api-server
  @workspace/api-client-react ───► @workspace/cloudswork
                                         │
  @workspace/db ─────────────────► @workspace/api-server

  SHARED CATALOG (pnpm-workspace.yaml):
  ──────────────────────────────────────
  Common packages pinned to exact versions in catalog:
    drizzle-orm: catalog version shared by db + api-server
    @types/node: same version across all TS packages
    vite, react, react-dom: same version across all frontend packages
    tailwindcss, framer-motion, lucide-react, zod, etc.


================================================================================
  24. SECURITY FEATURES
================================================================================

  PASSWORD SECURITY:
  ──────────────────
  ► scrypt hashing (memory-hard, much stronger than bcrypt)
  ► Per-user random 16-byte salt (prevents rainbow table attacks)
  ► Legacy SHA-256 path still works (backward compat) but rehashes on login
  ► confirmPassword required on register and change-password (server enforced)

  SESSION SECURITY:
  ─────────────────
  ► Sessions stored in DB (not JWT — can be instantly revoked)
  ► Token is 32 random bytes (256-bit entropy)
  ► Sessions expire (expires_at in future)
  ► Logout immediately deletes session row

  RATE LIMITING:
  ──────────────
  ► Login: max 10 attempts per 15 minutes per IP + phone
  ► Prevents brute-force password attacks
  ► Returns HTTP 429 with retry-after info

  AUTHORIZATION:
  ──────────────
  ► All routes protected by default (authenticateToken)
  ► Admin routes double-protected (authenticateToken + requireAdmin)
  ► Admin flag checked server-side on every request (not just at login)

  INPUT VALIDATION:
  ─────────────────
  ► All API inputs validated with Zod schemas (generated from OpenAPI)
  ► Invalid inputs return 400 with field-level error details
  ► No raw SQL injection possible (Drizzle uses parameterized queries)

  CORS:
  ─────
  ► CORS configured in Express (all origins allowed in dev)
  ► Production should restrict to known domains

  SUPPLY CHAIN:
  ─────────────
  ► pnpm-workspace.yaml: minimumReleaseAge: 1440 (packages must be 1 day old)
  ► Prevents newly published malicious packages from being installed
  ► pnpm-lock.yaml locks exact versions


================================================================================
  25. DEPLOYMENT ON REPLIT
================================================================================

  HOW REPLIT DEPLOYMENT WORKS:
  ─────────────────────────────

  When you click "Publish" in Replit:

  1. FRONTEND BUILD:
     pnpm --filter @workspace/cloudswork run build
     → Creates: artifacts/cloudswork/dist/public/
     → Served as static files at path "/"

  2. API SERVER BUILD:
     pnpm --filter @workspace/api-server run build
     → Creates: artifacts/api-server/dist/index.mjs
     → Runs in production as: node --enable-source-maps dist/index.mjs

  3. DATABASE SCHEMA SYNC:
     Replit diffs development schema vs production schema
     Shows you any schema changes and asks to confirm
     Applies schema changes to production PostgreSQL

  4. PATH ROUTING:
     / → Serves static frontend files (artifacts/cloudswork/dist/public/)
     /api/* → Routes to API server (port 8080)
     All unknown paths → index.html (SPA routing)

  POST-BUILD CLEANUP:
  ───────────────────
  pnpm store prune (removes unused packages from pnpm store)

  PRODUCTION ENV VARS:
  ────────────────────
  All env vars set in Replit Secrets are available in production
  DATABASE_URL is automatically connected to production PostgreSQL
  PORT is set by Replit to 8080 for API server

  DO NOT:
  ────────
  ► Write custom migration scripts for production DB changes
  ► Add DDL (CREATE TABLE, ALTER TABLE) to startup code
  ► Use deploy-build hooks to modify DB schema
  Replit's Publish flow handles all of this automatically.


================================================================================
  26. SYSTEM SETTINGS & CONFIGURATION
================================================================================

  All platform settings are stored in the system_settings table (one row).
  Editable at /admin/settings by any admin user.

  ┌──────────────────────────┬───────────┬────────────────────────────────────┐
  │ Setting                  │ Default   │ Description                        │
  ├──────────────────────────┼───────────┼────────────────────────────────────┤
  │ site_name                │ CloudsWork│ Platform display name              │
  │ withdrawal_fee_percent   │ 2         │ % fee on all withdrawals           │
  │ min_deposit              │ 500 PKR   │ Minimum deposit amount             │
  │ min_withdrawal           │ 1000 PKR  │ Minimum withdrawal amount          │
  │ referral_level1_rate     │ 7         │ Direct referral commission %       │
  │ referral_level2_rate     │ 3         │ L2 referral commission %           │
  │ referral_level3_rate     │ 1         │ L3 referral commission %           │
  │ maintenance_mode         │ false     │ Lock platform (true = no activity) │
  └──────────────────────────┴───────────┴────────────────────────────────────┘

  When maintenance_mode = true:
  ► Users can still login and view their balances
  ► All transactions (deposit, withdraw, plan purchase, tasks) are blocked
  ► Admin panel remains fully functional


================================================================================
  27. POST-MERGE AUTOMATION
================================================================================

  File: scripts/post-merge.sh

  This script runs automatically when a task agent (Replit AI agent working on
  an isolated branch) completes their work and the code is merged back.

  What it does:
  ─────────────
  1. pnpm install
     Installs any new npm packages added by the task agent

  2. pnpm --filter db push
     Pushes any new database schema changes to PostgreSQL
     (e.g. if agent added new tables or columns)

  Timeout: 20,000ms (20 seconds)

  This ensures the environment is always in sync after code merges without
  requiring manual intervention.


================================================================================
  28. AUTHOR & CREDITS
================================================================================

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                                                                         │
  │   PROJECT NAME:   CloudsWork — Work & Earn Platform                     │
  │   CREATED BY:     Qamar Shahzad                                         │
  │   PLATFORM:       Replit                                                │
  │   LANGUAGE:       TypeScript                                            │
  │   VERSION:        1.0.0                                                 │
  │                                                                         │
  │   STACK SUMMARY:                                                        │
  │     Backend:  Node.js 24 + Express 5 + PostgreSQL + Drizzle ORM        │
  │     Frontend: React 19 + Vite 7 + Tailwind CSS + shadcn/ui             │
  │     API:      OpenAPI 3 → Orval codegen → React Query                  │
  │     Auth:     Token sessions + scrypt password hashing                 │
  │     Hosting:  Replit (auto-scaling deployment)                          │
  │                                                                         │
  └─────────────────────────────────────────────────────────────────────────┘

  OPEN SOURCE PACKAGES USED:
  ──────────────────────────
  Express, React, Vite, Drizzle ORM, TanStack Query, Tailwind CSS,
  shadcn/ui, Radix UI, Wouter, React Hook Form, Zod, Orval,
  Pino, esbuild, Framer Motion, Recharts, Lucide React, Sonner,
  date-fns, Vaul, cmdk, Embla Carousel, next-themes, and many more.

  Special thanks to the open-source community for making these tools free.

================================================================================
  END OF DOCUMENTATION
  CloudsWork v1.0.0 — Created by Qamar Shahzad
================================================================================
