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

export const hadHtml = (s: string | null | undefined): boolean =>
	!!s && /<[a-z][^>]*>/i.test(s);

const escapeHtml = (text: string): string =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function textToHtml(text: string): string {
	const trimmed = text.trim();
	if (!trimmed) return "";
	const blocks = trimmed.split(/\n{2,}/);
	return blocks
		.map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
		.join("");
}
