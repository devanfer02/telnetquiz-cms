import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { auth, sheets, type sheets_v4 } from "@googleapis/sheets";
import { env } from "./env";

let cachedClient: { sheets: sheets_v4.Sheets; spreadsheetId: string } | null =
	null;

export function getSheetsClient(): {
	sheets: sheets_v4.Sheets;
	spreadsheetId: string;
} {
	if (cachedClient) return cachedClient;

	const credentialsPath = resolve(process.cwd(), env.GOOGLE_SHEET_JSON_PATH);
	const credentials = JSON.parse(readFileSync(credentialsPath, "utf-8"));

	const authClient = new auth.GoogleAuth({
		credentials,
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});

	const sheetsClient = sheets({ version: "v4", auth: authClient });

	cachedClient = { sheets: sheetsClient, spreadsheetId: env.GOOGLE_SHEET_ID };
	return cachedClient;
}
