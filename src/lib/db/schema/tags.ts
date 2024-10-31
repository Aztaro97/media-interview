import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const tags = pgTable("tags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);
