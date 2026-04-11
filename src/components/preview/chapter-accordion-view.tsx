import { Check, X } from "lucide-react";
import { useMemo } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface ChapterAccordionQuestion {
	id: number;
	description: string;
	question: string;
	imageLink: string | null;
	chapterId: number | null;
	chapterTitle: string | null;
	options: { text: string; isCorrect: boolean }[];
}

interface ChapterAccordionViewProps {
	questions: ChapterAccordionQuestion[];
	showCorrect: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function ChapterAccordionView({
	questions,
	showCorrect,
}: ChapterAccordionViewProps) {
	const chapters = useMemo(() => {
		const map = new Map<
			string,
			{ title: string; questions: ChapterAccordionQuestion[] }
		>();

		for (const q of questions) {
			const key = q.chapterId?.toString() ?? "uncategorized";
			const existing = map.get(key) ?? {
				title: q.chapterTitle ?? "Tanpa Bab",
				questions: [],
			};
			existing.questions.push(q);
			map.set(key, existing);
		}

		return [...map.entries()].map(([key, data]) => ({
			key,
			title: data.title,
			questions: data.questions,
		}));
	}, [questions]);

	if (questions.length === 0) {
		return (
			<p className="text-center text-muted-foreground py-8 italic text-sm">
				Tidak ada soal
			</p>
		);
	}

	return (
		<Accordion type="multiple" defaultValue={chapters.map((c) => c.key)}>
			{chapters.map((chapter) => (
				<AccordionItem key={chapter.key} value={chapter.key}>
					<AccordionTrigger className="px-3 hover:no-underline">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-sm">{chapter.title}</span>
							<Badge variant="outline" className="text-xs">
								{chapter.questions.length} soal
							</Badge>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-4">
						<div className="flex flex-col gap-4">
							{chapter.questions.map((q, qi) => (
								<div key={q.id} className="border rounded-lg p-3 bg-muted/30">
									<p className="text-xs text-muted-foreground mb-1">
										Soal {qi + 1}
									</p>
									{q.description && (
										<div
											className="text-sm text-muted-foreground mb-1 prose prose-sm max-w-none [&_p]:m-0"
											dangerouslySetInnerHTML={{ __html: q.description }}
										/>
									)}
									<div
										className="text-sm font-medium mb-2 prose prose-sm max-w-none [&_p]:m-0"
										dangerouslySetInnerHTML={{ __html: q.question }}
									/>
									{q.imageLink && (
										<img
											src={q.imageLink}
											alt="Soal"
											className="max-h-32 rounded mb-2 object-contain"
										/>
									)}
									<div className="flex flex-col gap-1">
										{q.options.map((opt, oi) => (
											<div
												key={`${q.id}-opt-${LETTERS[oi]}`}
												className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
													showCorrect && opt.isCorrect
														? "bg-green-50 text-green-700"
														: ""
												}`}
											>
												{showCorrect ? (
													opt.isCorrect ? (
														<Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
													) : (
														<X className="w-3.5 h-3.5 text-red-400 shrink-0" />
													)
												) : (
													<span className="w-3.5 text-xs font-bold text-muted-foreground shrink-0">
														{LETTERS[oi]}
													</span>
												)}
												<span>{opt.text}</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
