import { router } from "@/lib/server/trpc";
import { accountRouter } from "./account";
import { computersRouter } from "./computers";
import { filesRouter } from "./files";
import { s3Router } from "./s3";
import { tagsRouter } from "./tags";

export const appRouter = router({
  computers: computersRouter,
  account: accountRouter,
  files: filesRouter,
  s3: s3Router,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
