import { readFile, readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join, resolve } from "node:path";
import { getTableColumns, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import {
	accounts,
	achievements,
	chapters,
	options,
	pretestSubmissions,
	questions,
	quizzes,
	refreshTokens,
	schools,
	sessions,
	studyMaterials,
	submissions,
	userAchievements,
	users,
	verifications,
} from "../../src/database/schema";
import { db } from "../../src/lib/db";

type TableDef = { name: string; table: PgTable; hasSerial: boolean };

const TABLES: TableDef[] = [
	{ name: "schools", table: schools, hasSerial: true },
	{ name: "users", table: users, hasSerial: false },
	{ name: "sessions", table: sessions, hasSerial: false },
	{ name: "accounts", table: accounts, hasSerial: false },
	{ name: "refresh_tokens", table: refreshTokens, hasSerial: true },
	{ name: "verifications", table: verifications, hasSerial: false },
	{ name: "chapters", table: chapters, hasSerial: true },
	{ name: "study_materials", table: studyMaterials, hasSerial: true },
	{ name: "quizzes", table: quizzes, hasSerial: true },
	{ name: "questions", table: questions, hasSerial: true },
	{ name: "options", table: options, hasSerial: true },
	{ name: "submissions", table: submissions, hasSerial: true },
	{ name: "pretest_submissions", table: pretestSubmissions, hasSerial: true },
	{ name: "achievements", table: achievements, hasSerial: true },
	{ name: "user_achievements", table: userAchievements, hasSerial: true },
];

type Flags = {
	dir: string | null;
	truncate: boolean;
	force: boolean;
	tables: Set<string> | null;
	help: boolean;
};

function parseFlags(argv: string[]): Flags {
	const flags: Flags = {
		dir: null,
		truncate: false,
		force: false,
		tables: null,
		help: false,
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--help" || arg === "-h") {
			flags.help = true;
		} else if (arg === "--truncate") {
			flags.truncate = true;
		} else if (arg === "--force") {
			flags.force = true;
		} else if (arg === "--dir") {
			const next = argv[i + 1];
			if (!next) throw new Error("--dir requires a directory path");
			flags.dir = next;
			i++;
		} else if (arg.startsWith("--dir=")) {
			flags.dir = arg.slice("--dir=".length);
		} else if (arg === "--tables") {
			const next = argv[i + 1];
			if (!next) throw new Error("--tables requires a comma-separated list");
			flags.tables = new Set(next.split(",").map((s) => s.trim()));
			i++;
		} else if (arg.startsWith("--tables=")) {
			flags.tables = new Set(
				arg
					.slice("--tables=".length)
					.split(",")
					.map((s) => s.trim()),
			);
		} else if (!arg.startsWith("-") && !flags.dir) {
			flags.dir = arg;
		}
	}

	return flags;
}

function printHelp() {
	console.log(`
TelNetQuiz — Database Restore

Usage: bun cli/db/restore.ts <dir> [options]
       bun cli/db/restore.ts --dir <dir> [options]

Options:
  --dir <dir>           Backup directory (the timestamped folder produced by db:backup)
  --truncate            Delete existing rows in each target table before inserting
  --tables <a,b,c>      Restore only the listed tables
  --force               Skip confirmation prompt
  -h, --help            Show this help

Behavior:
  - Inserts are ordered by FK dependency (parents first).
  - Without --truncate: uses ON CONFLICT DO NOTHING (existing rows are kept).
  - Sequences for serial PKs are reset to MAX(id) after insert.
`);
}

