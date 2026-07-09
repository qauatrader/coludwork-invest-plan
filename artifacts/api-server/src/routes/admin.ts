import { Router } from "express";
import { db, usersTable, plansTable, depositsTable, withdrawalsTable, transactionsTable, tasksTable, supportMessagesTable, systemSettingsTable, bannersTable, notificationsTable, sessionsTable, paymentMethodsTable } from "@workspace/db";
import { eq, desc, count, sum, gte, and, sql } from "drizzle-orm";
import { authenticateToken, requireAdmin, hashPassword, generateReferralCode, formatUser } from "../lib/auth";
import { distributeReferralCommissions } from "../lib/commissions";

const router = Router();
router.use(authenticateToken, requireAdmin);

function fmtDeposit(d: any) {
  return { id: d.id, userId: d.userId, amount: parseFloat(d.amount), currency: d.currency,
    paymentMethod: d.paymentMethod, voucherUrl: d.voucherUrl ?? null, status: d.status,
    notes: d.notes ?? null, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() };
}

function fmtWithdrawal(w: any) {
  return { id: w.id, userId: w.userId, amount: parseFloat(w.amount), fee: parseFloat(w.fee),
    netAmount: parseFloat(w.netAmount), walletType: w.walletType, accountTitle: w.accountTitle ?? null,
    iban: w.iban ?? null, walletAddress: w.walletAddress ?? null, status: w.status,
    notes: w.notes ?? null, createdAt: w.createdAt.toISOString(), updatedAt: w.updatedAt.toISOString() };
}

function fmtPlan(p: any) {
  const totalReturn = parseFloat(p.price) * (parseFloat(p.dailyProfitRate) / 100) * p.durationDays;
  return { id: p.id, name: p.name, imageUrl: p.imageUrl ?? null, price: parseFloat(p.price),
    dailyProfitRate: parseFloat(p.dailyProfitRate), durationDays: p.durationDays, totalReturn,
    maxPurchases: p.maxPurchases ?? null, currentPurchases: p.currentPurchases, isActive: p.isActive,
    description: p.description ?? null };
}

// GET /admin/stats
router.get("/stats", async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [totalUsers] = await db.select({ cnt: count() }).from(usersTable);
  const [pendingDeps] = await db.select({ cnt: count() }).from(depositsTable).where(eq(depositsTable.status, "pending"));
  const [pendingWiths] = await db.select({ cnt: count() }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending"));

  const todayDeps = await db.select({ amount: depositsTable.amount }).from(depositsTable)
    .where(and(eq(depositsTable.status, "approved"), gte(depositsTable.createdAt, today)));
  const todayDeposit = todayDeps.reduce((s, d) => s + parseFloat(d.amount), 0);

  const todayWiths = await db.select({ amount: withdrawalsTable.amount }).from(withdrawalsTable)
    .where(and(eq(withdrawalsTable.status, "approved"), gte(withdrawalsTable.createdAt, today)));
  const todayWithdrawal = todayWiths.reduce((s, w) => s + parseFloat(w.amount), 0);

  const allDeps = await db.select({ amount: depositsTable.amount }).from(depositsTable).where(eq(depositsTable.status, "approved"));
  const totalRevenue = allDeps.reduce((s, d) => s + parseFloat(d.amount), 0);

  const allWiths = await db.select({ amount: withdrawalsTable.amount }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "approved"));
  const totalPaid = allWiths.reduce((s, w) => s + parseFloat(w.amount), 0);

  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const deps = await db.select({ amount: depositsTable.amount }).from(depositsTable)
      .where(and(eq(depositsTable.status, "approved"), gte(depositsTable.createdAt, start)));
    const profit = deps.reduce((s, x) => s + parseFloat(x.amount), 0);
    revenueChart.push({ label: d.toLocaleDateString("en", { weekday: "short" }), profit, commission: profit * 0.1 });
  }

  const [recentSessions] = await db.select({ cnt: count() }).from(sessionsTable)
    .where(gte(sessionsTable.expiresAt, new Date()));

  res.json({
    totalUsers: totalUsers.cnt,
    onlineUsers: recentSessions.cnt,
    totalRevenue,
    todayDeposit,
    todayWithdrawal,
    pendingDeposits: pendingDeps.cnt,
    pendingWithdrawals: pendingWiths.cnt,
    totalProfit: totalPaid,
    revenueChart,
  });
});

