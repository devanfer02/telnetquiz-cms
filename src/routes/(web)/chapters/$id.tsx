import { createFileRoute } from "@tanstack/react-router";
import { getChapterById } from "@/actions/chapters";
import NotFound from "@/components/global/not-found";
import QuizList from "../quiz/-sections/quiz-list";
import ChapterHeader from "./-sections/chapter-header";

export const Route = createFileRoute("/(web)/chapters/$id")({
	loader: async ({ params }) => {
		const chapter = await getChapterById({ data: Number(params.id) });

		return {
			chapter,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { chapter } = Route.useLoaderData();

	if (!chapter) {
		return <NotFound message="Chapter not found" />;
	}

	return (
		<div className="p-4">
			<div className="mb-3">
				<ChapterHeader chapter={chapter} />
			</div>
			<QuizList
				quizzes={chapter.quizzes}
				disableKey={["chapterId", "chapterTitle"]}
			/>
		</div>
	);
}
