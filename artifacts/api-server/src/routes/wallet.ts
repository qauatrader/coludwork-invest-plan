import { Router } from "express";
import { db, usersTable, depositsTable, withdrawalsTable, transactionsTable, paymentMethodsTable, systemSettingsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";

const router = Router();

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

// GET /wallet
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const users = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const u = users[0];
  const deposit = parseFloat(u.depositBalance ?? "0");
  const withdraw = parseFloat(u.withdrawBalance ?? "0");
  const profit = parseFloat(u.profitBalance ?? "0");
  const commission = parseFloat(u.commissionBalance ?? "0");
  res.json({
    totalBalance: deposit + withdraw + profit + commission,
    depositBalance: deposit,
    withdrawBalance: withdraw,
    profitBalance: profit,
    commissionBalance: commission,
  });
});

// GET /wallet/settings
router.get("/settings", authenticateToken, async (req, res) => {
  const settingsRows = await db.select().from(systemSettingsTable).limit(1);
  const s = settingsRows[0];
  res.json({
    minDeposit: s ? parseFloat(s.minDeposit) : 0,
    minWithdrawal: s ? parseFloat(s.minWithdrawal) : 0,
    withdrawalFeePercent: s ? parseFloat(s.withdrawalFeePercent) : 2,
  });
});

// POST /wallet/deposit
router.post("/deposit", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { amount, currency, paymentMethod, voucherUrl } = req.body;
  const amountNum = parseFloat(String(amount));
  if (!amount || !currency || !paymentMethod || !Number.isFinite(amountNum) || amountNum <= 0) {
    res.status(400).json({ error: "A valid amount, currency, and paymentMethod are required" });
    return;
  }

  const settingsRows = await db.select().from(systemSettingsTable).limit(1);
  const minDeposit = settingsRows[0] ? parseFloat(settingsRows[0].minDeposit) : 0;
  if (minDeposit && amountNum < minDeposit) {
    res.status(400).json({ error: `Minimum deposit amount is ${minDeposit} PKR` });
    return;
  }

  const [deposit] = await db.insert(depositsTable).values({
    userId: user.id, amount: String(amountNum), currency, paymentMethod, voucherUrl: voucherUrl ?? null,
  }).returning();
  res.json(fmtDeposit(deposit));
});

// POST /wallet/withdraw
router.post("/withdraw", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { amount, walletType, accountTitle, iban, walletAddress } = req.body;
  const amountNum = parseFloat(String(amount));
  if (!amount || !walletType || !Number.isFinite(amountNum) || amountNum <= 0) {
    res.status(400).json({ error: "A valid amount and walletType are required" });
    return;
  }

  const settingsRows = await db.select().from(systemSettingsTable).limit(1);
  const settings = settingsRows[0];
  const feeRate = settings ? parseFloat(settings.withdrawalFeePercent) / 100 : 0.02;
  const minWithdrawal = settings ? parseFloat(settings.minWithdrawal) : 0;

  if (minWithdrawal && amountNum < minWithdrawal) {
    res.status(400).json({ error: `Minimum withdrawal amount is ${minWithdrawal} PKR` });
    return;
  }

  const fee = Math.round(amountNum * feeRate * 100) / 100;
  const netAmount = Math.round((amountNum - fee) * 100) / 100;

  try {
    const result = await db.transaction(async (tx) => {
      const users = await tx.select().from(usersTable).where(eq(usersTable.id, user.id)).for("update").limit(1);
      const freshUser = users[0];
      const balance = parseFloat(freshUser.withdrawBalance ?? "0");
      if (balance < amountNum) return { error: "Insufficient withdrawal balance", status: 400 };

      const [withdrawal] = await tx.insert(withdrawalsTable).values({
        userId: user.id, amount: String(amountNum), fee: String(fee), netAmount: String(netAmount),
        walletType, accountTitle: accountTitle ?? null, iban: iban ?? null, walletAddress: walletAddress ?? null,
      }).returning();

      await tx.update(usersTable)
        .set({ withdrawBalance: sql`${usersTable.withdrawBalance} - ${amountNum}` })
        .where(eq(usersTable.id, user.id));

      return { withdrawal };
    });

    if ("error" in result) {
      res.status(result.status as number).json({ error: result.error });
      return;
    }

    res.json(fmtWithdrawal(result.withdrawal));
  } catch (err) {
    console.error("Withdrawal failed", err);
    res.status(500).json({ error: "Withdrawal failed. Please try again." });
  }
});

// GET /wallet/transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { type = "all", page = "1" } = req.query as any;
  const pageNum = parseInt(page) || 1;
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  let all = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id)).orderBy(desc(transactionsTable.createdAt));
  const filtered = type === "all" ? all : all.filter(t => t.type === type);
  const paged = filtered.slice(offset, offset + limit);

  res.json({
    transactions: paged.map(t => ({
      id: t.id, userId: t.userId, type: t.type, amount: parseFloat(t.amount),
      description: t.description, status: t.status, createdAt: t.createdAt.toISOString(),
    })),
    total: filtered.length,
    page: pageNum,
    totalPages: Math.ceil(filtered.length / limit),
  });
});

// GET /wallet/deposits
router.get("/deposits", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const deps = await db.select().from(depositsTable).where(eq(depositsTable.userId, user.id)).orderBy(desc(depositsTable.createdAt));
  res.json(deps.map(fmtDeposit));
});

// GET /wallet/withdrawals
router.get("/withdrawals", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const withs = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, user.id)).orderBy(desc(withdrawalsTable.createdAt));
  res.json(withs.map(fmtWithdrawal));
});

// GET /wallet/payment-methods
router.get("/payment-methods", authenticateToken, async (req, res) => {
  const methods = await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.isActive, true));
  res.json(methods.map(m => ({
    id: m.id, name: m.name, type: m.type, accountNumber: m.accountNumber,
    accountTitle: m.accountTitle, isActive: m.isActive,
  })));
});

export default router;
