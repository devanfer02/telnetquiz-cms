import { studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import {
	CloudflareR2Error,
	DatabaseError,
	InternalServerError,
	NotFoundError,
	ValidationError,
} from "./errors/errors";
import { StudyMaterialFormData, studyMaterialSchema } from "@/types/zod";
import { S3 } from "@/lib/s3";
import z, { ZodError } from "zod";
import { generateFilename } from "@/lib/utils";
import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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

		const parsed = yield* Effect.try({
			try: () => {
				const parsed = studyMaterialSchema
					.extend({
						imageFile: z.instanceof(File).optional(),
					})
					.parse(studyMaterial);

				return parsed;
			},
			catch: (err) => {
				if (err instanceof ZodError) {
					return new ValidationError({
						errors: z.flattenError(err).fieldErrors,
					});
				}

				return new InternalServerError({
					cause: err,
					message: "Failed to parse request body",
				});
			},
		});

		let imageLink: string | null = null;

		if (parsed.imageFile) {
			const filename = generateFilename(parsed.imageFile.name);

			const fileArrayBuf = yield* Effect.tryPromise({
				try: () => parsed.imageFile!.arrayBuffer(),
				catch: (err) =>
					new InternalServerError({
						cause: err,
						message: "Failed to convert to array buffer",
					}),
			});

			const body = new Uint8Array(fileArrayBuf);

			const putObjCommand = new PutObjectCommand({
				Bucket: env.CLOUDFLARE_BUCKET,
				Key: `/study-materials/${filename}`,
				Body: body,
			});

			yield* Effect.tryPromise({
				try: () => s3.send(putObjCommand),
				catch: (err) =>
					new CloudflareR2Error({
						cause: err,
						message: "Failed to write file",
					}),
			});

			imageLink = `${env.CLOUDFLARE_R2_ENDPOINT}/${env.CLOUDFLARE_BUCKET}/study-materials/${filename}`;
		}

		const material = yield* Effect.tryPromise({
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

		return {
			success: true,
			id,
		};
	});
