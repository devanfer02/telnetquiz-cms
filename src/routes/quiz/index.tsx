import { createFileRoute } from "@tanstack/react-router";
import QuizList from "./-sections/quiz-list";
import { getAllQuizzes } from "@/actions/quizzes";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/quiz/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: ["quiz-list"],
			queryFn: () => getAllQuizzes(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: quizzes } = useSuspenseQuery({
		queryKey: ["quiz-list"],
		queryFn: () => getAllQuizzes(),
		staleTime: 60 * 1000,
	});

	return (
		<>
			<div className="mt-3 mb-5">
				<h1 className="text-3xl font-black text-telnet-primary tracking-tight">
					Quizzes
				</h1>
				<p className="text-muted-foreground">
					Daftar semua kuis tentang Media dan Jaringan Telekomunikasi.
				</p>
			</div>
			<QuizList quizzes={quizzes} />
		</>
	);
}
