import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAllQuizzes } from "@/actions/quizzes";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
import QuizList from "./-sections/quiz-list";

export const Route = createFileRoute("/(web)/quiz/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.QUIZZES],
			queryFn: () => getAllQuizzes(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: quizzes } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUIZZES],
		queryFn: () => getAllQuizzes(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Quizzes"
				description="Daftar semua kuis tentang Media dan Jaringan Telekomunikasi."
			/>
			<QuizList quizzes={quizzes} />
		</div>
	);
}
