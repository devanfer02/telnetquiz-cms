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
import { R2Client } from "@/lib/storage";
import { ulid } from "ulid";
import z, { ZodError } from "zod";
import { generateFilename } from "@/lib/utils";
import { env } from "@/lib/env";

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
		const { r2client } = yield* R2Client;

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

			yield* Effect.tryPromise({
				try: () =>
					r2client.write(filename, studyMaterial.imageFile, {
						type: "image/png",
						acl: "public-read",
					}),
				catch: (err) =>
					new CloudflareR2Error({
						cause: err,
						message: "Failed to write file",
					}),
			});

			imageLink = `${env.CLOUDFLARE_R2_ENDPOINT}/${env.CLOUDFLARE_BUCKET}/${filename}`;
		}

		const [material] = yield* Effect.tryPromise({
			try: () =>
				db
					.insert(studyMaterials)
					.values({
						title: studyMaterial.title,
						content: studyMaterial.content,
						imageLink: imageLink,
					})
					.returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to insert study material",
				}),
		});

		return material;
	});
