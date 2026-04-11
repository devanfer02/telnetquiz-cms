import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getQuizById } from "@/actions/quizzes";
import ContentPreviewer from "@/components/preview/content-previewer";

export const Route = createFileRoute("/(web)/preview/quiz/$quizId")({
	loader: async ({ params }) => {
		const quiz = await getQuizById({ data: Number(params.quizId) });
		return { quiz };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { quiz } = Route.useLoaderData();
	const [showCorrect, setShowCorrect] = useState(false);
	const [previewKey, setPreviewKey] = useState(0);

	if (!quiz) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<p className="text-muted-foreground">Quiz tidak ditemukan.</p>
				<Link
					to="/preview"
					className="text-sm text-telnet-primary hover:underline"
				>
					Kembali ke Preview
				</Link>
			</div>
		);
	}

	const questions = quiz.questions ?? [];
	const mascotSrc = quiz.chapter
		? `/assets/mascot/chap${quiz.chapter.mascotId}.png`
		: undefined;

	const previewQuestions = questions.map((q) => ({
		id: q.id,
		description: q.description,
		question: q.question,
		imageLink: q.imageLink,
		options: (q.options ?? []).map((o, oi) => ({
			id: q.id * 1000 + oi,
			text: o.text,
			isCorrect: o.isCorrect,
		})),
	}));

	const diffLabel: Record<string, string> = {
		easy: "Mudah",
		medium: "Sedang",
		hard: "Sulit",
	};

	return (
		<div>
			<div className="flex items-center gap-3 mb-6">
				<Link
					to="/preview"
					className="p-2 rounded-lg hover:bg-muted transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<div>
					<h1 className="text-2xl font-bold">{quiz.title}</h1>
					<p className="text-sm text-muted-foreground">
						{quiz.chapter?.title} &middot; Level {quiz.level} &middot;{" "}
						{diffLabel[quiz.difficulty] ?? quiz.difficulty} &middot;{" "}
						{questions.length} soal
					</p>
				</div>
			</div>

			<div className="flex items-center gap-4 mb-6 p-3 bg-muted/50 rounded-lg">
				<label className="flex items-center gap-2 text-sm cursor-pointer">
					<input
						type="checkbox"
						checked={showCorrect}
						onChange={(e) => {
							setShowCorrect(e.target.checked);
							setPreviewKey((k) => k + 1);
						}}
						className="rounded"
					/>
					<span className="text-muted-foreground">Tampilkan jawaban benar</span>
				</label>
			</div>

			<div className="flex justify-center">
				<ContentPreviewer
					key={previewKey}
					title={quiz.title}
					mascotSrc={mascotSrc}
					questions={previewQuestions}
					showCorrect={showCorrect}
				/>
			</div>
		</div>
	);
}
