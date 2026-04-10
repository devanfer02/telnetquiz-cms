import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { db } from "../src/lib/db";
import { questions, options, studyMaterials } from "../src/database/schema";
import { asc } from "drizzle-orm";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TTS_PROJECT_DIR = resolve(import.meta.dir, "../tts-api");

function hashId(id: number): string {
	return createHash("sha256").update(String(id)).digest("hex").slice(0, 12);
}

function buildCacheKey(type: string, id: number): string {
	return `${type}-${hashId(id)}-audio`;
}

interface TtsItem {
	text: string;
	cache_key: string;
}

interface TtsResult {
	cache_key: string;
	status: "generated" | "cached" | "failed";
	audio_url?: string;
	error?: string;
}

async function runPythonBatch(items: TtsItem[]): Promise<TtsResult[]> {
	const input = JSON.stringify(items);

	const proc = Bun.spawn(["make", "batch:convert"], {
		cwd: TTS_PROJECT_DIR,
		stdin: new Blob([input]),
		stdout: "pipe",
		stderr: "inherit",
	});

	const stdout = await new Response(proc.stdout).text();
	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new Error(`Python batch script exited with code ${exitCode}`);
	}

	return JSON.parse(stdout) as TtsResult[];
}

async function batchGenerate() {
	const args = process.argv.slice(2);
	const types = args.length > 0 ? args : ["question", "pretest", "material"];

	console.log(`Batch TTS generation for: ${types.join(", ")}`);
	console.log(`Using Python TTS at: ${TTS_PROJECT_DIR}\n`);

	const items: TtsItem[] = [];

	if (types.includes("question") || types.includes("pretest")) {
		const allQuestions = await db
			.select({
				id: questions.id,
				type: questions.type,
				description: questions.description,
				question: questions.question,
			})
			.from(questions)
			.orderBy(asc(questions.id));

		const allOptions = await db
			.select({
				questionId: options.questionId,
				text: options.text,
			})
			.from(options);

		const optionsByQuestion = new Map<number, string[]>();
		for (const opt of allOptions) {
			const list = optionsByQuestion.get(opt.questionId) ?? [];
			list.push(opt.text);
			optionsByQuestion.set(opt.questionId, list);
		}

		const filtered = allQuestions.filter((q) =>
			types.includes(q.type ?? "question"),
		);

		console.log(`[questions] ${filtered.length} to process`);

		for (const q of filtered) {
			const opts = optionsByQuestion.get(q.id) ?? [];
			const optionsText = opts
				.map((text, i) => `${LETTERS[i] ?? String(i + 1)}. ${text}`)
				.join(". ");
			const ttsText = `${q.description}. ${q.question}. Pilihan jawaban: ${optionsText}`;
			const type = q.type ?? "question";

			items.push({
				text: ttsText,
				cache_key: buildCacheKey(type, q.id),
			});
		}
	}

	if (types.includes("material")) {
		const allMaterials = await db
			.select({
				id: studyMaterials.id,
				title: studyMaterials.title,
				content: studyMaterials.content,
			})
			.from(studyMaterials);

		console.log(`[materials] ${allMaterials.length} to process`);

		for (const m of allMaterials) {
			const plainContent = m.content.replace(/<[^>]*>/g, "");
			items.push({
				text: `${m.title}. ${plainContent}`,
				cache_key: buildCacheKey("material", m.id),
			});
		}
	}

	if (items.length === 0) {
		console.log("No items to process.");
		process.exit(0);
	}

	console.log(`\nSending ${items.length} items to Python TTS batch...\n`);

	const results = await runPythonBatch(items);

	const generated = results.filter((r) => r.status === "generated").length;
	const cached = results.filter((r) => r.status === "cached").length;
	const failed = results.filter((r) => r.status === "failed").length;

	if (failed > 0) {
		console.log("\nFailed items:");
		for (const r of results.filter((r) => r.status === "failed")) {
			console.log(`  ${r.cache_key}: ${r.error}`);
		}
	}

	console.log(
		`\nDone: ${generated} generated, ${cached} cached, ${failed} failed`,
	);
	process.exit(failed > 0 ? 1 : 0);
}

batchGenerate();