// GET /admin/users
router.get("/users", async (req, res) => {
  const { search = "", status = "all", page = "1" } = req.query as any;
  const pageNum = parseInt(page);
  const limit = 20;

  let all = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  if (search) all = all.filter(u => u.phone.includes(search) || u.nickname.toLowerCase().includes(search.toLowerCase()));
  if (status === "active") all = all.filter(u => !u.isSuspended);
  if (status === "suspended") all = all.filter(u => u.isSuspended);

  const paged = all.slice((pageNum - 1) * limit, pageNum * limit);
  res.json({ users: paged.map(formatUser), total: all.length, page: pageNum, totalPages: Math.ceil(all.length / limit) });
});

// POST /admin/users
router.post("/users", async (req, res) => {
  const { phone, nickname, password, isAdmin } = req.body;
  const refCode = generateReferralCode();
  const [user] = await db.insert(usersTable).values({
    phone, nickname, passwordHash: hashPassword(password), referralCode: refCode, isAdmin: !!isAdmin,
  }).returning();
  res.status(201).json(formatUser(user));
});

// PUT /admin/users/:id
router.put("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "User not found" }); return; }
  const { nickname, phone, isAdmin, walletBalance } = req.body;
  const updates: any = {};
  if (nickname !== undefined) updates.nickname = nickname;
  if (phone !== undefined) updates.phone = phone;
  if (isAdmin !== undefined) updates.isAdmin = isAdmin;
  if (walletBalance !== undefined) updates.walletBalance = String(walletBalance);
  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  res.json(formatUser(u));
});

// DELETE /admin/users/:id
router.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "User not found" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true, message: "User deleted" });
});

// POST /admin/users/:id/suspend
router.post("/users/:id/suspend", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "User not found" }); return; }
  const { suspended } = req.body;
  await db.update(usersTable).set({ isSuspended: !!suspended }).where(eq(usersTable.id, id));
  res.json({ success: true, message: suspended ? "User suspended" : "User unsuspended" });
});

// GET /admin/plans
router.get("/plans", async (req, res) => {
  const plans = await db.select().from(plansTable);
  res.json(plans.map(fmtPlan));
});

// POST /admin/plans
router.post("/plans", async (req, res) => {
  const { name, imageUrl, price, dailyProfitRate, durationDays, maxPurchases, isActive, description } = req.body;
  const [plan] = await db.insert(plansTable).values({
    name, imageUrl: imageUrl ?? null, price: String(price), dailyProfitRate: String(dailyProfitRate),
    durationDays, maxPurchases: maxPurchases ?? null, isActive: !!isActive, description: description ?? null,
  }).returning();
  res.status(201).json(fmtPlan(plan));
});

// PUT /admin/plans/:id
router.put("/plans/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: plansTable.id }).from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Plan not found" }); return; }
  const { name, imageUrl, price, dailyProfitRate, durationDays, maxPurchases, isActive, description } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (price !== undefined) updates.price = String(price);
  if (dailyProfitRate !== undefined) updates.dailyProfitRate = String(dailyProfitRate);
  if (durationDays !== undefined) updates.durationDays = durationDays;
  if (maxPurchases !== undefined) updates.maxPurchases = maxPurchases;
  if (isActive !== undefined) updates.isActive = isActive;
  if (description !== undefined) updates.description = description;
  await db.update(plansTable).set(updates).where(eq(plansTable.id, id));
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, id));
  res.json(fmtPlan(plan));
});

// DELETE /admin/plans/:id
router.delete("/plans/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: plansTable.id }).from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Plan not found" }); return; }
  await db.delete(plansTable).where(eq(plansTable.id, id));
  res.json({ success: true, message: "Plan deleted" });
});

