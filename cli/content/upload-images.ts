import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../src/lib/s3";
import { env } from "../../src/lib/env";

// ============================================================================
// CONFIG
// ============================================================================

const CLI_DIR = import.meta.dir;
const IMAGES_DIR = join(CLI_DIR, "data", "prod", "images");
const CONTENT_DIR = join(CLI_DIR, "data", "prod");
const CHAPTER_DIRS = ["chapter0", "chapter1", "chapter2"];

const MIME_MAP: Record<string, string> = {
	".webp": "image/webp",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".svg": "image/svg+xml",
};

const flags = {
	dryRun: process.argv.includes("--dry-run"),
	skipJsonUpdate: process.argv.includes("--skip-json-update"),
};

// ============================================================================
// TYPES
// ============================================================================

interface UploadManifest {
	[localRef: string]: string;
}

interface ChapterJson {
	chapter: { title: string; description: string; mascotId: number };
	levels: {
		title: string;
		level: number;
		difficulty: string;
		questions: {
			description: string;
			question: string;
			imageLink: string | null;
			studyMaterial: {
				title: string;
				content: string;
				imageLink: string | null;
			};
			options: { text: string; isCorrect: boolean }[];
		}[];
	}[];
}

interface PretestJson {
	questions: {
		chapterRef: string;
		description: string;
		question: string;
		imageLink: string | null;
		options: { text: string; isCorrect: boolean }[];
	}[];
}

// ============================================================================
// UPLOAD
// ============================================================================

async function uploadImage(
	localPath: string,
	r2Key: string,
): Promise<string> {
	const fileBuffer = readFileSync(localPath);
	const ext = extname(localPath).toLowerCase();
	const contentType = MIME_MAP[ext] ?? "application/octet-stream";

	await s3.send(
		new PutObjectCommand({
			Bucket: env.CLOUDFLARE_BUCKET,
			Key: r2Key,
			Body: new Uint8Array(fileBuffer),
			ContentType: contentType,
		}),
	);

	return `${env.CLOUDFLARE_R2_DOMAIN}/${r2Key}`;
}

// ============================================================================
// JSON UPDATE
// ============================================================================

function updateJsonImageLinks(manifest: UploadManifest): void {
	const chapterFiles = ["chapter-1-tcp-ip.json", "chapter-2-wlan.json"];

	for (const file of chapterFiles) {
		const filePath = join(CONTENT_DIR, file);
		if (!existsSync(filePath)) continue;

		const data: ChapterJson = JSON.parse(readFileSync(filePath, "utf-8"));
		let updated = 0;

		for (const level of data.levels) {
			for (const q of level.questions) {
				if (q.imageLink && manifest[q.imageLink]) {
					q.imageLink = manifest[q.imageLink];
					updated++;
				}
				if (q.studyMaterial.imageLink && manifest[q.studyMaterial.imageLink]) {
					q.studyMaterial.imageLink = manifest[q.studyMaterial.imageLink];
					updated++;
				}
			}
		}

		writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
		console.log(`  ${file}: ${updated} links updated`);
	}

	const pretestPath = join(CONTENT_DIR, "pretest.json");
	if (existsSync(pretestPath)) {
		const data: PretestJson = JSON.parse(readFileSync(pretestPath, "utf-8"));
		let updated = 0;

		for (const q of data.questions) {
			if (q.imageLink && manifest[q.imageLink]) {
				q.imageLink = manifest[q.imageLink];
				updated++;
			}
		}

		writeFileSync(pretestPath, JSON.stringify(data, null, 2) + "\n");
		console.log(`  pretest.json: ${updated} links updated`);
	}
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("=== Content Image Upload to R2 ===\n");

	if (flags.dryRun) {
		console.log("  (DRY RUN — no uploads or writes)\n");
	}

	// Phase 1: Discover images
	console.log("[Phase 1] Discovering images...");
	const imagesToUpload: { localPath: string; r2Key: string; localRef: string }[] = [];

	for (const dir of CHAPTER_DIRS) {
		const dirPath = join(IMAGES_DIR, dir);
		if (!existsSync(dirPath)) {
			console.log(`  Skipping ${dir}/ (not found)`);
			continue;
		}

		const files = readdirSync(dirPath).filter((f) => {
			const ext = extname(f).toLowerCase();
			return ext in MIME_MAP;
		});

		for (const file of files) {
			imagesToUpload.push({
				localPath: join(dirPath, file),
				r2Key: `content/${dir}/${file}`,
				localRef: `images/${dir}/${file}`,
			});
		}

		console.log(`  ${dir}/: ${files.length} images`);
	}

	console.log(`\n  Total: ${imagesToUpload.length} images to upload\n`);

	if (imagesToUpload.length === 0) {
		console.log("No images found. Exiting.");
		process.exit(0);
	}

	// Phase 2: Upload to R2
	console.log("[Phase 2] Uploading to R2...");
	const manifest: UploadManifest = {};
	let uploaded = 0;
	let failed = 0;

	for (const img of imagesToUpload) {
		if (flags.dryRun) {
			const url = `${env.CLOUDFLARE_R2_DOMAIN}/${img.r2Key}`;
			manifest[img.localRef] = url;
			console.log(`  [dry] ${img.localRef} -> ${img.r2Key}`);
			uploaded++;
			continue;
		}

		try {
			const url = await uploadImage(img.localPath, img.r2Key);
			manifest[img.localRef] = url;
			uploaded++;
			process.stdout.write(".");
		} catch (err) {
			failed++;
			console.error(
				`\n  Failed: ${img.localRef}: ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	if (!flags.dryRun) console.log();
	console.log(`\n  Uploaded: ${uploaded}, Failed: ${failed}\n`);

	// Phase 3: Update JSON files
	if (!flags.skipJsonUpdate) {
		console.log("[Phase 3] Updating JSON content files...");

		if (flags.dryRun) {
			console.log("  [dry] Would update imageLink fields in chapter + pretest JSONs");
		} else {
			updateJsonImageLinks(manifest);
		}

		console.log();
	}

	// Phase 4: Save manifest
	const manifestPath = join(CONTENT_DIR, "upload-manifest.json");
	if (!flags.dryRun) {
		writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
		console.log(`[Phase 4] Manifest saved: ${manifestPath}`);
	} else {
		console.log("[Phase 4] [dry] Would save manifest to upload-manifest.json");
	}

	console.log("\nDone!");

	if (failed > 0) process.exit(1);
}

main();
