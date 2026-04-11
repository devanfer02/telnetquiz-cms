import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { getAllQuestions } from "@/actions/questions";
import ContentPreviewer from "@/components/preview/content-previewer";
import { QUERY_KEYS } from "@/lib/constant";

export const Route = createFileRoute("/(web)/preview/pretest")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.QUESTIONS],
			queryFn: () => getAllQuestions(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const [showCorrect, setShowCorrect] = useState(false);
	const [previewKey, setPreviewKey] = useState(0);

	const { data: questions } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUESTIONS],
		queryFn: () => getAllQuestions(),
	});

	const pretestQuestions = (questions ?? []).filter(
		(q) => q.type === "pretest",
	);

	const previewQuestions = pretestQuestions.map((q) => ({
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

	return (
		<div>
			<div className="flex items-center gap-3 mb-6">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="p-2 rounded-lg hover:bg-muted transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div>
					<h1 className="text-2xl font-bold">Preview Pretest</h1>
					<p className="text-sm text-muted-foreground">
						{pretestQuestions.length} soal
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
					title="Pretest"
					mascotSrc="/assets/mascot/chap1.png"
					questions={previewQuestions}
					showCorrect={showCorrect}
				/>
			</div>
		</div>
	);
}
