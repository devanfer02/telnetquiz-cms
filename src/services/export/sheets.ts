import type { sheets_v4 } from "@googleapis/sheets";
import { Effect } from "effect";
import { getSheetsClient } from "@/lib/google-sheets";
import { fetchQuestionsByType } from "../content/questions";
import { fetchAllStudyMaterials } from "../content/study-material";
import { GoogleSheetsError } from "../errors/errors";

const PRETEST_TAB = "Pretest";
const QUIZ_TAB = "Pertanyaan Quiz";
const MATERIAL_TAB = "Materi Belajar";

const LEGACY_TAB_RENAMES: Record<string, string> = {
	"Quiz Questions": QUIZ_TAB,
	"Study Materials": MATERIAL_TAB,
};

const PREVIEW_IMAGE_HEIGHT = 120;
const PREVIEW_IMAGE_WIDTH = 180;
const TABULAR_ROW_HEIGHT = 140;

type CellValue = string | number | boolean | null;
type SheetGrid = CellValue[][];

type ColumnSpec = {
	label: string;
	width?: number;
	wrap?: boolean;
	hAlign?: "CENTER" | "LEFT" | "RIGHT";
};

const PRETEST_COLUMNS: ColumnSpec[] = [
	{ label: "ID", width: 60, hAlign: "CENTER" },
	{ label: "Bab", width: 200 },
	{ label: "Deskripsi", width: 360, wrap: true },
	{ label: "Pertanyaan", width: 360, wrap: true },
	{ label: "Link Gambar", width: 220, wrap: true },
	{ label: "Preview Gambar", width: 200, hAlign: "CENTER" },
	{ label: "Pilihan Jawaban", width: 360, wrap: true },
];

const QUIZ_COLUMNS: ColumnSpec[] = [
	{ label: "ID", width: 60, hAlign: "CENTER" },
	{ label: "Bab", width: 200 },
	{ label: "Level", width: 70, hAlign: "CENTER" },
	{ label: "Judul Quiz", width: 220 },
	{ label: "Tingkat Kesulitan", width: 130 },
	{ label: "Deskripsi", width: 360, wrap: true },
	{ label: "Pertanyaan", width: 360, wrap: true },
	{ label: "Link Gambar", width: 220, wrap: true },
	{ label: "Preview Gambar", width: 200, hAlign: "CENTER" },
	{ label: "Pilihan Jawaban", width: 360, wrap: true },
];

const MATERIAL_COLUMNS: ColumnSpec[] = [
	{ label: "ID", width: 60, hAlign: "CENTER" },
	{ label: "Judul", width: 240 },
	{ label: "Konten", width: 600, wrap: true },
	{ label: "Link Gambar", width: 220, wrap: true },
	{ label: "Preview Gambar", width: 200, hAlign: "CENTER" },
];

const HEADER_BG = { red: 0.137, green: 0.518, blue: 0.404 };
const HEADER_FG = { red: 1, green: 1, blue: 1 };
const BORDER_OUTER = { red: 0.6, green: 0.6, blue: 0.6 };
const BORDER_INNER = { red: 0.85, green: 0.85, blue: 0.85 };

const QUIZ_DIFFICULTY_COL_INDEX = 4;

const DIFFICULTY_OPTIONS = [
	{ value: "Easy", bg: { red: 0.82, green: 0.94, blue: 0.84 } },
	{ value: "Medium", bg: { red: 0.99, green: 0.91, blue: 0.71 } },
	{ value: "Hard", bg: { red: 0.99, green: 0.83, blue: 0.83 } },
];

