import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Effect } from "effect";
import { env } from "@/lib/env";
import { S3 } from "@/lib/s3";
import { generateFilename, getFileExtension } from "@/lib/utils";
import { CloudflareR2Error, InternalServerError } from "./errors/errors";

export const uploadFile = (file: File) =>
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
			Key: `study-materials/${filename}`,
			Body: body,
			ContentType: getFileExtension(file.name),
		});

		yield* Effect.tryPromise({
			try: () => s3.send(putObjCommand),
			catch: (err) =>
				new CloudflareR2Error({
					cause: err,
					message: "Failed to write file",
				}),
		});

		const imageLink = `${env.CLOUDFLARE_R2_DOMAIN}/study-materials/${filename}`;

		return imageLink;
	});

export const deleteFile = (imageUrl: string) =>
	Effect.gen(function* () {
		const { s3 } = yield* S3;

		const deleteObjCommand = new DeleteObjectCommand({
			Bucket: env.CLOUDFLARE_BUCKET,
			Key: new URL(imageUrl).pathname.slice(1),
		});

		yield* Effect.tryPromise({
			try: () => s3.send(deleteObjCommand),
			catch: (err) =>
				new CloudflareR2Error({
					cause: err,
					message: "Failed to delete file",
				}),
		});
	});
