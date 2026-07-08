import { Router } from "express";
import { db, usersTable, referralsTable, commissionsTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";
import { getAppBaseUrl } from "../lib/url";

const router = Router();

// GET /referral
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;

  const l1 = await db.select().from(referralsTable).where(and(eq(referralsTable.referrerId, user.id), eq(referralsTable.level, 1)));
  const l2 = await db.select().from(referralsTable).where(and(eq(referralsTable.referrerId, user.id), eq(referralsTable.level, 2)));
  const l3 = await db.select().from(referralsTable).where(and(eq(referralsTable.referrerId, user.id), eq(referralsTable.level, 3)));

  const commissions = await db.select().from(commissionsTable).where(eq(commissionsTable.userId, user.id));
  const totalCommission = commissions.reduce((s, c) => s + parseFloat(c.amount), 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayCommission = commissions
    .filter(c => c.createdAt >= today)
    .reduce((s, c) => s + parseFloat(c.amount), 0);

  res.json({
    referralCode: user.referralCode,
    referralLink: `${getAppBaseUrl(req)}/register?ref=${user.referralCode}`,
    totalReferrals: l1.length + l2.length + l3.length,
    level1Count: l1.length,
    level2Count: l2.length,
    level3Count: l3.length,
    totalCommission,
    todayCommission,
    level1Rate: 7,
    level2Rate: 3,
    level3Rate: 1,
  });
});

// GET /referral/team
router.get("/team", authenticateToken, async (req, res) => {
  const user = (req as any).user;

  async function getLevel(level: number) {
    const refs = await db.select({ ref: referralsTable, u: usersTable })
      .from(referralsTable)
      .innerJoin(usersTable, eq(referralsTable.referredId, usersTable.id))
      .where(and(eq(referralsTable.referrerId, user.id), eq(referralsTable.level, level)));
    return refs.map(({ u }) => ({
      id: u.id, nickname: u.nickname, phone: u.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
      depositBalance: parseFloat(u.depositBalance ?? "0"), joinedAt: u.createdAt.toISOString(),
    }));
  }

  res.json({
    level1: await getLevel(1),
    level2: await getLevel(2),
    level3: await getLevel(3),
  });
});

export default router;
