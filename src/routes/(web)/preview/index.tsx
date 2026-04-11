import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronRight,
	Eye,
	FileQuestion,
	Smartphone,
} from "lucide-react";
import { getAllChapters } from "@/actions/chapters";
import { getAllQuestions } from "@/actions/questions";
import { getAllQuizzes } from "@/actions/quizzes";
import PageHeader from "@/components/global/page-header";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { QUERY_KEYS } from "@/lib/constant";

export const Route = createFileRoute("/(web)/preview/")({
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.QUIZZES],
				queryFn: () => getAllQuizzes(),
			}),
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.QUESTIONS],
				queryFn: () => getAllQuestions(),
			}),
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.CHAPTERS],
				queryFn: () => getAllChapters(),
			}),
		]);
	},
	component: RouteComponent,
});

const difficultyLabel: Record<string, { text: string; className: string }> = {
	easy: {
		text: "Mudah",
		className: "bg-green-100 text-green-700",
	},
	medium: {
		text: "Sedang",
		className: "bg-yellow-100 text-yellow-700",
	},
	hard: {
		text: "Sulit",
		className: "bg-red-100 text-red-700",
	},
};

function RouteComponent() {
	const { data: quizzes } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUIZZES],
		queryFn: () => getAllQuizzes(),
	});

	const { data: questions } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.QUESTIONS],
		queryFn: () => getAllQuestions(),
	});

	const { data: chapters } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.CHAPTERS],
		queryFn: () => getAllChapters(),
	});

	const pretestCount = (questions ?? []).filter(
		(q) => q.type === "pretest",
	).length;

	const chapterMap = new Map<
		number,
		{ chapter: Chapter; quizzes: NonNullable<typeof quizzes> }
	>();

	for (const chapter of chapters ?? []) {
		chapterMap.set(chapter.id, { chapter, quizzes: [] });
	}

	for (const quiz of quizzes ?? []) {
		const chapterId = quiz.chapterId ?? quiz.chapter?.id;
		if (!chapterId) continue;
		const entry = chapterMap.get(chapterId);
		if (entry) {
			entry.quizzes.push(quiz);
		}
	}

	for (const entry of chapterMap.values()) {
		entry.quizzes.sort((a, b) => a.level - b.level);
	}

	const sortedChapters = [...chapterMap.values()].sort(
		(a, b) => a.chapter.id - b.chapter.id,
	);

	return (
		<div>
			<PageHeader
				title="Preview"
				description="Preview konten quiz dan pretest seperti tampilan di aplikasi mobile."
			/>

			<div className="space-y-6">
				{/* Pretest card */}
				<Link
					to="/preview/pretest"
					className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-border hover:border-telnet-primary/50 hover:shadow-md transition-all"
				>
					<div className="p-3 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
						<FileQuestion className="w-6 h-6" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-foreground">Preview Pretest</h3>
						<p className="text-sm text-muted-foreground">{pretestCount} soal</p>
					</div>
					<ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-telnet-primary transition-colors" />
				</Link>

				{/* Chapters */}
				<Accordion
					type="multiple"
					defaultValue={sortedChapters.map(({ chapter }) => String(chapter.id))}
				>
					{sortedChapters.map(({ chapter, quizzes: chapterQuizzes }) => (
						<AccordionItem
							key={chapter.id}
							value={String(chapter.id)}
							className="bg-white rounded-xl border border-border overflow-hidden mb-4 last:mb-0"
						>
							<AccordionTrigger className="px-5 py-4 hover:no-underline bg-gradient-to-r from-orange-50/60 to-white [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
								<div className="flex items-center gap-3">
									<div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
										<BookOpen className="w-5 h-5" />
									</div>
									<div className="text-left">
										<h3 className="font-semibold text-foreground">
											{chapter.title}
										</h3>
										<p className="text-xs text-muted-foreground">
											{chapterQuizzes.length} level
										</p>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pb-0">
								{chapterQuizzes.length === 0 ? (
									<p className="px-5 py-4 text-sm text-muted-foreground italic">
										Belum ada quiz di chapter ini.
									</p>
								) : (
									<div className="divide-y divide-border/60">
										{chapterQuizzes.map((quiz) => {
											const diff = difficultyLabel[quiz.difficulty];
											return (
												<Link
													key={quiz.id}
													to="/preview/quiz/$quizId"
													params={{ quizId: String(quiz.id) }}
													className="group flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/40 transition-colors"
												>
													<div className="flex items-center justify-center w-9 h-9 rounded-full bg-telnet-primary/10 text-telnet-primary font-bold text-sm shrink-0">
														{quiz.level}
													</div>
													<div className="flex-1 min-w-0">
														<p className="font-medium text-sm text-foreground truncate">
															{quiz.title}
														</p>
														<div className="flex items-center gap-2 mt-0.5">
															<span className="text-xs text-muted-foreground">
																{quiz.numberOfQuestions} soal
															</span>
															{diff && (
																<span
																	className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${diff.className}`}
																>
																	{diff.text}
																</span>
															)}
														</div>
													</div>
													<Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
												</Link>
											);
										})}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>

				{sortedChapters.length === 0 && (
					<div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
						<Smartphone className="w-12 h-12 opacity-40" />
						<p className="text-sm">Belum ada konten untuk di-preview.</p>
					</div>
				)}
			</div>
		</div>
	);
}
