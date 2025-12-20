import { createFileRoute } from "@tanstack/react-router";
import QuestionList from "./-sections/question-list";
import { getAllQuestions } from "@/actions/questions";

export const Route = createFileRoute("/questions/")({
	loader: async () => {
    const questions = await getAllQuestions()

    return {
      questions 
    }
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { questions } = Route.useLoaderData();

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
