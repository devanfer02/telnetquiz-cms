import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizList from "../quiz/-sections/quiz-list";
import { getChapterById } from "@/actions/chapters";

export const Route = createFileRoute("/chapters/$id")({
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
		return <div>Chapter not found</div>;
	}

	const id = chapter.id.toString();

	return (
		<div className="p-4">
			<div className="mb-3">
				<div className="flex justify-between">
					<h1 className="text-3xl font-bold text-telnet-primary">
						Chapter: {chapter.title}
					</h1>
					<Button className="bg-blue-500 hover:bg-blue-600 text-white">
						<Link
							to="/chapters/edit/$id"
							params={{ id }}
							className="flex items-center justify-center"
						>
							<Pencil className="w-4 h-4 mr-2" />
							Edit Chapter
						</Link>
					</Button>
				</div>

				<p className="text-lg mt-2 text-telnet-secondary">
					{chapter.description}
				</p>
			</div>
			<QuizList quizzes={chapter.quizzes} disableKey={["chapterId"]} />
		</div>
	);
}
