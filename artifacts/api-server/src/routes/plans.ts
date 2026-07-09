import { Router } from "express";
import { db, plansTable, purchasedPlansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
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
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid plan id" }); return; }
  const plans = await db.select().from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!plans.length) { res.status(404).json({ error: "Plan not found" }); return; }
  res.json(formatPlan(plans[0]));
});

// POST /plans/:id/purchase
router.post("/:id/purchase", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id as string);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "Invalid plan id" }); return; }

  try {
    const result = await db.transaction(async (tx) => {
      // Lock plan row for update to prevent race conditions
      const plans = await tx.select().from(plansTable).where(eq(plansTable.id, id)).for("update").limit(1);
      if (!plans.length) return { error: "Plan not found", status: 404 };
      const plan = plans[0];

      if (!plan.isActive) return { error: "Plan is not active", status: 400 };
      if (plan.maxPurchases !== null && plan.maxPurchases !== undefined && plan.currentPurchases >= plan.maxPurchases) {
        return { error: "Plan purchase limit reached", status: 400 };
      }

      // Re-read fresh user balance inside transaction
      const users = await tx.select().from(usersTable).where(eq(usersTable.id, user.id)).for("update").limit(1);
      const freshUser = users[0];
      const balance = parseFloat(freshUser.depositBalance ?? "0");
      const price = parseFloat(plan.price);

      if (balance < price) return { error: "Insufficient deposit balance", status: 400 };

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Deduct balance
      await tx.update(usersTable).set({
        depositBalance: String(balance - price),
      }).where(eq(usersTable.id, user.id));

      // Create purchased plan
      const [pp] = await tx.insert(purchasedPlansTable).values({
        planId: id, userId: user.id, endDate, status: "active",
      }).returning();

      // Atomic increment of plan purchase count
      await tx.update(plansTable)
        .set({ currentPurchases: sql`${plansTable.currentPurchases} + 1` })
        .where(eq(plansTable.id, id));

      // Record transaction
      await tx.insert(transactionsTable).values({
        userId: user.id, type: "purchase", amount: String(price),
        description: `Purchased ${plan.name}`, status: "completed",
      });

      // Distribute referral commissions atomically within the same transaction
      await distributeReferralCommissions(tx, user.id, price, `Purchased ${plan.name}`);

      return { pp, plan, price, endDate };
    });

    if ("error" in result) {
      res.status(result.status as number).json({ error: result.error });
      return;
    }

    res.json({
      id: result.pp.id, planId: result.pp.planId, plan: formatPlan(result.plan), userId: result.pp.userId,
      startDate: result.pp.startDate.toISOString(), endDate: result.endDate.toISOString(),
      totalEarned: 0, status: result.pp.status, daysRemaining: result.plan.durationDays,
    });
  } catch (err) {
    console.error("Plan purchase failed", err);
    res.status(500).json({ error: "Plan purchase failed. Please try again." });
  }
});

export default router;
