import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const systemSettingsTable = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("CloudsWork"),
  withdrawalFeePercent: numeric("withdrawal_fee_percent", { precision: 8, scale: 2 }).notNull().default("2"),
  minDeposit: numeric("min_deposit", { precision: 18, scale: 2 }).notNull().default("500"),
  minWithdrawal: numeric("min_withdrawal", { precision: 18, scale: 2 }).notNull().default("1000"),
  referralLevel1Rate: numeric("referral_level1_rate", { precision: 8, scale: 2 }).notNull().default("7"),
  referralLevel2Rate: numeric("referral_level2_rate", { precision: 8, scale: 2 }).notNull().default("3"),
  referralLevel3Rate: numeric("referral_level3_rate", { precision: 8, scale: 2 }).notNull().default("1"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  link: text("link"),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;
