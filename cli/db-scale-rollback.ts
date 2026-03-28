import { like, inArray } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
	chapters,
	studyMaterials,
	schools,
	users,
} from "../src/database/schema";

const telcoChapterTitles = [
	"Media Transmisi",
	"Jaringan Nirkabel (Wireless)",
	"Protokol dan Standar Telekomunikasi",
	"Teknik Modulasi dan Multiplexing",
	"Keamanan Jaringan Telekomunikasi",
];

const telcoMaterialTitles = [
	"Pengenalan Media Transmisi",
	"Kabel Tembaga (UTP, STP, Coaxial)",
	"Fiber Optik (Single-mode dan Multi-mode)",
	"Teknologi WiFi dan Standar IEEE 802.11",
	"Bluetooth dan Teknologi NFC",
	"Jaringan Seluler (2G, 3G, 4G, 5G)",
	"Model OSI dan TCP/IP dalam Telekomunikasi",
	"Protokol VoIP dan SIP",
	"Standar ITU-T dan IEEE",
	"Modulasi Analog (AM, FM, PM)",
	"Modulasi Digital (ASK, FSK, PSK, QAM)",
	"Multiplexing (TDM, FDM, WDM, CDM)",
	"Ancaman Keamanan Jaringan",
	"Enkripsi dan Kriptografi",
	"Firewall, VPN, dan IDS/IPS",
];

const scaleSchoolNames = [
	"SMKN 1 Jakarta",
	"SMKN 2 Bandung",
	"SMKN 3 Surabaya",
	"SMA Negeri 1 Yogyakarta",
	"SMK Telkom Purwokerto",
];

async function rollback() {
	console.log("Rolling back scale-test data...\n");

	try {
		// 1. Delete mock users (cascades → accounts, sessions, submissions, pretestSubmissions)
		console.log("[1/4] Deleting mock users (user*@mock.test)...");
		const deletedUsers = await db
			.delete(users)
			.where(like(users.email, "user%@mock.test"))
			.returning({ id: users.id });
		console.log(`  ${deletedUsers.length} users deleted (+ cascaded accounts, submissions, pretest submissions)`);

		// 2. Delete telco chapters (cascades → quizzes → questions → options, submissions)
		console.log("[2/4] Deleting telco chapters...");
		const deletedChapters = await db
			.delete(chapters)
			.where(inArray(chapters.title, telcoChapterTitles))
			.returning({ id: chapters.id });
		console.log(`  ${deletedChapters.length} chapters deleted (+ cascaded quizzes, questions, options)`);

		// 3. Delete telco study materials
		console.log("[3/4] Deleting telco study materials...");
		const deletedMaterials = await db
			.delete(studyMaterials)
			.where(inArray(studyMaterials.title, telcoMaterialTitles))
			.returning({ id: studyMaterials.id });
		console.log(`  ${deletedMaterials.length} study materials deleted`);

		// 4. Delete scale schools
		console.log("[4/4] Deleting scale-test schools...");
		const deletedSchools = await db
			.delete(schools)
			.where(inArray(schools.name, scaleSchoolNames))
			.returning({ id: schools.id });
		console.log(`  ${deletedSchools.length} schools deleted`);

		console.log("\nScale-test rollback complete. Essentials data preserved.");
	} catch (error) {
		console.error("\nRollback failed:");
		console.error(error);
		process.exit(1);
	}

	process.exit(0);
}

rollback();