export function stripHtml(input: string): string {
	return input
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
		.replace(/<li[^>]*>/gi, "• ")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&lt;/gi, "<")
		.replace(/&gt;/gi, ">")
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/[ \t]+/g, " ")
		.replace(/\n[ \t]+/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function formatOptions(
	options: { text: string; isCorrect: boolean }[],
): string {
	return options
		.map((opt) => `• ${opt.isCorrect ? "✓" : "✗"} ${stripHtml(opt.text ?? "")}`)
		.join("\n");
}

function capitalize(value: string): string {
	if (!value) return "";
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function imageFormula(url: string | null | undefined): string {
	if (!url) return "";
	const safe = url.replace(/"/g, '""');
	return `=IMAGE("${safe}", 4, ${PREVIEW_IMAGE_HEIGHT}, ${PREVIEW_IMAGE_WIDTH})`;
}

type QuestionRow = Effect.Effect.Success<
	ReturnType<typeof fetchQuestionsByType>
>[number];

type StudyMaterialRow = Effect.Effect.Success<
	typeof fetchAllStudyMaterials
>[number];

function buildPretestGrid(rows: QuestionRow[]): SheetGrid {
	const header: CellValue[] = PRETEST_COLUMNS.map((c) => c.label);
	const body: SheetGrid = rows.map((q) => [
		q.id,
		q.chapterTitle ?? "",
		stripHtml(q.description ?? ""),
		stripHtml(q.question ?? ""),
		q.imageLink ?? "",
		imageFormula(q.imageLink),
		formatOptions(q.options),
	]);
	return [header, ...body];
}

function buildQuizGrid(rows: QuestionRow[]): SheetGrid {
	const header: CellValue[] = QUIZ_COLUMNS.map((c) => c.label);
	const body: SheetGrid = rows.map((q) => [
		q.id,
		q.chapterTitle ?? "",
		q.quiz?.level ?? "",
		q.quiz?.title ?? "",
		capitalize(q.quiz?.difficulty ?? ""),
		stripHtml(q.description ?? ""),
		stripHtml(q.question ?? ""),
		q.imageLink ?? "",
		imageFormula(q.imageLink),
		formatOptions(q.options),
	]);
	return [header, ...body];
}

function buildStudyMaterialGrid(rows: StudyMaterialRow[]): SheetGrid {
	const header: CellValue[] = MATERIAL_COLUMNS.map((c) => c.label);
	const body: SheetGrid = rows.map((m) => [
		m.id,
		stripHtml(m.title ?? ""),
		stripHtml(m.content ?? ""),
		m.imageLink ?? "",
		imageFormula(m.imageLink),
	]);
	return [header, ...body];
}

const renameLegacyTabs = (renameMap: Record<string, string>) =>
	Effect.gen(function* () {
		const { sheets, spreadsheetId } = getSheetsClient();

		const meta = yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.get({
					spreadsheetId,
					fields: "sheets.properties(sheetId,title)",
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: "Failed to fetch spreadsheet metadata for legacy rename",
				}),
		});

		const titleToId = new Map<string, number>();
		for (const s of meta.data.sheets ?? []) {
			const t = s.properties?.title;
			const id = s.properties?.sheetId;
			if (typeof t === "string" && typeof id === "number") {
				titleToId.set(t, id);
			}
		}

		const requests: sheets_v4.Schema$Request[] = [];
		for (const [oldName, newName] of Object.entries(renameMap)) {
			const oldId = titleToId.get(oldName);
			if (oldId !== undefined && !titleToId.has(newName)) {
				requests.push({
					updateSheetProperties: {
						properties: { sheetId: oldId, title: newName },
						fields: "title",
					},
				});
			}
		}

		if (requests.length === 0) return;

		yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.batchUpdate({
					spreadsheetId,
					requestBody: { requests },
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: "Failed to rename legacy tabs",
				}),
		});
	});

const ensureTabsAndGetIds = (tabNames: string[]) =>
	Effect.gen(function* () {
		const { sheets, spreadsheetId } = getSheetsClient();

		const meta = yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.get({
					spreadsheetId,
					fields: "sheets.properties(sheetId,title)",
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: "Failed to fetch spreadsheet metadata",
				}),
		});

		const idMap = new Map<string, number>();
		for (const s of meta.data.sheets ?? []) {
			const t = s.properties?.title;
			const id = s.properties?.sheetId;
			if (typeof t === "string" && typeof id === "number") {
				idMap.set(t, id);
			}
		}

		const missing = tabNames.filter((t) => !idMap.has(t));
		if (missing.length === 0) return idMap;

		const response = yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.batchUpdate({
					spreadsheetId,
					requestBody: {
						requests: missing.map((title) => ({
							addSheet: { properties: { title } },
						})),
					},
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: `Failed to create missing tabs: ${missing.join(", ")}`,
				}),
		});

		for (const reply of response.data.replies ?? []) {
			const props = reply.addSheet?.properties;
			if (props?.title && typeof props.sheetId === "number") {
				idMap.set(props.title, props.sheetId);
			}
		}

		return idMap;
	});

const writeTabValues = (tabName: string, values: SheetGrid) =>
	Effect.gen(function* () {
		const { sheets, spreadsheetId } = getSheetsClient();

		yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.values.clear({
					spreadsheetId,
					range: tabName,
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: `Failed to clear tab ${tabName}`,
				}),
		});

		yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.values.update({
					spreadsheetId,
					range: `${tabName}!A1`,
					valueInputOption: "USER_ENTERED",
					requestBody: { values },
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: `Failed to write tab ${tabName}`,
				}),
		});
	});

