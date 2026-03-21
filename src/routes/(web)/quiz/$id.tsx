import { createFileRoute } from "@tanstack/react-router";
import { getQuizById } from "@/actions/quizzes";
import QuestionList from "../questions/-sections/question-list";
import QuizHeader from "./-sections/quiz-header";

export const Route = createFileRoute("/(web)/quiz/$id")({
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

	if (!quiz) {
		return <div>Quiz not found</div>;
	}

	return (
		<div className="p-4">
			<div className="mb-3">
				<QuizHeader quiz={quiz} />
			</div>
			<QuestionList questions={quiz.questions} disableKey={["quizId"]} />
		</div>
	);
}
