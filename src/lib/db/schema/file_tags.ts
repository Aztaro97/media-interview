import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { files } from "./files";
import { tags } from "./tags";

export const fileTags = pgTable("file_tags", {
	id: serial("id").primaryKey(),
  fileId: varchar("file_id", { length: 255 })
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  tagId: varchar("tag_id", { length: 255 })
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

