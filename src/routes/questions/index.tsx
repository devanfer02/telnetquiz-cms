import { createFileRoute } from "@tanstack/react-router";
import QuestionList from "./-sections/question-list";
import { getAllQuestions } from "@/actions/questions";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/questions/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: ["question-list"],
			queryFn: () => getAllQuestions(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: questions } = useSuspenseQuery({
		queryKey: ["question-list"],
		queryFn: () => getAllQuestions(),
		staleTime: 60 * 1000,
	});

	return (
		<>
			<div className="mt-3 mb-5">
				<h1 className="text-3xl font-black text-telnet-primary tracking-tight">
					Questions
				</h1>
				<p className="text-muted-foreground">
					Daftar semua pertanyaan tentang Media dan Jaringan Telekomunikasi.
				</p>
			</div>
			<QuestionList questions={questions} />
		</>
	);
}
