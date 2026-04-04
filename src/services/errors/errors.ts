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
	errors: Record<string, unknown>;
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
	message: string;
}> {}

export class CloudflareR2Error extends Data.TaggedError("CloudflareR2Error")<{
	cause: unknown;
	message: string;
}> {}

export class InternalServerError extends Data.TaggedError(
	"InternalServerError",
)<{
	cause: unknown;
	message: string;
}> {}

export class TtsServiceError extends Data.TaggedError("TtsServiceError")<{
	cause: unknown;
	message: string;
}> {}
