import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { fetchStudyMaterialById } from "@/services/content/study-material";
import { invalidateTtsCache } from "@/services/tts/cache";
import { DatabaseError, NotFoundError } from "../errors/errors";

export type UpdateStudyMaterialFromImportPayload = {
	title: string;
	content: string;
	imageLink: string | null;
};

export const updateStudyMaterialFromImport = (
	id: number,
	data: UpdateStudyMaterialFromImportPayload,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* fetchStudyMaterialById(id);

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(studyMaterials)
					.set({
						title: data.title,
						content: data.content,
						imageLink: data.imageLink,
					})
					.where(eq(studyMaterials.id, id))
					.returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to import-update study material with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		yield* invalidateTtsCache("material", id).pipe(
			Effect.catchAll(() => Effect.void),
		);

		return { id };
	});
