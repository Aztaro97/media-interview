import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { files, fileTags, fileViews, tags } from "@/lib/db/schema";
import { insertFileSchema } from "@/lib/db/schema/files";
import { protectedProcedure, publicProcedure, router } from "@/lib/server/trpc";

export const filesRouter = router({
  // Create a new file record
  create: protectedProcedure
    .input(z.object({
      ...insertFileSchema.omit({ id: true, createdAt: true, updatedAt: true, userId: true }).shape,
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { session } = await getUserAuth();
      if (!session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const fileId = uuidv4();
      const { tags: tagIds, ...fileInput } = input;

      // If tags are provided, verify they exist first
      if (tagIds && tagIds.length > 0) {
        const existingTags = await db.select().from(tags).where(sql`id IN ${tagIds}`);

        if (existingTags.length !== tagIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more tag IDs do not exist',
          });
        }
      }

      // Create the file
      const file = await db.insert(files).values({
        ...fileInput,
        id: fileId,
        userId: session.user.id,
      }).returning();

      // If tags are provided, create the file-tag associations
      if (tagIds && tagIds.length > 0) {
        const fileTagsData = tagIds.map(tagId => ({
          fileId: file[0].id,
          tagId,
        }));

        await db.insert(fileTags).values(fileTagsData);
      }

      return {
        success: true,
      }
    }),

  // Get all files for the authenticated user
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const { session } = await getUserAuth();

      if (!session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }
      
      const items = await db
        .select({
          id: files.id,
          name: files.name,
		  size: files.size,
		  type: files.type,
          createdAt: files.createdAt,
          updatedAt: files.updatedAt,
          userId: files.userId,
          position: files.position,
          viewCount: sql<number>`COUNT(DISTINCT ${fileViews.id})`.as('viewCount'),
          tags: sql<{ id: string; name: string }[]>`
            json_agg(
              json_build_object(
                'id', ${tags.id},
                'name', ${tags.name}
              )
            ) FILTER (WHERE ${tags.id} IS NOT NULL)
          `.as('tags'),
        })
        .from(files)
        .leftJoin(fileTags, eq(files.id, fileTags.fileId))
        .leftJoin(tags, eq(fileTags.tagId, tags.id))
        .leftJoin(fileViews, eq(files.id, fileViews.fileId))
        .groupBy(files.id)
        .limit(input.limit)
        .offset(input.cursor)
        .orderBy(desc(files.createdAt));

      return {
        items: items.map(item => ({
          ...item,
          tags: item.tags || []
        })),
        nextCursor: input.cursor + input.limit,
      };
    }),

  // Update file position (for drag and drop)
  updatePosition: protectedProcedure
    .input(z.object({
      id: z.string(),
      position: z.number(),
    }))
    .mutation(async ({ input }) => {
      
      const file = await db
        .update(files)
        .set({ position: input.position })
        .where(and(
          eq(files.id, input.id),
        ))
        .returning();

      return file[0];
    }),

  // Add tags to a file
  addTags: protectedProcedure
    .input(z.object({
      fileId: z.string(),
      tagIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      
      // Verify file ownership
      const fileExists = await db.query.files.findFirst({
        where: and(
          eq(files.id, input.fileId),
        ),
      });

      if (!fileExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied',
        });
      }

      // Insert file tags
      const fileTagsData = input.tagIds.map(tagId => ({
        fileId: input.fileId,
        tagId,
      }));

      await db.insert(fileTags).values(fileTagsData);
      return true;
    }),

  // Get file by ID (public access for sharing)
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const file = await db
        .select({
          id: files.id,
          name: files.name,
          size: files.size,
          url: files.url,
          type: files.type,
          createdAt: files.createdAt,
          updatedAt: files.updatedAt,
          userId: files.userId,
          position: files.position,
          tags: sql<{ id: string; name: string }[]>`
            json_agg(
              json_build_object(
                'id', ${tags.id},
                'name', ${tags.name}
              )
            ) FILTER (WHERE ${tags.id} IS NOT NULL)
          `.as('tags'),
        })
        .from(files)
        .leftJoin(fileTags, eq(files.id, fileTags.fileId))
        .leftJoin(tags, eq(fileTags.tagId, tags.id))
        .where(eq(files.id, input.id))
        .groupBy(files.id)
        .then(rows => rows[0]);

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      // Record view
      if (input.ipAddress) {
        await db.insert(fileViews).values({
          id: uuidv4(),
          fileId: file.id,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });
      }

      return file;
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { session } = await getUserAuth();
      
      const deleted = await db
        .delete(files)
        .where(and(
          eq(files.id, input.id),
          eq(files.userId, session?.user.id!)
        ))
        .returning();

      if (!deleted.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied',
        });
      }

      return deleted[0];
    }),

  // Get file statistics
  getStats: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {

      const viewsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(fileViews)
        .where(eq(fileViews.fileId, input.id))
        .then(res => res[0].count);

      const file = await db.query.files.findFirst({
        where: and(
          eq(files.id, input.id),
        ),
        with: {
          tags: true,
        },
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or access denied',
        });
      }

      return {
        file,
        viewsCount,
      };
    }),
});
