import { Effect, Schedule } from "effect";
import type { DatabaseError } from "@/services/errors/errors";

const TRANSIENT_ERROR_PATTERNS = [
	"ECONNREFUSED",
	"ECONNRESET",
	"ETIMEDOUT",
	"EPIPE",
	"connection terminated unexpectedly",
	"too many clients",
	"remaining connection slots are reserved",
	"could not connect to server",
	"terminating connection due to administrator command",
	"deadlock detected",
	"serialization failure",
	"could not serialize access",
	"canceling statement due to statement timeout",
	"canceling statement due to lock timeout",
	"server closed the connection unexpectedly",
	"SSL connection has been closed unexpectedly",
	"the database system is starting up",
	"the database system is shutting down",
];

const isTransientDbError = (error: DatabaseError): boolean => {
	const message = String(error.cause);
	return TRANSIENT_ERROR_PATTERNS.some((pattern) =>
		message.toLowerCase().includes(pattern.toLowerCase()),
	);
};

const dbRetrySchedule = Schedule.intersect(
	Schedule.recurs(3),
	Schedule.linear("10 seconds"),
);

export const dbTryPromise = <A>(opts: {
	try: () => Promise<A>;
	catch: (err: unknown) => DatabaseError;
}): Effect.Effect<A, DatabaseError> =>
	Effect.tryPromise(opts).pipe(
		Effect.retry({
			schedule: dbRetrySchedule,
			while: (error) => isTransientDbError(error),
		}),
	);
