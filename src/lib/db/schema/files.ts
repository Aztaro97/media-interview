import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const files = pgTable("files", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image' or 'video'
  size: integer("size").notNull(),
//   userId: varchar("user_id", { length: 255 })
//     .notNull()
//     .references(() => users.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);
