import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { files } from "./files";

export const fileViews = pgTable("file_views", {
  id: varchar("id", { length: 255 }).primaryKey(),
  fileId: varchar("file_id", { length: 255 })
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

