import { getAllQuizzes } from "@/actions/quizzes";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function QuizOptions() {
	const { data: quizzes } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUIZZES],
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
