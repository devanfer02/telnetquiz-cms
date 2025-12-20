import { getAllChapters } from "@/actions/chapters";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function ChapterOptions() {
	const { data: chapters } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.CHAPTERS],
		queryFn: () => getAllChapters(),
	});

	return (
		<>
			{chapters.map((chapter) => (
				<option key={chapter.id} value={chapter.id}>
					{chapter.title}
				</option>
			))}
		</>
	);
}