// GET /admin/deposits
router.get("/deposits", async (req, res) => {
  const { status = "all" } = req.query as any;
  let all = await db.select().from(depositsTable).orderBy(desc(depositsTable.createdAt));
  if (status !== "all") all = all.filter(d => d.status === status);
  res.json(all.map(fmtDeposit));
});

// POST /admin/deposits/:id/approve
router.post("/deposits/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  const { notes } = req.body ?? {};
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid deposit id" }); return; }

  try {
    const result = await db.transaction(async (tx) => {
      // Lock deposit row to prevent concurrent approval/rejection
      const deps = await tx.select().from(depositsTable).where(eq(depositsTable.id, id)).for("update").limit(1);
      if (!deps.length) return { error: "Not found", status: 404 };
      const dep = deps[0];

      // Idempotency: already approved
      if (dep.status === "approved") return { deposit: dep };

      // Can only approve pending deposits
      if (dep.status !== "pending") {
        return { error: `Deposit is already ${dep.status}`, status: 409 };
      }

      // Lock user row and credit atomically
      await tx.select().from(usersTable).where(eq(usersTable.id, dep.userId)).for("update").limit(1);
      await tx.update(usersTable)
        .set({ depositBalance: sql`${usersTable.depositBalance} + ${dep.amount}` })
        .where(eq(usersTable.id, dep.userId));

      // Mark deposit approved
      await tx.update(depositsTable)
        .set({ status: "approved", notes: notes ?? null })
        .where(eq(depositsTable.id, id));

      // Record transaction
      await tx.insert(transactionsTable).values({
        userId: dep.userId, type: "deposit", amount: dep.amount,
        description: `Deposit approved via ${dep.paymentMethod}`, status: "completed",
      });

      // Notify user
      await tx.insert(notificationsTable).values({
        userId: dep.userId, title: "Deposit Approved", message: `Your deposit of ${dep.amount} PKR has been approved.`, type: "deposit_approved",
      });

      // Distribute referral commissions to upline (L1/L2/L3)
      await distributeReferralCommissions(tx, dep.userId, parseFloat(dep.amount), "deposit");

      const [updated] = await tx.select().from(depositsTable).where(eq(depositsTable.id, id));
      return { deposit: updated };
    });

    if ("error" in result) {
      res.status(result.status as number).json({ error: result.error });
      return;
    }

    res.json(fmtDeposit(result.deposit));
  } catch (err) {
    console.error("Deposit approval failed", err);
    res.status(500).json({ error: "Deposit approval failed. Please try again." });
  }
});

// POST /admin/deposits/:id/reject
router.post("/deposits/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  const { notes } = req.body ?? {};
  await db.update(depositsTable).set({ status: "rejected", notes: notes ?? null }).where(eq(depositsTable.id, id));
  const [updated] = await db.select().from(depositsTable).where(eq(depositsTable.id, id));
  res.json(fmtDeposit(updated));
});

// GET /admin/withdrawals
router.get("/withdrawals", async (req, res) => {
  const { status = "all" } = req.query as any;
  let all = await db.select().from(withdrawalsTable).orderBy(desc(withdrawalsTable.createdAt));
  if (status !== "all") all = all.filter(w => w.status === status);
  res.json(all.map(fmtWithdrawal));
});

// POST /admin/withdrawals/:id/approve
router.post("/withdrawals/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  const { notes } = req.body ?? {};
  const existing = await db.select({ id: withdrawalsTable.id }).from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Withdrawal not found" }); return; }
  await db.update(withdrawalsTable).set({ status: "approved", notes: notes ?? null }).where(eq(withdrawalsTable.id, id));
  const [updated] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id));
  await db.insert(notificationsTable).values({
    userId: updated.userId, title: "Withdrawal Approved", message: `Your withdrawal of ${updated.amount} PKR has been processed.`, type: "withdrawal_approved",
  });
  res.json(fmtWithdrawal(updated));
});

