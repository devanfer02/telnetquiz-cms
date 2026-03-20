import { asc, count, eq, ilike, sql } from "drizzle-orm";
import { Effect } from "effect";
import { schools, users } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { SchoolFormData } from "@/types/zod";
import { DatabaseError, NotFoundError } from "./errors/errors";

export const fetchAllSchools = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () => db.select().from(schools).orderBy(asc(schools.name)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch schools",
			}),
	});
});

export const fetchSchoolById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () => db.select().from(schools).where(eq(schools.id, id)).limit(1),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch school with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "School" }));
		}

		return result[0];
	});

export const createSchool = (data: SchoolFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () => db.insert(schools).values(data).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to create school",
				}),
		});

		return result[0];
	});

export const patchSchool = (id: number, data: SchoolFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db.update(schools).set(data).where(eq(schools.id, id)).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update school with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "School" }));
		}

		return result[0];
	});

export const deleteSchool = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const userCount = yield* dbTryPromise({
			try: () =>
				db
					.select({ count: sql<number>`count(*)` })
					.from(users)
					.where(eq(users.schoolId, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to check users for school ${id}`,
				}),
		});

		if (userCount[0].count > 0) {
			return yield* Effect.fail(
				new DatabaseError({
					cause: null,
					message: "Cannot delete school with existing users",
				}),
			);
		}

		yield* dbTryPromise({
			try: () => db.delete(schools).where(eq(schools.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete school with id ${id}`,
				}),
		});

		return { success: true, id };
	});

export const fetchSchoolsPaginated = (
	search?: string,
	limit = 20,
	offset = 0,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const whereClause = search ? ilike(schools.name, `%${search}%`) : undefined;

		const totalResult = yield* dbTryPromise({
			try: () => db.select({ count: count() }).from(schools).where(whereClause),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to count schools",
				}),
		});

		const total = totalResult[0].count;

		const schoolList = yield* dbTryPromise({
			try: () =>
				db
					.select()
					.from(schools)
					.where(whereClause)
					.orderBy(asc(schools.name))
					.limit(limit)
					.offset(offset),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch paginated schools",
				}),
		});

		return {
			schools: schoolList,
			pagination: {
				total,
				limit,
				offset,
				hasNextPage: offset + limit < total,
			},
		};
	});
