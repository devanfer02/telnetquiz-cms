import { Effect } from "effect";
import type { z } from "zod";
import { getSheetsClient } from "@/lib/google-sheets";
import {
	type ImportOptionData,
	materialRowSchema,
	pretestRowSchema,
	quizRowSchema,
} from "@/types/zod";
import { fetchQuestionsByType } from "../content/questions";
import { fetchAllStudyMaterials } from "../content/study-material";
import { GoogleSheetsError } from "../errors/errors";
import { stripHtml } from "../export/sheets";
import { updateQuestionFromImport } from "./questions";
import { updateStudyMaterialFromImport } from "./study-materials";

const PRETEST_TAB = "Pretest";
const QUIZ_TAB = "Pertanyaan Quiz";
const MATERIAL_TAB = "Materi Belajar";

const PRETEST_COLS = {
	id: 0,
	bab: 1,
	description: 2,
	question: 3,
	imageLink: 4,
	preview: 5,
	options: 6,
} as const;

const QUIZ_COLS = {
	id: 0,
	bab: 1,
	level: 2,
	quizTitle: 3,
	difficulty: 4,
	description: 5,
	question: 6,
	imageLink: 7,
	preview: 8,
	options: 9,
} as const;

const MATERIAL_COLS = {
	id: 0,
	title: 1,
	content: 2,
	imageLink: 3,
	preview: 4,
} as const;

type SheetRow = (string | number | null | undefined)[];

type QuestionDbRow = Effect.Effect.Success<
	ReturnType<typeof fetchQuestionsByType>
>[number];

type MaterialDbRow = Effect.Effect.Success<
	typeof fetchAllStudyMaterials
>[number];

export type ParseError = {
	rowIdx: number;
	id: number | null;
	errors: string[];
};

type ParsedRow<T> =
	| { kind: "blank" }
	| { kind: "valid"; row: T }
	| { kind: "invalid"; error: ParseError };

export type DiffField = "description" | "question" | "imageLink" | "options";
export type MaterialDiffField = "title" | "content" | "imageLink";

export type QuestionDiffEntry = {
	id: number;
	rowIdx: number;
	changedFields: DiffField[];
	before: {
		description: string;
		question: string;
		imageLink: string | null;
		options: ImportOptionData[];
	};
	after: {
		description: string;
		question: string;
		imageLink: string | null;
		options: ImportOptionData[];
	};
};

export type MaterialDiffEntry = {
	id: number;
	rowIdx: number;
	changedFields: MaterialDiffField[];
	before: {
		title: string;
		content: string;
		imageLink: string | null;
	};
	after: {
		title: string;
		content: string;
		imageLink: string | null;
	};
};

export type SectionDiff<T> = {
	update: T[];
	unchanged: number;
	invalid: ParseError[];
	notFound: { rowIdx: number; id: number }[];
};

export type ImportPreview = {
	pretest: SectionDiff<QuestionDiffEntry>;
	quiz: SectionDiff<QuestionDiffEntry>;
	material: SectionDiff<MaterialDiffEntry>;
};

const cellString = (cell: unknown): string => {
	if (cell === null || cell === undefined) return "";
	if (typeof cell === "string") return cell;
	if (typeof cell === "number" || typeof cell === "boolean")
		return String(cell);
	return "";
};

const cellTrimmed = (cell: unknown): string => cellString(cell).trim();

const parseId = (cell: unknown): number | null => {
	const trimmed = cellTrimmed(cell);
	if (!trimmed) return null;
	const n = Number(trimmed);
	if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
	return n;
};

const parseImageLink = (cell: unknown): string | null => {
	const trimmed = cellTrimmed(cell);
	return trimmed.length === 0 ? null : trimmed;
};

const parseRichText = (cell: unknown): string => cellString(cell).trim();

