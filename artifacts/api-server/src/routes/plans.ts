import { Router } from "express";
import { db, plansTable, purchasedPlansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";
import { distributeReferralCommissions } from "../lib/commissions";

const router = Router();

function formatPlan(p: any) {
  const totalReturn = parseFloat(p.price) * (parseFloat(p.dailyProfitRate) / 100) * p.durationDays;
  return {
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl ?? null,
    price: parseFloat(p.price),
    dailyProfitRate: parseFloat(p.dailyProfitRate),
    durationDays: p.durationDays,
    totalReturn,
    maxPurchases: p.maxPurchases ?? null,
    currentPurchases: p.currentPurchases,
    isActive: p.isActive,
    description: p.description ?? null,
  };
}

// GET /plans
router.get("/", authenticateToken, async (req, res) => {
  const plans = await db.select().from(plansTable).where(eq(plansTable.isActive, true));
  res.json(plans.map(formatPlan));
});

// GET /plans/purchased
router.get("/purchased", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const purchased = await db.select({ pp: purchasedPlansTable, plan: plansTable })
    .from(purchasedPlansTable)
    .innerJoin(plansTable, eq(purchasedPlansTable.planId, plansTable.id))
    .where(eq(purchasedPlansTable.userId, user.id));

  const now = new Date();
  res.json(purchased.map(({ pp, plan }) => {
    const daysRemaining = Math.max(0, Math.ceil((pp.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      id: pp.id, planId: pp.planId, plan: formatPlan(plan), userId: pp.userId,
      startDate: pp.startDate.toISOString(), endDate: pp.endDate.toISOString(),
      totalEarned: parseFloat(pp.totalEarned), status: pp.status, daysRemaining,
    };
  }));
});

// GET /plans/:id
router.get("/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const plans = await db.select().from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!plans.length) { res.status(404).json({ error: "Plan not found" }); return; }
  res.json(formatPlan(plans[0]));
});

// POST /plans/:id/purchase
router.post("/:id/purchase", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id as string);

  const plans = await db.select().from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!plans.length) { res.status(404).json({ error: "Plan not found" }); return; }
  const plan = plans[0];

  const balance = parseFloat(user.depositBalance ?? "0");
  const price = parseFloat(plan.price);

  if (balance < price) {
    res.status(400).json({ error: "Insufficient deposit balance" });
    return;
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  // Deduct balance
  await db.update(usersTable).set({
    depositBalance: String(balance - price),
  }).where(eq(usersTable.id, user.id));

  // Create purchased plan
  const [pp] = await db.insert(purchasedPlansTable).values({
    planId: id, userId: user.id, endDate, status: "active",
  }).returning();

  // Increment plan purchase count
  await db.update(plansTable).set({ currentPurchases: plan.currentPurchases + 1 }).where(eq(plansTable.id, id));

  // Record transaction
  await db.insert(transactionsTable).values({
    userId: user.id, type: "purchase", amount: String(price),
    description: `Purchased ${plan.name}`, status: "completed",
  });

  // Distribute referral commissions to upline (L1/L2/L3)
  await distributeReferralCommissions(user.id, price, "plan purchase");

  res.json({ id: pp.id, planId: pp.planId, plan: formatPlan(plan), userId: pp.userId,
    startDate: pp.startDate.toISOString(), endDate: pp.endDate.toISOString(),
    totalEarned: 0, status: pp.status, daysRemaining: plan.durationDays });
});

export default router;