// POST /admin/withdrawals/:id/reject
router.post("/withdrawals/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  const { notes } = req.body ?? {};
  const withs = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  if (!withs.length) { res.status(404).json({ error: "Not found" }); return; }
  const w = withs[0];
  await db.update(withdrawalsTable).set({ status: "rejected", notes: notes ?? null }).where(eq(withdrawalsTable.id, id));

  // Refund balance
  const users = await db.select().from(usersTable).where(eq(usersTable.id, w.userId)).limit(1);
  const newBalance = parseFloat(users[0].withdrawBalance ?? "0") + parseFloat(w.amount);
  await db.update(usersTable).set({ withdrawBalance: String(newBalance) }).where(eq(usersTable.id, w.userId));

  const [updated] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id));
  res.json(fmtWithdrawal(updated));
});

// GET /admin/tasks
router.get("/tasks", async (req, res) => {
  const tasks = await db.select().from(tasksTable);
  res.json(tasks.map(t => ({ id: t.id, title: t.title, description: t.description, type: t.type, reward: parseFloat(t.reward), link: t.link ?? null, isCompleted: false, isActive: t.isActive })));
});

// POST /admin/tasks
router.post("/tasks", async (req, res) => {
  const { title, description, type, reward, link, isActive } = req.body;
  const [task] = await db.insert(tasksTable).values({ title, description, type, reward: String(reward), link: link ?? null, isActive: !!isActive }).returning();
  res.status(201).json({ id: task.id, title: task.title, description: task.description, type: task.type, reward: parseFloat(task.reward), link: task.link ?? null, isCompleted: false, isActive: task.isActive });
});

// PUT /admin/tasks/:id
router.put("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: tasksTable.id }).from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Task not found" }); return; }
  const { title, description, type, reward, link, isActive } = req.body;
  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (type !== undefined) updates.type = type;
  if (reward !== undefined) updates.reward = String(reward);
  if (link !== undefined) updates.link = link;
  if (isActive !== undefined) updates.isActive = isActive;
  await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));
  const [t] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  res.json({ id: t.id, title: t.title, description: t.description, type: t.type, reward: parseFloat(t.reward), link: t.link ?? null, isCompleted: false, isActive: t.isActive });
});

// DELETE /admin/tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: tasksTable.id }).from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Task not found" }); return; }
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  res.json({ success: true, message: "Task deleted" });
});

// GET /admin/support
router.get("/support", async (req, res) => {
  const users = await db.select().from(usersTable);
  const tickets = await Promise.all(users.map(async (u) => {
    const msgs = await db.select().from(supportMessagesTable).where(eq(supportMessagesTable.userId, u.id)).orderBy(desc(supportMessagesTable.createdAt)).limit(1);
    if (!msgs.length) return null;
    const unread = await db.select({ cnt: count() }).from(supportMessagesTable)
      .where(and(eq(supportMessagesTable.userId, u.id), eq(supportMessagesTable.isAdmin, false), eq(supportMessagesTable.isRead, false)));
    return {
      userId: u.id, userNickname: u.nickname, userPhone: u.phone,
      lastMessage: msgs[0].message, unreadCount: unread[0].cnt, lastActivity: msgs[0].createdAt.toISOString(),
    };
  }));
  res.json(tickets.filter(Boolean));
});

// GET /admin/support/:userId/messages
router.get("/support/:userId/messages", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const msgs = await db.select().from(supportMessagesTable)
    .where(eq(supportMessagesTable.userId, userId))
    .orderBy(supportMessagesTable.createdAt);
  res.json(msgs.map(m => ({ id: m.id, userId: m.userId, message: m.message, isAdmin: m.isAdmin, isRead: m.isRead, createdAt: m.createdAt.toISOString() })));
});

// POST /admin/support/:userId/reply
router.post("/support/:userId/reply", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { message } = req.body;
  const [msg] = await db.insert(supportMessagesTable).values({ userId, message, isAdmin: true }).returning();
  res.status(201).json({ id: msg.id, userId: msg.userId, message: msg.message, isAdmin: msg.isAdmin, createdAt: msg.createdAt.toISOString() });
});