function buildFormatRequests(
	sheetId: number,
	columns: ColumnSpec[],
	rowCount: number,
	dataRowHeight?: number,
): sheets_v4.Schema$Request[] {
	const numCols = columns.length;
	const requests: sheets_v4.Schema$Request[] = [];

	requests.push({
		repeatCell: {
			range: {
				sheetId,
				startRowIndex: 0,
				endRowIndex: 1,
				startColumnIndex: 0,
				endColumnIndex: numCols,
			},
			cell: {
				userEnteredFormat: {
					backgroundColor: HEADER_BG,
					textFormat: {
						foregroundColor: HEADER_FG,
						bold: true,
						fontSize: 11,
					},
					horizontalAlignment: "CENTER",
					verticalAlignment: "MIDDLE",
					wrapStrategy: "WRAP",
				},
			},
			fields:
				"userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
		},
	});

	if (rowCount > 1) {
		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 1,
					endRowIndex: rowCount,
					startColumnIndex: 0,
					endColumnIndex: numCols,
				},
				cell: {
					userEnteredFormat: {
						verticalAlignment: "MIDDLE",
					},
				},
				fields: "userEnteredFormat.verticalAlignment",
			},
		});
	}

	columns.forEach((col, i) => {
		if (!col.wrap || rowCount <= 1) return;
		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 1,
					endRowIndex: rowCount,
					startColumnIndex: i,
					endColumnIndex: i + 1,
				},
				cell: {
					userEnteredFormat: {
						wrapStrategy: "WRAP",
					},
				},
				fields: "userEnteredFormat.wrapStrategy",
			},
		});
	});

	columns.forEach((col, i) => {
		if (!col.hAlign || rowCount <= 1) return;
		requests.push({
			repeatCell: {
				range: {
					sheetId,
					startRowIndex: 1,
					endRowIndex: rowCount,
					startColumnIndex: i,
					endColumnIndex: i + 1,
				},
				cell: {
					userEnteredFormat: { horizontalAlignment: col.hAlign },
				},
				fields: "userEnteredFormat.horizontalAlignment",
			},
		});
	});

	requests.push({
		updateBorders: {
			range: {
				sheetId,
				startRowIndex: 0,
				endRowIndex: rowCount,
				startColumnIndex: 0,
				endColumnIndex: numCols,
			},
			top: { style: "SOLID", color: BORDER_OUTER },
			bottom: { style: "SOLID", color: BORDER_OUTER },
			left: { style: "SOLID", color: BORDER_OUTER },
			right: { style: "SOLID", color: BORDER_OUTER },
			innerHorizontal: { style: "SOLID", color: BORDER_INNER },
			innerVertical: { style: "SOLID", color: BORDER_INNER },
		},
	});

	columns.forEach((col, i) => {
		if (col.width !== undefined) {
			requests.push({
				updateDimensionProperties: {
					range: {
						sheetId,
						dimension: "COLUMNS",
						startIndex: i,
						endIndex: i + 1,
					},
					properties: { pixelSize: col.width },
					fields: "pixelSize",
				},
			});
		} else {
			requests.push({
				autoResizeDimensions: {
					dimensions: {
						sheetId,
						dimension: "COLUMNS",
						startIndex: i,
						endIndex: i + 1,
					},
				},
			});
		}
	});

	if (rowCount > 1 && dataRowHeight !== undefined) {
		requests.push({
			updateDimensionProperties: {
				range: {
					sheetId,
					dimension: "ROWS",
					startIndex: 1,
					endIndex: rowCount,
				},
				properties: { pixelSize: dataRowHeight },
				fields: "pixelSize",
			},
		});
	} else if (rowCount > 0) {
		requests.push({
			autoResizeDimensions: {
				dimensions: {
					sheetId,
					dimension: "ROWS",
					startIndex: 0,
					endIndex: rowCount,
				},
			},
		});
	}

	requests.push({
		updateSheetProperties: {
			properties: {
				sheetId,
				gridProperties: { frozenRowCount: 1 },
			},
			fields: "gridProperties.frozenRowCount",
		},
	});

	return requests;
}

const buildDifficultyValidationRequest = (
	sheetId: number,
	rowCount: number,
): sheets_v4.Schema$Request | null => {
	if (rowCount <= 1) return null;
	return {
		setDataValidation: {
			range: {
				sheetId,
				startRowIndex: 1,
				endRowIndex: rowCount,
				startColumnIndex: QUIZ_DIFFICULTY_COL_INDEX,
				endColumnIndex: QUIZ_DIFFICULTY_COL_INDEX + 1,
			},
			rule: {
				condition: {
					type: "ONE_OF_LIST",
					values: DIFFICULTY_OPTIONS.map((o) => ({
						userEnteredValue: o.value,
					})),
				},
				strict: true,
				showCustomUi: true,
			},
		},
	};
};

