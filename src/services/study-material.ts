import { studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import {
	CloudflareR2Error,
	DatabaseError,
	InternalServerError,
	NotFoundError,
} from "./errors/errors";
import { StudyMaterialFormData } from "@/types/zod";
import { S3 } from "@/lib/s3";
import { generateFilename, getFileExtension } from "@/lib/utils";
import { env } from "@/lib/env";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const fetchAllStudyMaterials = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () =>
			db.select().from(studyMaterials).orderBy(desc(studyMaterials.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch study materials",
			}),
	});
});

export const fetchStudyMaterialById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.studyMaterials.findFirst({
					where: eq(studyMaterials.id, id),
					with: {
						questions: true,
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch study material with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		return result;
	});

export const createStudyMaterial = (studyMaterial: StudyMaterialFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;
		const { s3 } = yield* S3;

		let imageLink: string | null = null;

		if (studyMaterial.imageFile) {
			const filename = generateFilename(studyMaterial.imageFile.name);

			const fileArrayBuf = yield* Effect.tryPromise({
				try: () => studyMaterial.imageFile!.arrayBuffer(),
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
				ContentType: getFileExtension(studyMaterial.imageFile.name),
			});

			yield* Effect.tryPromise({
				try: () => s3.send(putObjCommand),
				catch: (err) =>
					new CloudflareR2Error({
						cause: err,
						message: "Failed to write file",
					}),
			});

			imageLink = `${env.CLOUDFLARE_R2_DOMAIN}/study-materials/${filename}`;
		}

		const [material] = yield* Effect.tryPromise({
			try: () =>
				db
					.insert(studyMaterials)
					.values({
						title: studyMaterial.title,
						content: studyMaterial.content,
						imageLink,
					})
					.returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to create study material transaction",
				}),
		});

		return material;
	});

export const patchStudyMaterial = (
	id: number,
	studyMaterial: StudyMaterialFormData,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db
					.update(studyMaterials)
					.set(studyMaterial)
					.where(eq(studyMaterials.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update study material with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		return result[0];
	});

export const deleteStudyMaterialById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;
		const { s3 } = yield* S3;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.delete(studyMaterials).where(eq(studyMaterials.id, id)).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete study material with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		if (result[0].imageLink) {
			const deleteObjCommand = new DeleteObjectCommand({
				Bucket: env.CLOUDFLARE_BUCKET,
				Key: new URL(result[0].imageLink).pathname.slice(1),
			});

			yield* Effect.tryPromise({
				try: () => s3.send(deleteObjCommand),
				catch: (err) =>
					new CloudflareR2Error({
						cause: err,
						message: "Failed to delete file",
					}),
			});
		}

		return {
			success: true,
			id,
		};
	});
