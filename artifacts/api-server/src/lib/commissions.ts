import { db, usersTable, referralsTable, commissionsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const COMMISSION_RATES: Record<number, number> = { 1: 0.07, 2: 0.03, 3: 0.01 };

export async function distributeReferralCommissions(fromUserId: number, baseAmount: number, sourceLabel: string) {
  const uplineRefs = await db.select({ ref: referralsTable, referrer: usersTable })
    .from(referralsTable)
    .innerJoin(usersTable, eq(referralsTable.referrerId, usersTable.id))
    .where(eq(referralsTable.referredId, fromUserId));

  for (const { ref, referrer } of uplineRefs) {
    const rate = COMMISSION_RATES[ref.level];
    if (!rate) continue;
    const commissionAmount = baseAmount * rate;
    await db.insert(commissionsTable).values({
      userId: referrer.id, fromUserId, level: ref.level,
      amount: String(commissionAmount),
      description: `Level ${ref.level} commission from ${sourceLabel}`,
    });
    const referrerNewCommissionBalance = parseFloat(referrer.commissionBalance ?? "0") + commissionAmount;
    await db.update(usersTable).set({ commissionBalance: String(referrerNewCommissionBalance) }).where(eq(usersTable.id, referrer.id));
    await db.insert(notificationsTable).values({
      userId: referrer.id, title: "Referral Commission", message: `You earned Rs.${commissionAmount.toFixed(2)} Level ${ref.level} commission.`, type: "commission_earned",
    });
  }
}
