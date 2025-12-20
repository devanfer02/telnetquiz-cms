import { getAllQuestions } from "@/actions/questions";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function QuestionOptions() {
	const { data: questions } = useSuspenseQuery({
		queryKey: ["question-list"],
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
