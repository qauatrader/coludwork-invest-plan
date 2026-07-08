import { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    // Legacy SHA-256 hashes (pre-scrypt migration) — same fixed length, safe to compare directly
    const legacy = crypto.createHash("sha256").update(password + "cloudswork_salt").digest("hex");
    if (legacy.length !== stored.length) return false;
    return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(stored));
  }
  const hashBuffer = Buffer.from(hash, "hex");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  if (derived.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(derived, hashBuffer);
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const sessions = await db
    .select({ session: sessionsTable, user: usersTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.token, token))
    .limit(1);

  if (!sessions.length || sessions[0].session.expiresAt < new Date()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  (req as any).user = sessions[0].user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = (req as any).user;
  if (!user?.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function formatUser(user: any) {
  return {
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    email: user.email ?? null,
    avatarUrl: user.avatarUrl ?? null,
    referralCode: user.referralCode,
    referredBy: user.referredBy ?? null,
    isAdmin: user.isAdmin,
    isSuspended: user.isSuspended,
    walletBalance: parseFloat(user.walletBalance ?? "0"),
    depositBalance: parseFloat(user.depositBalance ?? "0"),
    withdrawBalance: parseFloat(user.withdrawBalance ?? "0"),
    createdAt: user.createdAt.toISOString(),
  };
}
