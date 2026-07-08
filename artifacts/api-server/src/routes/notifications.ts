import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";

const router = Router();

function fmt(n: any) {
  return { id: n.id, title: n.title, message: n.message, type: n.type, isRead: n.isRead, createdAt: n.createdAt.toISOString() };
}

// GET /notifications
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(notifs.map(fmt));
});

// POST /notifications/:id/read
router.post("/:id/read", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id));
  res.json({ success: true, message: "Marked as read" });
});

// POST /notifications/read-all
router.post("/read-all", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, user.id));
  res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
