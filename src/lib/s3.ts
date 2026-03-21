import { S3Client } from "@aws-sdk/client-s3";
import { Context, Layer } from "effect";
import { env } from "./env";

export const s3 = new S3Client({
	region: "auto", // Required by SDK but not used by R2
	// Provide your Cloudflare account ID
	endpoint: `${env.CLOUDFLARE_R2_API}`,
	// Retrieve your S3 API credentials for your R2 bucket via API tokens (see: https://developers.cloudflare.com/r2/api/tokens)
	credentials: {
		accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
		secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
	},
});

export class S3 extends Context.Tag("R2")<S3, { s3: typeof s3 }>() {}

export const S3Layer = Layer.succeed(S3, { s3 });