const parseOptions = (
	cell: unknown,
): { ok: true; options: ImportOptionData[] } | { ok: false; error: string } => {
	const raw = cellString(cell).trim();
	if (!raw) return { ok: false, error: "Kolom Pilihan Jawaban kosong" };

	const lines = raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0);
	if (lines.length < 2) {
		return { ok: false, error: "Minimal 2 pilihan jawaban" };
	}

	const parsed: ImportOptionData[] = [];
	for (const line of lines) {
		const stripped = line.replace(/^[•\-*]\s*/, "");
		const checkMatch = stripped.match(/^([✓✗])\s*(.*)$/);
		if (!checkMatch) {
			return {
				ok: false,
				error: `Pilihan harus diawali ✓ atau ✗ ("${line}")`,
			};
		}
		const [, marker, text] = checkMatch;
		const optionText = text.trim();
		if (!optionText) {
			return { ok: false, error: "Teks pilihan kosong" };
		}
		parsed.push({ text: optionText, isCorrect: marker === "✓" });
	}

	const correctCount = parsed.filter((p) => p.isCorrect).length;
	if (correctCount !== 1) {
		return {
			ok: false,
			error: `Tepat 1 pilihan harus ditandai ✓ (ditemukan ${correctCount})`,
		};
	}

	return { ok: true, options: parsed };
};

const isBlankRow = (row: SheetRow, columns: number): boolean => {
	for (let i = 0; i < columns; i++) {
		if (cellTrimmed(row[i])) return false;
	}
	return true;
};

const collectZodErrors = (err: z.ZodError): string[] =>
	err.issues.map((issue) => {
		const path = issue.path.join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	});

function parseQuestionRow(
	row: SheetRow,
	rowIdx: number,
	cols: typeof PRETEST_COLS | typeof QUIZ_COLS,
	schema: typeof pretestRowSchema | typeof quizRowSchema,
	totalCols: number,
): ParsedRow<z.infer<typeof pretestRowSchema>> {
	if (isBlankRow(row, totalCols)) return { kind: "blank" };

	const id = parseId(row[cols.id]);
	if (id === null) {
		return {
			kind: "invalid",
			error: {
				rowIdx,
				id: null,
				errors: ["ID kosong atau tidak valid (baris dilewati)"],
			},
		};
	}

	const optionsResult = parseOptions(row[cols.options]);
	if (!optionsResult.ok) {
		return {
			kind: "invalid",
			error: { rowIdx, id, errors: [optionsResult.error] },
		};
	}

	const candidate = {
		id,
		description: parseRichText(row[cols.description]),
		question: parseRichText(row[cols.question]),
		imageLink: parseImageLink(row[cols.imageLink]),
		options: optionsResult.options,
	};

	const result = schema.safeParse(candidate);
	if (!result.success) {
		return {
			kind: "invalid",
			error: { rowIdx, id, errors: collectZodErrors(result.error) },
		};
	}

	return { kind: "valid", row: result.data };
}

function parseMaterialRow(
	row: SheetRow,
	rowIdx: number,
): ParsedRow<z.infer<typeof materialRowSchema>> {
	const totalCols = Object.keys(MATERIAL_COLS).length;
	if (isBlankRow(row, totalCols)) return { kind: "blank" };

	const id = parseId(row[MATERIAL_COLS.id]);
	if (id === null) {
		return {
			kind: "invalid",
			error: {
				rowIdx,
				id: null,
				errors: ["ID kosong atau tidak valid (baris dilewati)"],
			},
		};
	}

	const candidate = {
		id,
		title: parseRichText(row[MATERIAL_COLS.title]),
		content: parseRichText(row[MATERIAL_COLS.content]),
		imageLink: parseImageLink(row[MATERIAL_COLS.imageLink]),
	};

	const result = materialRowSchema.safeParse(candidate);
	if (!result.success) {
		return {
			kind: "invalid",
			error: { rowIdx, id, errors: collectZodErrors(result.error) },
		};
	}

	return { kind: "valid", row: result.data };
}

const readTab = (tabName: string) =>
	Effect.gen(function* () {
		const { sheets, spreadsheetId } = getSheetsClient();
		const response = yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.values.get({
					spreadsheetId,
					range: tabName,
					valueRenderOption: "FORMATTED_VALUE",
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: `Failed to read tab ${tabName}`,
				}),
		});
		const values = (response.data.values ?? []) as SheetRow[];
		return values.length === 0 ? [] : values.slice(1);
	});

const optionsEqual = (
	a: ImportOptionData[],
	b: ImportOptionData[],
): boolean => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i].text !== b[i].text || a[i].isCorrect !== b[i].isCorrect)
			return false;
	}
	return true;
};

const normalizeDbOptions = (
	dbOptions: { text: string; isCorrect: boolean }[],
): ImportOptionData[] =>
	dbOptions.map((o) => ({
		text: stripHtml(o.text ?? ""),
		isCorrect: o.isCorrect,
	}));

