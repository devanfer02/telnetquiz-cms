import { and, asc, count, eq, ilike } from "drizzle-orm";
import { Effect } from "effect";
import { schools } from "@/database/schema";
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

export const fetchVisibleSchools = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () =>
			db
				.select()
				.from(schools)
				.where(eq(schools.isHidden, false))
				.orderBy(asc(schools.name)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch visible schools",
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

export const hideSchool = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(schools)
					.set({ isHidden: true })
					.where(eq(schools.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to hide school with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "School" }));
		}

		return result[0];
	});

export const unhideSchool = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(schools)
					.set({ isHidden: false })
					.where(eq(schools.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to unhide school with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "School" }));
		}

		return result[0];
	});

export const fetchSchoolsPaginated = (
	search?: string,
	limit = 20,
	offset = 0,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const notHidden = eq(schools.isHidden, false);
		const whereClause = search
			? and(notHidden, ilike(schools.name, `%${search}%`))
			: notHidden;

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
