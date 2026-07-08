import { Router } from "express";
import { db, supportMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";

const router = Router();

function fmt(m: any) {
  return { id: m.id, userId: m.userId, message: m.message, isAdmin: m.isAdmin, createdAt: m.createdAt.toISOString() };
}

// GET /support/messages
router.get("/messages", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const messages = await db.select().from(supportMessagesTable)
    .where(eq(supportMessagesTable.userId, user.id))
    .orderBy(supportMessagesTable.createdAt);
  res.json(messages.map(fmt));
});

// POST /support/messages
router.post("/messages", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { message } = req.body;
  if (!message) { res.status(400).json({ error: "Message required" }); return; }
  const [msg] = await db.insert(supportMessagesTable).values({
    userId: user.id, message, isAdmin: false,
  }).returning();
  res.status(201).json(fmt(msg));
});

export default router;
