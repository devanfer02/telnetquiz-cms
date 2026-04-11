import { Eye } from "lucide-react";
import { useRef, useState } from "react";
import ContentPreviewer from "@/components/preview/content-previewer";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface QuizPreviewSheetProps {
	quiz: Quiz & { questions?: Question[] };
}

export default function QuizPreviewSheet({ quiz }: QuizPreviewSheetProps) {
	const questions = quiz.questions ?? [];
	const [showCorrect, setShowCorrect] = useState(false);
	const keyRef = useRef(0);

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

	if (questions.length === 0) return null;

	return (
		<Sheet
			onOpenChange={() => {
				keyRef.current += 1;
			}}
		>
			<SheetTrigger asChild>
				<Button
					type="button"
					className="bg-telnet-primary hover:bg-telnet-primary/90 text-white shadow-sm shrink-0 flex items-center gap-2"
				>
					<Eye className="w-4 h-4" />
					Preview
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-full sm:max-w-[460px] overflow-y-auto p-0"
			>
				<SheetHeader className="px-4 pt-4 pb-2">
					<SheetTitle className="text-lg">Preview: {quiz.title}</SheetTitle>
					<SheetDescription>
						Tampilan soal seperti di aplikasi mobile
					</SheetDescription>

					{/* Admin controls */}
					<div className="flex items-center justify-between mt-2 pt-2 border-t">
						<label className="flex items-center gap-2 text-sm cursor-pointer">
							<input
								type="checkbox"
								checked={showCorrect}
								onChange={(e) => setShowCorrect(e.target.checked)}
								className="rounded"
							/>
							<span className="text-muted-foreground">
								Tampilkan jawaban benar
							</span>
						</label>

						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<span>{questions.length} soal</span>
						</div>
					</div>
				</SheetHeader>

				<div className="flex justify-center px-4 pb-6 pt-2">
					<ContentPreviewer
						key={keyRef.current}
						title={quiz.title}
						mascotSrc={mascotSrc}
						questions={previewQuestions}
						showCorrect={showCorrect}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
}
