import { createHash } from "node:crypto";
import { db } from "../src/lib/db";
import { env } from "../src/lib/env";
import { questions, options, studyMaterials } from "../src/database/schema";
import { asc } from "drizzle-orm";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function hashId(id: number): string {
	return createHash("sha256").update(String(id)).digest("hex").slice(0, 12);
}

function buildCacheKey(type: string, id: number): string {
	return `${type}-${hashId(id)}-audio`;
}

async function synthesize(text: string, cacheKey: string) {
	const res = await fetch(`${env.TTS_SERVICE_URL}/synthesize`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": env.TTS_SERVICE_API_KEY,
		},
		body: JSON.stringify({ text, cache_key: cacheKey }),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`TTS service returned ${res.status}: ${body}`);
	}

	return (await res.json()) as { audio_url: string; cached: boolean };
}

async function batchGenerate() {
	const args = process.argv.slice(2);
	const types = args.length > 0 ? args : ["question", "pretest", "material"];

	console.log(`Batch TTS generation for: ${types.join(", ")}\n`);

	let generated = 0;
	let cached = 0;
	let failed = 0;

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
			const cacheKey = buildCacheKey(type, q.id);

			try {
				const result = await synthesize(ttsText, cacheKey);
				if (result.cached) {
					cached++;
					process.stdout.write(".");
				} else {
					generated++;
					process.stdout.write("✓");
				}
			} catch (err) {
				failed++;
				process.stdout.write("✗");
				console.error(
					`\n  Failed ${type} #${q.id}: ${err instanceof Error ? err.message : err}`,
				);
			}
		}
		console.log();
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
			const ttsText = `${m.title}. ${plainContent}`;
			const cacheKey = buildCacheKey("material", m.id);

			try {
				const result = await synthesize(ttsText, cacheKey);
				if (result.cached) {
					cached++;
					process.stdout.write(".");
				} else {
					generated++;
					process.stdout.write("✓");
				}
			} catch (err) {
				failed++;
				process.stdout.write("✗");
				console.error(
					`\n  Failed material #${m.id}: ${err instanceof Error ? err.message : err}`,
				);
			}
		}
		console.log();
	}

	console.log(
		`\nDone: ${generated} generated, ${cached} cached, ${failed} failed`,
	);
	process.exit(failed > 0 ? 1 : 0);
}

batchGenerate();
