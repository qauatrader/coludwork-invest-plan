import { Router } from "express";
import { db, usersTable, sessionsTable, referralsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, hashPassword, verifyPassword, generateReferralCode, authenticateToken, formatUser } from "../lib/auth";
import { loginRateLimiter } from "../lib/rateLimiter";

const router = Router();

// POST /auth/login
router.post("/login", loginRateLimiter, async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || typeof phone !== "string" || !password || typeof password !== "string") {
    res.status(400).json({ error: "Phone and password required" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = users[0];
  if (!verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

  res.json({ token, user: formatUser(user) });
});

// POST /auth/register
router.post("/register", async (req, res) => {
  const { phone, password, confirmPassword, nickname, referralCode } = req.body;

  if (!phone || !password || !nickname || typeof phone !== "string" || typeof password !== "string" || typeof nickname !== "string") {
    res.status(400).json({ error: "Phone, password, and nickname required" });
    return;
  }

  if (!/^\+?[0-9]{7,15}$/.test(phone.trim())) {
    res.status(400).json({ error: "Invalid phone number format" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length) {
    res.status(400).json({ error: "Phone number already registered" });
    return;
  }

  let referredBy: string | null = null;
  if (referralCode) {
    const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
    if (referrer.length) {
      referredBy = referralCode;
    }
  }

  const newRefCode = generateReferralCode();
  const [user] = await db.insert(usersTable).values({
    phone,
    nickname,
    passwordHash: hashPassword(password),
    referralCode: newRefCode,
    referredBy,
  }).returning();

  if (referredBy) {
    const [directReferrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referredBy)).limit(1);
    if (directReferrer) {
      await db.insert(referralsTable).values({ referrerId: directReferrer.id, referredId: user.id, level: 1 });

      if (directReferrer.referredBy) {
        const [l2Referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, directReferrer.referredBy)).limit(1);
        if (l2Referrer) {
          await db.insert(referralsTable).values({ referrerId: l2Referrer.id, referredId: user.id, level: 2 });

          if (l2Referrer.referredBy) {
            const [l3Referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, l2Referrer.referredBy)).limit(1);
            if (l3Referrer) {
              await db.insert(referralsTable).values({ referrerId: l3Referrer.id, referredId: user.id, level: 3 });
            }
          }
        }
      }
    }
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt });

  res.status(201).json({ token, user: formatUser(user) });
});

// POST /auth/logout
router.post("/logout", authenticateToken, async (req, res) => {
  const authHeader = req.headers.authorization!;
  const token = authHeader.slice(7);
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  res.json({ success: true, message: "Logged out" });
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { phone } = req.body;
  const users = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  // Always return success for security
  res.json({ success: true, message: "If the account exists, a reset code has been sent" });
});

// GET /auth/me
router.get("/me", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  // Refresh from DB
  const fresh = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  res.json(formatUser(fresh[0]));
});

export default router;
