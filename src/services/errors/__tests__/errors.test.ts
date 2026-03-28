import { describe, expect, it } from "vitest";
import {
	AuthError,
	CloudflareR2Error,
	DatabaseError,
	InternalServerError,
	NotFoundError,
	ValidationError,
} from "../errors";

describe("DatabaseError", () => {
	it("creates with correct tag and fields", () => {
		const err = new DatabaseError({
			cause: new Error("connection refused"),
			message: "DB unreachable",
		});
		expect(err._tag).toBe("DatabaseError");
		expect(err.message).toBe("DB unreachable");
		expect(err.cause).toBeInstanceOf(Error);
	});
});

describe("NotFoundError", () => {
	it("creates with numeric id", () => {
		const err = new NotFoundError({ id: 42, entity: "Quiz" });
		expect(err._tag).toBe("NotFoundError");
		expect(err.id).toBe(42);
		expect(err.entity).toBe("Quiz");
	});

	it("creates with string id", () => {
		const err = new NotFoundError({ id: "abc-123", entity: "User" });
		expect(err.id).toBe("abc-123");
	});
});

describe("ValidationError", () => {
	it("creates with field errors", () => {
		const errors = { name: "required", email: "invalid format" };
		const err = new ValidationError({ errors });
		expect(err._tag).toBe("ValidationError");
		expect(err.errors).toEqual(errors);
	});
});

describe("AuthError", () => {
	it("creates with message", () => {
		const err = new AuthError({ message: "Unauthorized" });
		expect(err._tag).toBe("AuthError");
		expect(err.message).toBe("Unauthorized");
	});
});

describe("CloudflareR2Error", () => {
	it("creates with correct tag and fields", () => {
		const err = new CloudflareR2Error({
			cause: new Error("upload failed"),
			message: "R2 upload error",
		});
		expect(err._tag).toBe("CloudflareR2Error");
		expect(err.message).toBe("R2 upload error");
	});
});

describe("InternalServerError", () => {
	it("creates with correct tag and fields", () => {
		const err = new InternalServerError({
			cause: "unknown",
			message: "Something went wrong",
		});
		expect(err._tag).toBe("InternalServerError");
		expect(err.message).toBe("Something went wrong");
		expect(err.cause).toBe("unknown");
	});
});
