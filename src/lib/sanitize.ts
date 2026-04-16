import DOMPurify from "isomorphic-dompurify";

export function stripHtml(html: string): string {
	return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			"p",
			"br",
			"b",
			"i",
			"em",
			"strong",
			"u",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"ul",
			"ol",
			"li",
			"a",
			"img",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"blockquote",
			"pre",
			"code",
			"span",
			"div",
			"sub",
			"sup",
		],
		ALLOWED_ATTR: [
			"href",
			"src",
			"alt",
			"title",
			"class",
			"style",
			"target",
			"rel",
			"width",
			"height",
		],
	});
}
