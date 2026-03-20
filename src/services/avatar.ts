import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Effect } from "effect";
import { env } from "@/lib/env";
import { S3 } from "@/lib/s3";
import { generateFilename, getFileExtension } from "@/lib/utils";
import { CloudflareR2Error, InternalServerError } from "./errors/errors";

export const uploadAvatar = (file: File) =>
	Effect.gen(function* () {
		const { s3 } = yield* S3;

		const filename = generateFilename(file.name);

		const fileArrayBuf = yield* Effect.tryPromise({
			try: () => file.arrayBuffer(),
			catch: (err) =>
				new InternalServerError({
					cause: err,
					message: "Failed to convert to array buffer",
				}),
		});

		const body = new Uint8Array(fileArrayBuf);

		const putObjCommand = new PutObjectCommand({
			Bucket: env.CLOUDFLARE_BUCKET,
			Key: `avatars/${filename}`,
			Body: body,
			ContentType: getFileExtension(file.name),
		});

		yield* Effect.tryPromise({
			try: () => s3.send(putObjCommand),
			catch: (err) =>
				new CloudflareR2Error({
					cause: err,
					message: "Failed to upload avatar",
				}),
		});

		const imageLink = `${env.CLOUDFLARE_R2_DOMAIN}/avatars/${filename}`;

		return imageLink;
	});
