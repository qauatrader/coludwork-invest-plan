import { db, usersTable, referralsTable, commissionsTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

type DB = typeof db;

const COMMISSION_RATES: Record<number, number> = { 1: 0.07, 2: 0.03, 3: 0.01 };

export async function distributeReferralCommissions(
  dbOrTx: DB | Parameters<DB["transaction"]>[0] extends (tx: infer T) => any ? T : any,
  fromUserId: number,
  baseAmount: number,
  sourceLabel: string,
) {
  const uplineRefs = await dbOrTx.select({ ref: referralsTable, referrer: usersTable })
    .from(referralsTable)
    .innerJoin(usersTable, eq(referralsTable.referrerId, usersTable.id))
    .where(eq(referralsTable.referredId, fromUserId));

  for (const { ref, referrer } of uplineRefs) {
    const rate = COMMISSION_RATES[ref.level];
    if (!rate) continue;
    const commissionAmount = Math.round(baseAmount * rate * 100) / 100;

    await dbOrTx.insert(commissionsTable).values({
      userId: referrer.id, fromUserId, level: ref.level,
      amount: String(commissionAmount),
      description: `Level ${ref.level} commission from ${sourceLabel}`,
    });

    await dbOrTx.update(usersTable)
      .set({ commissionBalance: sql`${usersTable.commissionBalance} + ${commissionAmount}` })
      .where(eq(usersTable.id, referrer.id));

    await dbOrTx.insert(notificationsTable).values({
      userId: referrer.id, title: "Referral Commission", message: `You earned Rs.${commissionAmount.toFixed(2)} Level ${ref.level} commission.`, type: "commission_earned",
    });
  }
}
