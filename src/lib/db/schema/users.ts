import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { files } from "./files";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", {
	mode: "date",
}).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  files: many(files),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