// GET /admin/reports/revenue
router.get("/reports/revenue", async (req, res) => {
  const allDeps = await db.select({ amount: depositsTable.amount }).from(depositsTable).where(eq(depositsTable.status, "approved"));
  const allWiths = await db.select({ amount: withdrawalsTable.amount, fee: withdrawalsTable.fee }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "approved"));
  const allTxs = await db.select({ type: transactionsTable.type, amount: transactionsTable.amount, createdAt: transactionsTable.createdAt }).from(transactionsTable);

  const totalDeposits = allDeps.reduce((s, d) => s + parseFloat(d.amount), 0);
  const totalWithdrawals = allWiths.reduce((s, w) => s + parseFloat(w.amount), 0);
  const totalProfitPaid = allTxs.filter(t => t.type === "profit").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalCommissionPaid = allTxs.filter(t => t.type === "commission").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalRevenue = totalDeposits;
  const netProfit = totalRevenue - totalWithdrawals - totalProfitPaid - totalCommissionPaid;

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(); monthStart.setMonth(monthStart.getMonth() - i, 1); monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart); monthEnd.setMonth(monthEnd.getMonth() + 1);

    const inMonth = allTxs.filter(t => t.createdAt >= monthStart && t.createdAt < monthEnd);
    const profit = inMonth.filter(t => t.type === "profit").reduce((s, t) => s + parseFloat(t.amount), 0);
    const commission = inMonth.filter(t => t.type === "commission").reduce((s, t) => s + parseFloat(t.amount), 0);

    monthlyData.push({ label: monthStart.toLocaleDateString("en", { month: "short" }), profit, commission });
  }

  res.json({ totalRevenue, totalDeposits, totalWithdrawals, totalProfitPaid, totalCommissionPaid, netProfit, monthlyData });
});

// GET /admin/settings
router.get("/settings", async (req, res) => {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  if (!settings.length) {
    const [s] = await db.insert(systemSettingsTable).values({}).returning();
    res.json({ siteName: s.siteName, withdrawalFeePercent: parseFloat(s.withdrawalFeePercent), minDeposit: parseFloat(s.minDeposit), minWithdrawal: parseFloat(s.minWithdrawal), referralLevel1Rate: parseFloat(s.referralLevel1Rate), referralLevel2Rate: parseFloat(s.referralLevel2Rate), referralLevel3Rate: parseFloat(s.referralLevel3Rate), maintenanceMode: s.maintenanceMode });
    return;
  }
  const s = settings[0];
  res.json({ siteName: s.siteName, withdrawalFeePercent: parseFloat(s.withdrawalFeePercent), minDeposit: parseFloat(s.minDeposit), minWithdrawal: parseFloat(s.minWithdrawal), referralLevel1Rate: parseFloat(s.referralLevel1Rate), referralLevel2Rate: parseFloat(s.referralLevel2Rate), referralLevel3Rate: parseFloat(s.referralLevel3Rate), maintenanceMode: s.maintenanceMode });
});

// PUT /admin/settings
router.put("/settings", async (req, res) => {
  const { siteName, withdrawalFeePercent, minDeposit, minWithdrawal, referralLevel1Rate, referralLevel2Rate, referralLevel3Rate, maintenanceMode } = req.body;
  const updates: any = {};
  if (siteName !== undefined) updates.siteName = siteName;
  if (withdrawalFeePercent !== undefined) updates.withdrawalFeePercent = String(withdrawalFeePercent);
  if (minDeposit !== undefined) updates.minDeposit = String(minDeposit);
  if (minWithdrawal !== undefined) updates.minWithdrawal = String(minWithdrawal);
  if (referralLevel1Rate !== undefined) updates.referralLevel1Rate = String(referralLevel1Rate);
  if (referralLevel2Rate !== undefined) updates.referralLevel2Rate = String(referralLevel2Rate);
  if (referralLevel3Rate !== undefined) updates.referralLevel3Rate = String(referralLevel3Rate);
  if (maintenanceMode !== undefined) updates.maintenanceMode = maintenanceMode;
  const existing = await db.select().from(systemSettingsTable).limit(1);
  if (!existing.length) await db.insert(systemSettingsTable).values(updates);
  else await db.update(systemSettingsTable).set(updates);
  const [s] = await db.select().from(systemSettingsTable).limit(1);
  res.json({ siteName: s.siteName, withdrawalFeePercent: parseFloat(s.withdrawalFeePercent), minDeposit: parseFloat(s.minDeposit), minWithdrawal: parseFloat(s.minWithdrawal), referralLevel1Rate: parseFloat(s.referralLevel1Rate), referralLevel2Rate: parseFloat(s.referralLevel2Rate), referralLevel3Rate: parseFloat(s.referralLevel3Rate), maintenanceMode: s.maintenanceMode });
});

