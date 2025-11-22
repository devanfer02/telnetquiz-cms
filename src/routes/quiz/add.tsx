import { createFileRoute } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { QuizFormData } from "@/types/zod/quiz";
import QuizForm from "./-sections/quiz-form";

export const Route = createFileRoute("/quiz/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const form = useCustomForm({
		defaultValues: {
			title: "",
			difficulty: "easy",
			numberOfQuestions: 1,
			chapterId: 0,
		} as QuizFormData,
		onSubmit: async ({ value }) => {
			console.log("submitted ", value);
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Tambah Kuis Baru
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan kuis baru.
				</p>
			</div>
			<QuizForm form={form} buttonText="Tambah" />
		</>
	);
}
