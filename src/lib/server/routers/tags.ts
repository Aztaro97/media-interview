import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { insertTagSchema } from "@/lib/db/schema/tags";
import { protectedProcedure, router } from "@/lib/server/trpc";

export const tagsRouter = router({
  // Get all tags for the authenticated user
  getAll: protectedProcedure.query(async () => {
    const { session } = await getUserAuth();
    
    if (!session?.user?.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const userTags = await db
      .select()
      .from(tags)
      .orderBy(desc(tags.createdAt));

    return userTags;
  }),

  getAllTagsOptions: protectedProcedure.query(async () => {
    const userTags = await db
      .select()
      .from(tags)
      .orderBy(desc(tags.createdAt));

    return userTags.map((tag) => ({
      label: tag.name,
      value: tag.id,
    }));
  }),

  // Create a new tag
  create: protectedProcedure
    .input(insertTagSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ input }) => {
      const { session } = await getUserAuth();
      
      if (!session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const tag = await db.insert(tags).values({
        id: uuidv4(),
        name: input.name,
      }).returning();

      return tag[0];
    }),

  // Delete a tag
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {      
      const deleted = await db
        .delete(tags)
        .where(and(
          eq(tags.id, input.id),
        ))
        .returning();

      if (!deleted.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found or access denied',
        });
      }

      return deleted[0];
    }),

  // Update a tag
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const updated = await db
        .update(tags)
        .set({ 
          name: input.name,
          updatedAt: new Date(),
        })
        .where(and(
          eq(tags.id, input.id),
        ))
        .returning();

      if (!updated.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tag not found or access denied',
        });
      }

      return updated[0];
    }),
});