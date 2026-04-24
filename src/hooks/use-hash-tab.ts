import { useCallback, useEffect, useState } from "react";

function parseHash(hash: string): string[] {
	return hash.replace(/^#/, "").split("/").filter(Boolean);
}

function buildHash(segments: string[]): string {
	return segments.length > 0 ? `#${segments.join("/")}` : "";
}

export function useHashTab<T extends string>(
	segmentIndex: number,
	validValues: readonly T[],
	defaultValue: T,
): [T, (next: T) => void] {
	const [value, setValue] = useState<T>(defaultValue);

	useEffect(() => {
		const sync = () => {
			const segments = parseHash(window.location.hash);
			const raw = segments[segmentIndex];
			if (raw && (validValues as readonly string[]).includes(raw)) {
				setValue(raw as T);
			} else {
				setValue(defaultValue);
			}
		};
		sync();
		window.addEventListener("hashchange", sync);
		return () => window.removeEventListener("hashchange", sync);
	}, [segmentIndex, validValues, defaultValue]);

	const update = useCallback(
		(next: T) => {
			setValue(next);
			const segments = parseHash(window.location.hash);
			segments[segmentIndex] = next;
			if (segmentIndex === 0) segments.length = 1;
			const newHash = buildHash(segments);
			const target = `${window.location.pathname}${window.location.search}${newHash}`;
			window.history.replaceState(null, "", target);
		},
		[segmentIndex],
	);

	return [value, update];
}
