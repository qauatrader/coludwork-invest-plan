import { pgTable, serial, text, boolean, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  nickname: text("nickname").notNull(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),
  walletBalance: numeric("wallet_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  depositBalance: numeric("deposit_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  withdrawBalance: numeric("withdraw_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  profitBalance: numeric("profit_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  commissionBalance: numeric("commission_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