function diffQuestionRow(
	rowIdx: number,
	parsed: z.infer<typeof pretestRowSchema>,
	dbRow: {
		id: number;
		description: string;
		question: string;
		imageLink: string | null;
		options: { text: string; isCorrect: boolean }[];
	},
): QuestionDiffEntry {
	const before = {
		description: stripHtml(dbRow.description ?? ""),
		question: stripHtml(dbRow.question ?? ""),
		imageLink: dbRow.imageLink ?? null,
		options: normalizeDbOptions(dbRow.options),
	};
	const after = {
		description: parsed.description,
		question: parsed.question,
		imageLink: parsed.imageLink,
		options: parsed.options,
	};

	const changed: DiffField[] = [];
	if (before.description !== after.description) changed.push("description");
	if (before.question !== after.question) changed.push("question");
	if ((before.imageLink ?? "") !== (after.imageLink ?? ""))
		changed.push("imageLink");
	if (!optionsEqual(before.options, after.options)) changed.push("options");

	return { id: parsed.id, rowIdx, changedFields: changed, before, after };
}

function diffMaterialRow(
	rowIdx: number,
	parsed: z.infer<typeof materialRowSchema>,
	dbRow: {
		id: number;
		title: string;
		content: string;
		imageLink: string | null;
	},
): MaterialDiffEntry {
	const before = {
		title: stripHtml(dbRow.title ?? ""),
		content: stripHtml(dbRow.content ?? ""),
		imageLink: dbRow.imageLink ?? null,
	};
	const after = {
		title: parsed.title,
		content: parsed.content,
		imageLink: parsed.imageLink,
	};

	const changed: MaterialDiffField[] = [];
	if (before.title !== after.title) changed.push("title");
	if (before.content !== after.content) changed.push("content");
	if ((before.imageLink ?? "") !== (after.imageLink ?? ""))
		changed.push("imageLink");

	return { id: parsed.id, rowIdx, changedFields: changed, before, after };
}

const buildPretestDiff = (
	rows: SheetRow[],
	db: QuestionDbRow[],
): SectionDiff<QuestionDiffEntry> => {
	const update: QuestionDiffEntry[] = [];
	const invalid: ParseError[] = [];
	const notFound: { rowIdx: number; id: number }[] = [];
	let unchanged = 0;

	const dbById = new Map(db.map((q) => [q.id, q]));
	const totalCols = Object.keys(PRETEST_COLS).length;

	rows.forEach((row, idx) => {
		const rowIdx = idx + 2;
		const parsed = parseQuestionRow(
			row,
			rowIdx,
			PRETEST_COLS,
			pretestRowSchema,
			totalCols,
		);
		if (parsed.kind === "blank") return;
		if (parsed.kind === "invalid") {
			invalid.push(parsed.error);
			return;
		}

		const dbRow = dbById.get(parsed.row.id);
		if (!dbRow) {
			notFound.push({ rowIdx, id: parsed.row.id });
			return;
		}

		const entry = diffQuestionRow(rowIdx, parsed.row, dbRow);
		if (entry.changedFields.length === 0) unchanged++;
		else update.push(entry);
	});

	return { update, unchanged, invalid, notFound };
};

const buildQuizDiff = (
	rows: SheetRow[],
	db: QuestionDbRow[],
): SectionDiff<QuestionDiffEntry> => {
	const update: QuestionDiffEntry[] = [];
	const invalid: ParseError[] = [];
	const notFound: { rowIdx: number; id: number }[] = [];
	let unchanged = 0;

	const dbById = new Map(db.map((q) => [q.id, q]));
	const totalCols = Object.keys(QUIZ_COLS).length;

	rows.forEach((row, idx) => {
		const rowIdx = idx + 2;
		const parsed = parseQuestionRow(
			row,
			rowIdx,
			QUIZ_COLS,
			quizRowSchema,
			totalCols,
		);
		if (parsed.kind === "blank") return;
		if (parsed.kind === "invalid") {
			invalid.push(parsed.error);
			return;
		}

		const dbRow = dbById.get(parsed.row.id);
		if (!dbRow) {
			notFound.push({ rowIdx, id: parsed.row.id });
			return;
		}

		const entry = diffQuestionRow(rowIdx, parsed.row, dbRow);
		if (entry.changedFields.length === 0) unchanged++;
		else update.push(entry);
	});

	return { update, unchanged, invalid, notFound };
};

