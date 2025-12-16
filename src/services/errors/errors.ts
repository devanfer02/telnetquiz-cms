import { Data } from "effect";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	cause: unknown;
	message: string;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
	id: number | string;
	entity: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
	errors: Record<string, any>;
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
	message: string;
}> {}
