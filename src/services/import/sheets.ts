import { Effect } from "effect";
import type { z } from "zod";
import { getSheetsClient, quoteTabRange } from "@/lib/google-sheets";
import { stripHtml, textToHtml } from "@/lib/html";
import {
	type ImportOptionData,
	materialRowSchema,
	pretestRowSchema,
	quizRowSchema,
} from "@/types/zod";
import { fetchQuestionsByType } from "../content/questions";
import { fetchAllStudyMaterials } from "../content/study-material";
import { GoogleSheetsError } from "../errors/errors";
import { updateQuestionFromImport } from "./questions";
import { updateStudyMaterialFromImport } from "./study-materials";

const PRETEST_TAB = "Pretest";
const QUIZ_TAB = "Pertanyaan Quiz";
const MATERIAL_TAB = "Materi Belajar";

type QuestionColKey =
	| "id"
	| "description"
	| "question"
	| "imageLink"
	| "options";

type MaterialColKey = "id" | "title" | "content" | "imageLink";

const QUESTION_COL_HEADERS: Record<QuestionColKey, string> = {
	id: "ID",
	description: "Deskripsi",
	question: "Pertanyaan",
	imageLink: "Link Gambar",
	options: "Pilihan Jawaban",
};

const MATERIAL_COL_HEADERS: Record<MaterialColKey, string> = {
	id: "ID",
	title: "Judul",
	content: "Konten",
	imageLink: "Link Gambar",
};

type QuestionColIndex = Record<QuestionColKey, number>;
type MaterialColIndex = Record<MaterialColKey, number>;

type SheetRow = (string | number | null | undefined)[];

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
	tabMissing?: boolean;
	headersMissing?: string[];
};

export type ImportPreview = {
	pretest: SectionDiff<QuestionDiffEntry>;
	quiz: SectionDiff<QuestionDiffEntry>;
	material: SectionDiff<MaterialDiffEntry>;
};

const emptySection = <T>(tabMissing = false): SectionDiff<T> => ({
	update: [],
	unchanged: 0,
	invalid: [],
	notFound: [],
	tabMissing,
});

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

const isBlankRow = (row: SheetRow): boolean => {
	for (const cell of row) {
		if (cellTrimmed(cell)) return false;
	}
	return true;
};

const collectZodErrors = (err: z.ZodError): string[] =>
	err.issues.map((issue) => {
		const path = issue.path.join(".");
		return path ? `${path}: ${issue.message}` : issue.message;
	});

function resolveColumnIndices<K extends string>(
	headerRow: SheetRow,
	expected: Record<K, string>,
): { ok: true; indices: Record<K, number> } | { ok: false; missing: string[] } {
	const headerByName = new Map<string, number>();
	headerRow.forEach((cell, idx) => {
		const label = cellTrimmed(cell);
		if (label) headerByName.set(label, idx);
	});

	const indices: Partial<Record<K, number>> = {};
	const missing: string[] = [];
	for (const key of Object.keys(expected) as K[]) {
		const label = expected[key];
		const idx = headerByName.get(label);
		if (idx === undefined) missing.push(label);
		else indices[key] = idx;
	}

	if (missing.length > 0) return { ok: false, missing };
	return { ok: true, indices: indices as Record<K, number> };
}