const buildMaterialDiff = (
	rows: SheetRow[],
	db: MaterialDbRow[],
): SectionDiff<MaterialDiffEntry> => {
	const update: MaterialDiffEntry[] = [];
	const invalid: ParseError[] = [];
	const notFound: { rowIdx: number; id: number }[] = [];
	let unchanged = 0;

	const dbById = new Map(db.map((m) => [m.id, m]));

	rows.forEach((row, idx) => {
		const rowIdx = idx + 2;
		const parsed = parseMaterialRow(row, rowIdx);
		if (parsed.kind === "blank") return;
		if (parsed.kind === "invalid") {
			invalid.push(parsed.error);
			return;
		}

		const dbRow = dbById.get(parsed.row.id);
		if (!dbRow) {
			notFound.push({ rowIdx, id: parsed.row.id });
			return;
		}

		const entry = diffMaterialRow(rowIdx, parsed.row, dbRow);
		if (entry.changedFields.length === 0) unchanged++;
		else update.push(entry);
	});

	return { update, unchanged, invalid, notFound };
};

const escapeHtml = (text: string): string =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const textToHtml = (text: string): string => {
	const trimmed = text.trim();
	if (!trimmed) return "";
	const blocks = trimmed.split(/\n{2,}/);
	return blocks
		.map((block) => {
			const escaped = escapeHtml(block);
			const withBreaks = escaped.replace(/\n/g, "<br />");
			return `<p>${withBreaks}</p>`;
		})
		.join("");
};

export type ImportApplyResult = {
	preview: ImportPreview;
	applied: { pretest: number; quiz: number; material: number };
	failed: {
		entity: "pretest" | "quiz" | "material";
		id: number;
		error: string;
	}[];
};

export const previewImport = Effect.gen(function* () {
	const [pretestRows, quizRows, materialRows, dbPretest, dbQuiz, dbMaterials] =
		yield* Effect.all(
			[
				readTab(PRETEST_TAB),
				readTab(QUIZ_TAB),
				readTab(MATERIAL_TAB),
				fetchQuestionsByType("pretest"),
				fetchQuestionsByType("quiz"),
				fetchAllStudyMaterials,
			],
			{ concurrency: "unbounded" },
		);

	const preview: ImportPreview = {
		pretest: buildPretestDiff(pretestRows, dbPretest),
		quiz: buildQuizDiff(quizRows, dbQuiz),
		material: buildMaterialDiff(materialRows, dbMaterials),
	};

	return preview;
});

export const commitImport = Effect.gen(function* () {
	const preview = yield* previewImport;

	const failed: ImportApplyResult["failed"] = [];
	const applied = { pretest: 0, quiz: 0, material: 0 };

	const applyQuestionEntry = (
		entity: "pretest" | "quiz",
		entry: QuestionDiffEntry,
	) =>
		updateQuestionFromImport(entry.id, {
			description: textToHtml(entry.after.description),
			question: textToHtml(entry.after.question),
			imageLink: entry.after.imageLink,
			options: entry.after.options,
		}).pipe(
			Effect.tap(() =>
				Effect.sync(() => {
					applied[entity] += 1;
				}),
			),
			Effect.catchAll((err) =>
				Effect.sync(() => {
					failed.push({
						entity,
						id: entry.id,
						error: err instanceof Error ? err.message : String(err),
					});
				}),
			),
		);

	const applyMaterialEntry = (entry: MaterialDiffEntry) =>
		updateStudyMaterialFromImport(entry.id, {
			title: entry.after.title,
			content: textToHtml(entry.after.content),
			imageLink: entry.after.imageLink,
		}).pipe(
			Effect.tap(() =>
				Effect.sync(() => {
					applied.material += 1;
				}),
			),
			Effect.catchAll((err) =>
				Effect.sync(() => {
					failed.push({
						entity: "material",
						id: entry.id,
						error: err instanceof Error ? err.message : String(err),
					});
				}),
			),
		);

	yield* Effect.all(
		preview.pretest.update.map((e) => applyQuestionEntry("pretest", e)),
		{ concurrency: 4 },
	);
	yield* Effect.all(
		preview.quiz.update.map((e) => applyQuestionEntry("quiz", e)),
		{ concurrency: 4 },
	);
	yield* Effect.all(preview.material.update.map(applyMaterialEntry), {
		concurrency: 4,
	});

	const result: ImportApplyResult = { preview, applied, failed };
	return result;
});
