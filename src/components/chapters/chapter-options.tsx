import { getAllChapters } from "@/actions/chapters";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function ChapterOptions() {
	const { data: chapters } = useSuspenseQuery({
		queryKey: ["chapter-list"],
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
