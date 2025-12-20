import { createFileRoute } from "@tanstack/react-router";
import { mockQuestionsQuiz } from "@/data/mock-question";
import QuestionList from "../questions/question-list";
import { getQuizById } from "@/actions/quizzes";
import QuizHeader from "./-sections/quiz-header";

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
				<QuizHeader quiz={quiz} />
			</div>
			<QuestionList questions={questions} disableKey={["quizId"]} />
		</div>
	);
}
