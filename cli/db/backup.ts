import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
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

const TABLES: { name: string; table: PgTable }[] = [
	{ name: "schools", table: schools },
	{ name: "users", table: users },
	{ name: "sessions", table: sessions },
	{ name: "accounts", table: accounts },
	{ name: "refresh_tokens", table: refreshTokens },
	{ name: "verifications", table: verifications },
	{ name: "chapters", table: chapters },
	{ name: "study_materials", table: studyMaterials },
	{ name: "quizzes", table: quizzes },
	{ name: "questions", table: questions },
	{ name: "options", table: options },
	{ name: "submissions", table: submissions },
	{ name: "pretest_submissions", table: pretestSubmissions },
	{ name: "achievements", table: achievements },
	{ name: "user_achievements", table: userAchievements },
];

type Flags = {
	out: string;
	pretty: boolean;
	tables: Set<string> | null;
	help: boolean;
};

function parseFlags(argv: string[]): Flags {
	const flags: Flags = {
		out: "backups",
		pretty: false,
		tables: null,
		help: false,
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--help" || arg === "-h") {
			flags.help = true;
		} else if (arg === "--pretty") {
			flags.pretty = true;
		} else if (arg === "--out") {
			const next = argv[i + 1];
			if (!next) throw new Error("--out requires a directory path");
			flags.out = next;
			i++;
		} else if (arg.startsWith("--out=")) {
			flags.out = arg.slice("--out=".length);
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
		}
	}

	return flags;
}

function printHelp() {
	console.log(`
TelNetQuiz — Database Backup

Usage: bun cli/db/backup.ts [options]

Options:
  --out <dir>           Output directory (default: backups)
  --tables <a,b,c>      Back up only the listed tables (names match schema table names)
  --pretty              Pretty-print JSON output
  -h, --help            Show this help

Output:
  <out>/<timestamp>/<table>.json   one file per table
  <out>/<timestamp>/manifest.json  table names, row counts, timestamp
`);
}

function timestamp(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return (
		`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
		`T${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}Z`
	);
}

async function main() {
	const flags = parseFlags(process.argv.slice(2));

	if (flags.help) {
		printHelp();
		process.exit(0);
	}

	if (flags.tables) {
		const known = new Set(TABLES.map((t) => t.name));
		const unknown = [...flags.tables].filter((t) => !known.has(t));
		if (unknown.length > 0) {
			console.error(`Unknown table(s): ${unknown.join(", ")}`);
			console.error(`Available: ${[...known].join(", ")}`);
			process.exit(1);
		}
	}

	const selected = flags.tables
		? TABLES.filter((t) => flags.tables?.has(t.name))
		: TABLES;

	const ts = timestamp();
	const outDir = resolve(flags.out, ts);
	await mkdir(outDir, { recursive: true });

	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Database Backup");
	console.log("=".repeat(60));
	console.log(`  Output:  ${outDir}`);
	console.log(`  Tables:  ${selected.length}/${TABLES.length}`);
	console.log(`  Pretty:  ${flags.pretty}`);
	console.log();

	const manifest: {
		timestamp: string;
		tables: { name: string; rows: number; file: string }[];
		totalRows: number;
	} = { timestamp: ts, tables: [], totalRows: 0 };

	for (const { name, table } of selected) {
		process.stdout.write(`  ${name.padEnd(28)} ... `);
		const rows = await db.select().from(table);
		const file = `${name}.json`;
		const json = flags.pretty
			? JSON.stringify(rows, null, 2)
			: JSON.stringify(rows);
		await writeFile(join(outDir, file), json, "utf8");
		manifest.tables.push({ name, rows: rows.length, file });
		manifest.totalRows += rows.length;
		console.log(`${rows.length} rows`);
	}

	await writeFile(
		join(outDir, "manifest.json"),
		JSON.stringify(manifest, null, 2),
		"utf8",
	);

	console.log();
	console.log("=".repeat(60));
	console.log("     BACKUP COMPLETE");
	console.log("=".repeat(60));
	console.log(`  ${manifest.totalRows} total rows`);
	console.log(`  ${selected.length} table(s) written to ${outDir}`);
	console.log();

	process.exit(0);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
