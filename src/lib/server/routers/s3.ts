import { s3 } from "@/config/s3-config";
import { env } from "@/lib/env.mjs";
import { publicProcedure, router } from "@/lib/server/trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const s3Router = router({
  getStandardUploadPresignedUrl: publicProcedure
    .input(z.object({ key: z.string(), directoryPath: z.string().optional().default("uploads") }))
    .mutation(async ({ input }) => {
      const key = `${input.directoryPath}/${uuidv4()}-${input.key}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        ACL: "public-read",
      });

      const fileUrl = `https://pub-06a55db2f4d842f2b0749179adb322b4.r2.dev/${key}`;
      const presignedUrl = await getSignedUrl(s3, putObjectCommand);

      return { presignedUrl, fileUrl };
    }),
});
