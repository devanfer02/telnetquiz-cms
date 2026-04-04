import {
	DeleteObjectCommand,
	ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { s3 } from "../src/lib/s3";
import { env } from "../src/lib/env";

async function listTtsFiles(): Promise<string[]> {
	const keys: string[] = [];
	let continuationToken: string | undefined;

	do {
		const res = await s3.send(
			new ListObjectsV2Command({
				Bucket: env.CLOUDFLARE_BUCKET,
				Prefix: "tts/",
				ContinuationToken: continuationToken,
			}),
		);

		for (const obj of res.Contents ?? []) {
			if (obj.Key) keys.push(obj.Key);
		}

		continuationToken = res.NextContinuationToken;
	} while (continuationToken);

	return keys;
}

async function purge() {
	const keys = await listTtsFiles();

	if (keys.length === 0) {
		console.log("No TTS files found in R2.");
		process.exit(0);
	}

	console.log(`Found ${keys.length} TTS files in R2 (tts/ folder).\n`);
	console.log("Sample files:");
	for (const key of keys.slice(0, 5)) {
		console.log(`  ${key}`);
	}
	if (keys.length > 5) {
		console.log(`  ... and ${keys.length - 5} more`);
	}

	process.stdout.write(
		"\nAre you sure you want to delete ALL TTS audio files? (y/N): ",
	);

	const answer = await new Promise<string>((resolve) => {
		process.stdin.setEncoding("utf-8");
		process.stdin.once("data", (data) => resolve(data.toString().trim()));
	});

	if (answer.toLowerCase() !== "y") {
		console.log("Aborted.");
		process.exit(0);
	}

	console.log("\nDeleting...");
	let deleted = 0;
	let failed = 0;

	for (const key of keys) {
		try {
			await s3.send(
				new DeleteObjectCommand({
					Bucket: env.CLOUDFLARE_BUCKET,
					Key: key,
				}),
			);
			deleted++;
			process.stdout.write(".");
		} catch (err) {
			failed++;
			console.error(
				`\n  Failed to delete ${key}: ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	console.log(`\n\nDone: ${deleted} deleted, ${failed} failed.`);
	process.exit(failed > 0 ? 1 : 0);
}

purge();
