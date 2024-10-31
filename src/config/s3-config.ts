import { env } from "@/lib/env.mjs";
import {
	S3
} from "@aws-sdk/client-s3";

export const s3 = new S3({
	region: "auto",
	endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.CLOUDFLARE_ACCESS_ID,
		secretAccessKey: env.CLOUDFLARE_ACCESS_KEY,
	},
});