async function confirm(message: string, force: boolean): Promise<boolean> {
	if (force) return true;
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(`${message} (y/N): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y");
		});
	});
}

function reviveRow(
	row: Record<string, unknown>,
	dateKeys: string[],
): Record<string, unknown> {
	if (dateKeys.length === 0) return row;
	const out = { ...row };
	for (const k of dateKeys) {
		const v = out[k];
		if (typeof v === "string") out[k] = new Date(v);
	}
	return out;
}

function dateColumnKeys(table: PgTable): string[] {
	const cols = getTableColumns(table);
	const keys: string[] = [];
	for (const [key, col] of Object.entries(cols)) {
		if ((col as { dataType: string }).dataType === "date") keys.push(key);
	}
	return keys;
}

async function readTableRows(
	dir: string,
	name: string,
): Promise<Record<string, unknown>[] | null> {
	try {
		const raw = await readFile(join(dir, `${name}.json`), "utf8");
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			throw new Error(`${name}.json is not an array`);
		}
		return parsed as Record<string, unknown>[];
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw err;
	}
}

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
}

async function main() {
	const flags = parseFlags(process.argv.slice(2));

	if (flags.help || !flags.dir) {
		printHelp();
		process.exit(flags.help ? 0 : 1);
	}

	const dir = resolve(flags.dir);

	const entries = await readdir(dir).catch((err) => {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			console.error(`Backup directory not found: ${dir}`);
			process.exit(1);
		}
		throw err;
	});

	if (flags.tables) {
		const known = new Set(TABLES.map((t) => t.name));
		const unknown = [...flags.tables].filter((t) => !known.has(t));
		if (unknown.length > 0) {
			console.error(`Unknown table(s): ${unknown.join(", ")}`);
			process.exit(1);
		}
	}

	const selected = flags.tables
		? TABLES.filter((t) => flags.tables?.has(t.name))
		: TABLES.filter((t) => entries.includes(`${t.name}.json`));

	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Database Restore");
	console.log("=".repeat(60));
	console.log(`  Source:    ${dir}`);
	console.log(`  Tables:    ${selected.length}/${TABLES.length}`);
	console.log(`  Truncate:  ${flags.truncate}`);
	console.log();

	const plan: { def: TableDef; rows: Record<string, unknown>[] }[] = [];
	for (const def of selected) {
		const rows = await readTableRows(dir, def.name);
		if (rows === null) {
			console.log(`  ${def.name.padEnd(28)} ... (no file, skipping)`);
			continue;
		}
		plan.push({ def, rows });
		console.log(`  ${def.name.padEnd(28)} ... ${rows.length} rows pending`);
	}

	if (plan.length === 0) {
		console.log();
		console.log("Nothing to restore.");
		process.exit(0);
	}

	console.log();
	const totalRows = plan.reduce((s, p) => s + p.rows.length, 0);
	const msg = flags.truncate
		? `  This will DELETE existing rows in ${plan.length} table(s) and insert ${totalRows} row(s). Continue?`
		: `  This will insert up to ${totalRows} row(s) (existing rows preserved via ON CONFLICT DO NOTHING). Continue?`;

	const proceed = await confirm(msg, flags.force);
	if (!proceed) {
		console.log("Aborted.");
		process.exit(0);
	}

	console.log();
	console.log("[Restore] Writing rows...");

	await db.transaction(async (tx) => {
		if (flags.truncate) {
			for (const { def } of [...plan].reverse()) {
				await tx.delete(def.table);
				console.log(`  truncated ${def.name}`);
			}
		}

		for (const { def, rows } of plan) {
			if (rows.length === 0) {
				console.log(`  ${def.name}: 0 rows (skipped)`);
				continue;
			}
			const dateKeys = dateColumnKeys(def.table);
			const revived = rows.map((r) => reviveRow(r, dateKeys));

			let inserted = 0;
			for (const batch of chunk(revived, 500)) {
				const q = tx.insert(def.table).values(batch);
				const res = flags.truncate ? await q : await q.onConflictDoNothing();
				inserted += batch.length;
				void res;
			}
			console.log(`  ${def.name}: ${inserted} row(s) inserted`);
		}
	});

	console.log();
	console.log("[Restore] Resetting sequences...");
	for (const { def } of plan) {
		if (!def.hasSerial) continue;
		const rows = await db.execute(
			sql.raw(`SELECT COALESCE(MAX(id), 0) AS max FROM ${def.name}`),
		);
		const maxId = Number((rows.rows[0] as { max: string | number }).max) || 0;
		if (maxId > 0) {
			await db.execute(
				sql.raw(`SELECT setval('${def.name}_id_seq', ${maxId})`),
			);
			console.log(`  ${def.name}_id_seq → ${maxId} (next: ${maxId + 1})`);
		} else {
			await db.execute(
				sql.raw(`ALTER SEQUENCE ${def.name}_id_seq RESTART WITH 1`),
			);
			console.log(`  ${def.name}_id_seq → reset to 1 (empty table)`);
		}
	}

	console.log();
	console.log("=".repeat(60));
	console.log("     RESTORE COMPLETE");
	console.log("=".repeat(60));
	console.log(`  ${plan.length} table(s) processed from ${dir}`);
	console.log();

	process.exit(0);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
