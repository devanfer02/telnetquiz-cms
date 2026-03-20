import { appendFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const BENCHMARK_FILE = join(import.meta.dirname ?? __dirname, ".benchmark.jsonl");

interface BenchmarkEntry {
	endpoint: string;
	durationMs: number;
}

export function recordBenchmark(endpoint: string, durationMs: number): void {
	const entry: BenchmarkEntry = { endpoint, durationMs };
	appendFileSync(BENCHMARK_FILE, `${JSON.stringify(entry)}\n`);
}

export function printSummary(): void {
	let raw: string;
	try {
		raw = readFileSync(BENCHMARK_FILE, "utf-8");
	} catch {
		return;
	}

	const entries: BenchmarkEntry[] = raw
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((line) => JSON.parse(line) as BenchmarkEntry);

	if (entries.length === 0) return;

	// Group by endpoint and compute avg
	const grouped = new Map<string, number[]>();
	for (const { endpoint, durationMs } of entries) {
		const list = grouped.get(endpoint) ?? [];
		list.push(durationMs);
		grouped.set(endpoint, list);
	}

	const rows: { endpoint: string; avg: number; min: number; max: number }[] = [];
	for (const [endpoint, times] of grouped) {
		const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
		const min = Math.min(...times);
		const max = Math.max(...times);
		rows.push({ endpoint, avg, min, max });
	}

	rows.sort((a, b) => a.endpoint.localeCompare(b.endpoint));

	// Print table
	const maxEndpoint = Math.max(
		"Endpoint".length,
		...rows.map((r) => r.endpoint.length),
	);

	const pad = (s: string, n: number) => s.padEnd(n);
	const padNum = (n: number, w: number) => String(n).padStart(w);

	const header = `│ ${pad("Endpoint", maxEndpoint)} │ Avg (ms) │ Min (ms) │ Max (ms) │`;
	const divider = `├─${"─".repeat(maxEndpoint)}─┼──────────┼──────────┼──────────┤`;
	const top = `┌─${"─".repeat(maxEndpoint)}─┬──────────┬──────────┬──────────┐`;
	const bottom = `└─${"─".repeat(maxEndpoint)}─┴──────────┴──────────┴──────────┘`;

	console.log("\n📊 Benchmark Summary");
	console.log(top);
	console.log(header);
	console.log(divider);
	for (const { endpoint, avg, min, max } of rows) {
		console.log(
			`│ ${pad(endpoint, maxEndpoint)} │ ${padNum(avg, 8)} │ ${padNum(min, 8)} │ ${padNum(max, 8)} │`,
		);
	}
	console.log(bottom);

	// Cleanup
	rmSync(BENCHMARK_FILE, { force: true });
}
