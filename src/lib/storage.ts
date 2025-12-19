import { S3Client } from "bun";
import { env } from "./env";
import { Context, Layer } from "effect";

export const r2client = new S3Client({
	accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
	secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
	bucket: env.CLOUDFLARE_BUCKET,
	endpoint: env.CLOUDFLARE_R2_ENDPOINT,
});

export class R2Client extends Context.Tag("R2")<
	R2Client,
	{ r2client: typeof r2client }
>() {}

export const R2Layer = Layer.succeed(R2Client, { r2client });
