import { Router } from "express";
import { db, usersTable, bankAccountsTable, depositsTable, withdrawalsTable, transactionsTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import { authenticateToken, hashPassword } from "../lib/auth";

const router = Router();

// GET /profile
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const u = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const fresh = u[0];

  const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, user.id));
  const totalProfit = txs.filter(t => t.type === "profit").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalCommission = txs.filter(t => t.type === "commission").reduce((s, t) => s + parseFloat(t.amount), 0);

  const allDeposits = await db.select().from(depositsTable).where(eq(depositsTable.userId, user.id));
  const totalDeposit = allDeposits.filter(d => d.status === "approved").reduce((s, d) => s + parseFloat(d.amount), 0);

  const allWithdrawals = await db.select().from(depositsTable).where(eq(depositsTable.userId, user.id));
  const totalWithdraw = allWithdrawals.filter(w => (w as any).status === "approved").reduce((s, w) => s + parseFloat(w.amount), 0);

  res.json({
    id: fresh.id, phone: fresh.phone, nickname: fresh.nickname, email: fresh.email ?? null,
    avatarUrl: fresh.avatarUrl ?? null, referralCode: fresh.referralCode,
    totalDeposit, totalWithdraw, totalProfit, totalCommission,
    memberSince: fresh.createdAt.toISOString(),
  });
});

// PUT /profile/update
router.put("/update", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { nickname, email, avatarUrl } = req.body;
  const updates: any = {};
  if (nickname !== undefined) updates.nickname = nickname;
  if (email !== undefined) updates.email = email;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id));
  const u = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const fresh = u[0];

  res.json({
    id: fresh.id, phone: fresh.phone, nickname: fresh.nickname, email: fresh.email ?? null,
    avatarUrl: fresh.avatarUrl ?? null, referralCode: fresh.referralCode,
    totalDeposit: 0, totalWithdraw: 0, totalProfit: 0, totalCommission: 0,
    memberSince: fresh.createdAt.toISOString(),
  });
});

// POST /profile/change-password
router.post("/change-password", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const u = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  if (u[0].passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: "Incorrect current password" });
    return;
  }

  await db.update(usersTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(usersTable.id, user.id));
  res.json({ success: true, message: "Password changed successfully" });
});

// GET /profile/banks
router.get("/banks", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const banks = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.userId, user.id));
  res.json(banks.map(b => ({ id: b.id, accountTitle: b.accountTitle, iban: b.iban, bankName: b.bankName, isDefault: b.isDefault })));
});

// POST /profile/banks
router.post("/banks", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { accountTitle, iban, bankName, isDefault } = req.body;
  if (!accountTitle || !iban || !bankName) {
    res.status(400).json({ error: "accountTitle, iban, and bankName required" });
    return;
  }
  if (isDefault) {
    await db.update(bankAccountsTable).set({ isDefault: false }).where(eq(bankAccountsTable.userId, user.id));
  }
  const [bank] = await db.insert(bankAccountsTable).values({
    userId: user.id, accountTitle, iban, bankName, isDefault: !!isDefault,
  }).returning();
  res.status(201).json({ id: bank.id, accountTitle: bank.accountTitle, iban: bank.iban, bankName: bank.bankName, isDefault: bank.isDefault });
});

export default router;
