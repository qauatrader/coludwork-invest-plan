import { Router } from "express";
import { db, usersTable, depositsTable, withdrawalsTable, transactionsTable, purchasedPlansTable, plansTable, bannersTable, referralsTable } from "@workspace/db";
import { eq, desc, sum, count, and, gte } from "drizzle-orm";
import { authenticateToken, formatUser } from "../lib/auth";
import { getAppBaseUrl } from "../lib/url";

const router = Router();

// GET /dashboard
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const fresh = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const freshUser = fresh[0];

  const totalEarnings = parseFloat(freshUser.profitBalance ?? "0") + parseFloat(freshUser.commissionBalance ?? "0");
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const todayTxs = await db.select({ amount: transactionsTable.amount })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, user.id), eq(transactionsTable.type, "profit"), gte(transactionsTable.createdAt, todayStart)));
  const todayEarnings = todayTxs.reduce((s, t) => s + parseFloat(t.amount), 0);

  const recentTxs = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(5);

  const banners = await db.select().from(bannersTable).where(eq(bannersTable.isActive, true)).orderBy(bannersTable.order);

  const referralCount = await db.select({ cnt: count() }).from(referralsTable).where(eq(referralsTable.referrerId, user.id));
  const activeInvCount = await db.select({ cnt: count() }).from(purchasedPlansTable)
    .where(and(eq(purchasedPlansTable.userId, user.id), eq(purchasedPlansTable.status, "active")));

  res.json({
    user: formatUser(freshUser),
    totalEarnings,
    todayEarnings,
    totalDeposit: parseFloat(freshUser.depositBalance ?? "0"),
    totalWithdraw: parseFloat(freshUser.withdrawBalance ?? "0"),
    totalReferrals: referralCount[0].cnt,
    activeInvestments: activeInvCount[0].cnt,
    recentTransactions: recentTxs.map(t => ({
      id: t.id, userId: t.userId, type: t.type, amount: parseFloat(t.amount),
      description: t.description, status: t.status, createdAt: t.createdAt.toISOString(),
    })),
    banners: banners.map(b => ({ id: b.id, imageUrl: b.imageUrl, title: b.title ?? null, link: b.link ?? null, isActive: b.isActive, order: b.order })),
    referralLink: `${getAppBaseUrl(req)}/register?ref=${freshUser.referralCode}`,
  });
});

// GET /dashboard/stats
router.get("/stats", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const now = new Date();

  const daily = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    const txs = await db.select({ type: transactionsTable.type, amount: transactionsTable.amount })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.userId, user.id), gte(transactionsTable.createdAt, start)));
    const profit = txs.filter(t => t.type === "profit").reduce((s, t) => s + parseFloat(t.amount), 0);
    const commission = txs.filter(t => t.type === "commission").reduce((s, t) => s + parseFloat(t.amount), 0);
    daily.push({ label: d.toLocaleDateString("en", { weekday: "short" }), profit, commission });
  }

  res.json({ daily, weekly: daily, monthly: daily });
});

export default router;
