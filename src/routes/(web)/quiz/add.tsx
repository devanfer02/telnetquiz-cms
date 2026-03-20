import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { addQuiz } from "@/actions/quizzes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";

export const Route = createFileRoute("/(web)/quiz/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			title: "",
			difficulty: "easy",
			chapterId: 0,
			level: 1,
		} as QuizFormData,
		onSubmit: async ({ value }) => {
			const result = await addQuiz({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create quiz. See logs.",
				});

				navigate({ to: "/quiz" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new quiz",
			});

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });

			navigate({
				to: "/quiz/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/quiz">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Tambah Kuis Baru
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk menambahkan kuis baru.
					</p>
				</div>
			</div>
			<Separator />
			<QuizForm form={form} buttonText="Tambah" />
		</div>
	);
}