// GET /admin/banners
router.get("/banners", async (req, res) => {
  const banners = await db.select().from(bannersTable).orderBy(bannersTable.order);
  res.json(banners.map(b => ({ id: b.id, imageUrl: b.imageUrl, title: b.title ?? null, link: b.link ?? null, isActive: b.isActive, order: b.order })));
});

// POST /admin/banners
router.post("/banners", async (req, res) => {
  const { imageUrl, title, link, isActive, order } = req.body;
  const [b] = await db.insert(bannersTable).values({ imageUrl, title: title ?? null, link: link ?? null, isActive: !!isActive, order: order ?? 0 }).returning();
  res.status(201).json({ id: b.id, imageUrl: b.imageUrl, title: b.title ?? null, link: b.link ?? null, isActive: b.isActive, order: b.order });
});

// DELETE /admin/banners/:id
router.delete("/banners/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await db.select({ id: bannersTable.id }).from(bannersTable).where(eq(bannersTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Banner not found" }); return; }
  await db.delete(bannersTable).where(eq(bannersTable.id, id));
  res.json({ success: true, message: "Banner deleted" });
});

function fmtPaymentMethod(p: any) {
  return { id: p.id, name: p.name, type: p.type, accountNumber: p.accountNumber, accountTitle: p.accountTitle, isActive: p.isActive };
}

// GET /admin/payment-methods
router.get("/payment-methods", async (req, res) => {
  const methods = await db.select().from(paymentMethodsTable).orderBy(paymentMethodsTable.id);
  res.json(methods.map(fmtPaymentMethod));
});

// POST /admin/payment-methods
router.post("/payment-methods", async (req, res) => {
  const { name, type, accountNumber, accountTitle, isActive } = req.body;
  if (!name || !type || !accountNumber || !accountTitle) {
    res.status(400).json({ error: "name, type, accountNumber and accountTitle are required" });
    return;
  }
  const [method] = await db.insert(paymentMethodsTable).values({
    name, type, accountNumber, accountTitle, isActive: isActive ?? true,
  }).returning();
  res.status(201).json(fmtPaymentMethod(method));
});

// PUT /admin/payment-methods/:id
router.put("/payment-methods/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const existing = await db.select({ id: paymentMethodsTable.id }).from(paymentMethodsTable).where(eq(paymentMethodsTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Payment method not found" }); return; }
  const { name, type, accountNumber, accountTitle, isActive } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (type !== undefined) updates.type = type;
  if (accountNumber !== undefined) updates.accountNumber = accountNumber;
  if (accountTitle !== undefined) updates.accountTitle = accountTitle;
  if (isActive !== undefined) updates.isActive = isActive;
  await db.update(paymentMethodsTable).set(updates).where(eq(paymentMethodsTable.id, id));
  const [method] = await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, id));
  res.json(fmtPaymentMethod(method));
});

// DELETE /admin/payment-methods/:id
router.delete("/payment-methods/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const existing = await db.select({ id: paymentMethodsTable.id }).from(paymentMethodsTable).where(eq(paymentMethodsTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Payment method not found" }); return; }
  await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, id));
  res.json({ success: true, message: "Payment method deleted" });
});

export default router;
