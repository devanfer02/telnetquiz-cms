import { getAllQuizzes } from "@/actions/quizzes";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function QuizOptions() {
	const { data: quizzes } = useSuspenseQuery({
		queryKey: ["quiz-list"],
		queryFn: () => getAllQuizzes(),
	});

	return (
		<>
			{quizzes.map((quiz) => (
				<option key={quiz.id} value={quiz.id}>
					{quiz.title}
				</option>
			))}
		</>
	);
}