function parseQuestionRow(
	row: SheetRow,
	rowIdx: number,
	cols: QuestionColIndex,
	schema: typeof pretestRowSchema | typeof quizRowSchema,
): ParsedRow<z.infer<typeof pretestRowSchema>> {
	if (isBlankRow(row)) return { kind: "blank" };

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
	cols: MaterialColIndex,
): ParsedRow<z.infer<typeof materialRowSchema>> {
	if (isBlankRow(row)) return { kind: "blank" };

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

	const candidate = {
		id,
		title: parseRichText(row[cols.title]),
		content: parseRichText(row[cols.content]),
		imageLink: parseImageLink(row[cols.imageLink]),
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

const listExistingTabs = Effect.gen(function* () {
	const { sheets, spreadsheetId } = getSheetsClient();
	const meta = yield* Effect.tryPromise({
		try: () =>
			sheets.spreadsheets.get({
				spreadsheetId,
				fields: "sheets.properties.title",
			}),
		catch: (err) =>
			new GoogleSheetsError({
				cause: err,
				message: "Failed to fetch spreadsheet metadata",
			}),
	});
	const titles = new Set<string>();
	for (const s of meta.data.sheets ?? []) {
		const t = s.properties?.title;
		if (typeof t === "string") titles.add(t);
	}
	return titles;
});

type TabRead =
	| { kind: "missing" }
	| { kind: "ok"; header: SheetRow; rows: SheetRow[] };

const readTab = (tabName: string, existingTabs: Set<string>) =>
	Effect.gen(function* () {
		if (!existingTabs.has(tabName)) return { kind: "missing" } as TabRead;
		const { sheets, spreadsheetId } = getSheetsClient();
		const response = yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.values.get({
					spreadsheetId,
					range: quoteTabRange(tabName),
					valueRenderOption: "FORMULA",
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: `Failed to read tab ${tabName}`,
				}),
		});
		const values = (response.data.values ?? []) as SheetRow[];
		if (values.length === 0) {
			return { kind: "ok", header: [], rows: [] } as TabRead;
		}
		return {
			kind: "ok",
			header: values[0],
			rows: values.slice(1),
		} as TabRead;
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

function buildSectionDiff<
	K extends string,
	TParsed extends { id: number },
	TDb extends { id: number },
	TEntry extends { changedFields: readonly string[] },
>(args: {
	header: SheetRow;
	rows: SheetRow[];
	db: TDb[];
	headerMap: Record<K, string>;
	parseRow: (
		row: SheetRow,
		rowIdx: number,
		cols: Record<K, number>,
	) => ParsedRow<TParsed>;
	diffRow: (rowIdx: number, parsed: TParsed, dbRow: TDb) => TEntry;
}): SectionDiff<TEntry> {
	const resolved = resolveColumnIndices(args.header, args.headerMap);
	if (!resolved.ok) {
		return {
			update: [],
			unchanged: 0,
			invalid: [],
			notFound: [],
			headersMissing: resolved.missing,
		};
	}
	const cols = resolved.indices;

	const update: TEntry[] = [];
	const invalid: ParseError[] = [];
	const notFound: { rowIdx: number; id: number }[] = [];
	let unchanged = 0;

	const dbById = new Map(args.db.map((row) => [row.id, row]));

	args.rows.forEach((row, idx) => {
		const rowIdx = idx + 2;
		const parsed = args.parseRow(row, rowIdx, cols);
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

		const entry = args.diffRow(rowIdx, parsed.row, dbRow);
		if (entry.changedFields.length === 0) unchanged++;
		else update.push(entry);
	});

	return { update, unchanged, invalid, notFound };
}

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
	const existingTabs = yield* listExistingTabs;

	const [pretestRead, quizRead, materialRead, dbPretest, dbQuiz, dbMaterials] =
		yield* Effect.all(
			[
				readTab(PRETEST_TAB, existingTabs),
				readTab(QUIZ_TAB, existingTabs),
				readTab(MATERIAL_TAB, existingTabs),
				fetchQuestionsByType("pretest"),
				fetchQuestionsByType("quiz"),
				fetchAllStudyMaterials,
			],
			{ concurrency: "unbounded" },
		);

	const preview: ImportPreview = {
		pretest:
			pretestRead.kind === "missing"
				? emptySection<QuestionDiffEntry>(true)
				: buildSectionDiff({
						header: pretestRead.header,
						rows: pretestRead.rows,
						db: dbPretest,
						headerMap: QUESTION_COL_HEADERS,
						parseRow: (row, rowIdx, cols) =>
							parseQuestionRow(row, rowIdx, cols, pretestRowSchema),
						diffRow: diffQuestionRow,
					}),
		quiz:
			quizRead.kind === "missing"
				? emptySection<QuestionDiffEntry>(true)
				: buildSectionDiff({
						header: quizRead.header,
						rows: quizRead.rows,
						db: dbQuiz,
						headerMap: QUESTION_COL_HEADERS,
						parseRow: (row, rowIdx, cols) =>
							parseQuestionRow(row, rowIdx, cols, quizRowSchema),
						diffRow: diffQuestionRow,
					}),
		material:
			materialRead.kind === "missing"
				? emptySection<MaterialDiffEntry>(true)
				: buildSectionDiff({
						header: materialRead.header,
						rows: materialRead.rows,
						db: dbMaterials,
						headerMap: MATERIAL_COL_HEADERS,
						parseRow: parseMaterialRow,
						diffRow: diffMaterialRow,
					}),
	};

	return preview;
});

export const commitImport = Effect.gen(function* () {
	const preview = yield* previewImport;

	const failed: ImportApplyResult["failed"] = [];
	const applied = { pretest: 0, quiz: 0, material: 0 };

	type Entity = "pretest" | "quiz" | "material";

	const trackResult = <A>(
		entity: Entity,
		id: number,
		eff: Effect.Effect<A, unknown>,
	) =>
		eff.pipe(
			Effect.tap(() =>
				Effect.sync(() => {
					applied[entity] += 1;
				}),
			),
			Effect.catchAll((err) =>
				Effect.sync(() => {
					failed.push({
						entity,
						id,
						error: err instanceof Error ? err.message : String(err),
					});
				}),
			),
		);

	const applyQuestionEntry =
		(entity: "pretest" | "quiz") => (entry: QuestionDiffEntry) =>
			trackResult(
				entity,
				entry.id,
				updateQuestionFromImport(entry.id, {
					type: entity,
					description: entry.after.description,
					question: entry.after.question,
					imageLink: entry.after.imageLink,
					options: entry.after.options,
				}),
			);

	const applyMaterialEntry = (entry: MaterialDiffEntry) =>
		trackResult(
			"material",
			entry.id,
			updateStudyMaterialFromImport(entry.id, {
				title: entry.after.title,
				content: textToHtml(entry.after.content),
				imageLink: entry.after.imageLink,
			}),
		);

	yield* Effect.all(
		[
			...preview.pretest.update.map(applyQuestionEntry("pretest")),
			...preview.quiz.update.map(applyQuestionEntry("quiz")),
			...preview.material.update.map(applyMaterialEntry),
		],
		{ concurrency: 8 },
	);

	const result: ImportApplyResult = { preview, applied, failed };
	return result;
});
