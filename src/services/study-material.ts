import { desc, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { StudyMaterialFormData } from "@/types/zod";
import { DatabaseError, NotFoundError } from "./errors/errors";
import { deleteFile, uploadFile } from "./image";
import { invalidateTtsCache } from "./tts";

export const fetchAllStudyMaterials = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
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

		const result = yield* dbTryPromise({
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

export const fetchStudyMaterialsByIds = (ids: number[]) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		return yield* dbTryPromise({
			try: () =>
				db.query.studyMaterials.findMany({
					where: inArray(studyMaterials.id, ids),
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch study materials by ids",
				}),
		});
	});

export const createStudyMaterial = (studyMaterial: StudyMaterialFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		let imageLink: string | null = null;

		if (studyMaterial.imageFile) {
			imageLink = yield* uploadFile(studyMaterial.imageFile);
		}

		const [material] = yield* dbTryPromise({
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

		const material = yield* fetchStudyMaterialById(id);
		const payload = {
			title: studyMaterial.title,
			content: studyMaterial.content,
			imageLink: material.imageLink,
		};

		if (material.imageLink) {
			yield* deleteFile(material.imageLink);
		}

		if (studyMaterial.imageFile) {
			payload.imageLink = yield* uploadFile(studyMaterial.imageFile);
		}

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(studyMaterials)
					.set(payload)
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

		// Fire-and-forget TTS cache invalidation
		yield* invalidateTtsCache("material", id).pipe(
			Effect.catchAll(() => Effect.void),
		);

		return result[0];
	});

export const deleteStudyMaterialById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
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
			yield* deleteFile(result[0].imageLink);
		}

		return {
			success: true,
			id,
		};
	});
