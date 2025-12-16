import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockQuestionsQuiz } from "@/data/mock-question";
import QuestionList from "../questions/-sections/question-list";
import { getQuizById } from "@/actions/quizzes";

export const Route = createFileRoute("/quiz/$id")({
	loader: async ({ params }) => {
		const quiz = await getQuizById({ data: Number(params.id) });

		return {
			quiz,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { quiz } = Route.useLoaderData();
	const questions = mockQuestionsQuiz["1"] || [];

	if (!quiz) {
		return <div>Quiz not found</div>;
	}

	return (
		<div className="p-4">
			<div className="mb-3">
				<div className="flex justify-between">
					<h1 className="text-3xl font-bold text-telnet-primary">
						Quiz: {quiz.title}
					</h1>
					<Button className="bg-blue-500 hover:bg-blue-600 text-white">
						<Link
							to="/quiz/edit/$id"
							params={{ id: quiz.id.toString() }}
							className="flex items-center justify-center"
						>
							<Pencil className="w-4 h-4 mr-2" />
							Edit Quiz
						</Link>
					</Button>
				</div>
				<p className="text-lg mt-2 text-telnet-secondary capitalize">
					Difficulty: {quiz.difficulty}
				</p>
			</div>
			<QuestionList questions={questions} disableKey={["quizId"]} />
		</div>
	);
}
