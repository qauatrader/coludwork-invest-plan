import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const plansTable = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  price: numeric("price", { precision: 18, scale: 2 }).notNull(),
  dailyProfitRate: numeric("daily_profit_rate", { precision: 8, scale: 4 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  maxPurchases: integer("max_purchases"),
  currentPurchases: integer("current_purchases").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plansTable).omit({ id: true, createdAt: true });
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plansTable.$inferSelect;

export const purchasedPlansTable = pgTable("purchased_plans", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plansTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  totalEarned: numeric("total_earned", { precision: 18, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPurchasedPlanSchema = createInsertSchema(purchasedPlansTable).omit({ id: true, createdAt: true });
export type InsertPurchasedPlan = z.infer<typeof insertPurchasedPlanSchema>;
export type PurchasedPlan = typeof purchasedPlansTable.$inferSelect;
