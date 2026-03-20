import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAllQuestions } from "@/actions/questions";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
import QuestionList from "./-sections/question-list";

export const Route = createFileRoute("/(web)/questions/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.QUESTIONS],
			queryFn: () => getAllQuestions(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: questions } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUESTIONS],
		queryFn: () => getAllQuestions(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Questions"
				description="Daftar semua pertanyaan tentang Media dan Jaringan Telekomunikasi."
			/>
			<QuestionList questions={questions} />
		</div>
	);
}
