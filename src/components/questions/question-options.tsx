import { getAllQuestions } from "@/actions/questions";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function QuestionOptions() {
	const { data: questions } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUESTIONS],
		queryFn: () => getAllQuestions(),
	});

	return (
		<>
			{questions.map((question) => (
				<option key={question.id} value={question.id}>
					{question.question}
				</option>
			))}
		</>
	);
}
