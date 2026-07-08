import { Router } from "express";
import { db, tasksTable, taskCompletionsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticateToken } from "../lib/auth";

const router = Router();

// GET /tasks
router.get("/", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.isActive, true));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const completedToday = await db.select().from(taskCompletionsTable)
    .where(and(eq(taskCompletionsTable.userId, user.id)));

  const completedIds = new Set(completedToday
    .filter(c => c.completedAt >= today)
    .map(c => c.taskId));

  res.json(tasks.map(t => ({
    id: t.id, title: t.title, description: t.description, type: t.type,
    reward: parseFloat(t.reward), link: t.link ?? null,
    isCompleted: completedIds.has(t.id), isActive: t.isActive,
  })));
});

// POST /tasks/:id/complete
router.post("/:id/complete", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const taskId = parseInt(req.params.id as string);

  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId)).limit(1);
  if (!tasks.length) { res.status(404).json({ error: "Task not found" }); return; }
  const task = tasks[0];

  // Check if already completed today
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const existing = await db.select().from(taskCompletionsTable)
    .where(and(eq(taskCompletionsTable.taskId, taskId), eq(taskCompletionsTable.userId, user.id)));

  if (existing.some(c => c.completedAt >= today)) {
    res.status(400).json({ error: "Task already completed today" });
    return;
  }

  await db.insert(taskCompletionsTable).values({ taskId, userId: user.id });

  const reward = parseFloat(task.reward);
  // Add reward to wallet
  const users = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  const currentBalance = parseFloat(users[0].profitBalance ?? "0");
  await db.update(usersTable).set({ profitBalance: String(currentBalance + reward) }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id, type: "bonus", amount: String(reward),
    description: `Task reward: ${task.title}`, status: "completed",
  });

  res.json({ success: true, reward, message: `You earned ${reward} PKR!` });
});

export default router;