const buildDifficultyConditionalFormatRequests = (
	sheetId: number,
	rowCount: number,
): sheets_v4.Schema$Request[] => {
	if (rowCount <= 1) return [];
	return DIFFICULTY_OPTIONS.map((opt) => ({
		addConditionalFormatRule: {
			rule: {
				ranges: [
					{
						sheetId,
						startRowIndex: 1,
						endRowIndex: rowCount,
						startColumnIndex: QUIZ_DIFFICULTY_COL_INDEX,
						endColumnIndex: QUIZ_DIFFICULTY_COL_INDEX + 1,
					},
				],
				booleanRule: {
					condition: {
						type: "TEXT_EQ",
						values: [{ userEnteredValue: opt.value }],
					},
					format: { backgroundColor: opt.bg },
				},
			},
			index: 0,
		},
	}));
};

const fetchConditionalFormatCounts = Effect.gen(function* () {
	const { sheets, spreadsheetId } = getSheetsClient();
	const meta = yield* Effect.tryPromise({
		try: () =>
			sheets.spreadsheets.get({
				spreadsheetId,
				fields: "sheets(properties.sheetId,conditionalFormats)",
			}),
		catch: (err) =>
			new GoogleSheetsError({
				cause: err,
				message: "Failed to fetch conditional format metadata",
			}),
	});
	const counts = new Map<number, number>();
	for (const s of meta.data.sheets ?? []) {
		const sid = s.properties?.sheetId;
		const n = s.conditionalFormats?.length ?? 0;
		if (typeof sid === "number") counts.set(sid, n);
	}
	return counts;
});

const applyFormatting = (
	tabIds: Map<string, number>,
	configs: {
		name: string;
		columns: ColumnSpec[];
		rowCount: number;
		dataRowHeight?: number;
		difficultyDropdown?: boolean;
	}[],
) =>
	Effect.gen(function* () {
		const { sheets, spreadsheetId } = getSheetsClient();
		const ruleCountsBySheet = yield* fetchConditionalFormatCounts;

		const requests: sheets_v4.Schema$Request[] = [];
		for (const config of configs) {
			const sheetId = tabIds.get(config.name);
			if (sheetId === undefined) continue;

			if (config.difficultyDropdown) {
				const existing = ruleCountsBySheet.get(sheetId) ?? 0;
				for (let i = 0; i < existing; i++) {
					requests.push({
						deleteConditionalFormatRule: { sheetId, index: 0 },
					});
				}
			}

			requests.push(
				...buildFormatRequests(
					sheetId,
					config.columns,
					config.rowCount,
					config.dataRowHeight,
				),
			);

			if (config.difficultyDropdown) {
				const validation = buildDifficultyValidationRequest(
					sheetId,
					config.rowCount,
				);
				if (validation) requests.push(validation);
				requests.push(
					...buildDifficultyConditionalFormatRequests(sheetId, config.rowCount),
				);
			}
		}

		if (requests.length === 0) return;

		yield* Effect.tryPromise({
			try: () =>
				sheets.spreadsheets.batchUpdate({
					spreadsheetId,
					requestBody: { requests },
				}),
			catch: (err) =>
				new GoogleSheetsError({
					cause: err,
					message: "Failed to apply formatting to spreadsheet",
				}),
		});
	});

export const exportContentToSpreadsheet = Effect.gen(function* () {
	const [pretestRows, quizRows, materialRows] = yield* Effect.all(
		[
			fetchQuestionsByType("pretest"),
			fetchQuestionsByType("quiz"),
			fetchAllStudyMaterials,
		],
		{ concurrency: "unbounded" },
	);

	const pretestGrid = buildPretestGrid(pretestRows);
	const quizGrid = buildQuizGrid(quizRows);
	const materialGrid = buildStudyMaterialGrid(materialRows);

	yield* renameLegacyTabs(LEGACY_TAB_RENAMES);

	const tabIds = yield* ensureTabsAndGetIds([
		PRETEST_TAB,
		QUIZ_TAB,
		MATERIAL_TAB,
	]);

	yield* Effect.all(
		[
			writeTabValues(PRETEST_TAB, pretestGrid),
			writeTabValues(QUIZ_TAB, quizGrid),
			writeTabValues(MATERIAL_TAB, materialGrid),
		],
		{ concurrency: 1 },
	);

	yield* applyFormatting(tabIds, [
		{
			name: PRETEST_TAB,
			columns: PRETEST_COLUMNS,
			rowCount: pretestGrid.length,
			dataRowHeight: TABULAR_ROW_HEIGHT,
		},
		{
			name: QUIZ_TAB,
			columns: QUIZ_COLUMNS,
			rowCount: quizGrid.length,
			dataRowHeight: TABULAR_ROW_HEIGHT,
			difficultyDropdown: true,
		},
		{
			name: MATERIAL_TAB,
			columns: MATERIAL_COLUMNS,
			rowCount: materialGrid.length,
		},
	]);

	const { spreadsheetId } = getSheetsClient();

	return {
		url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
		counts: {
			pretest: pretestRows.length,
			quiz: quizRows.length,
			studyMaterials: materialRows.length,
		},
	};
});
