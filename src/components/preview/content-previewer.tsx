import { Check } from "lucide-react";
import { useCallback, useState } from "react";
import PhoneFrame from "./phone-frame";

interface PreviewQuestion {
	id: number;
	description: string;
	question: string;
	imageLink: string | null;
	options: { id: number; text: string; isCorrect: boolean }[];
}

interface ContentPreviewerProps {
	title: string;
	mascotSrc?: string;
	questions: PreviewQuestion[];
	showCorrect: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function ContentPreviewer({
	title,
	mascotSrc,
	questions,
	showCorrect,
}: ContentPreviewerProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(
		new Map(),
	);
	const [finished, setFinished] = useState(false);

	const currentQuestion = questions[currentIndex];
	const isLastQuestion = currentIndex === questions.length - 1;
	const selectedOptionId = currentQuestion
		? (selectedAnswers.get(currentQuestion.id) ?? null)
		: null;

	const handleSelectOption = useCallback(
		(questionId: number, optionId: number) => {
			if (finished) return;
			setSelectedAnswers((prev) => {
				const next = new Map(prev);
				next.set(questionId, optionId);
				return next;
			});
		},
		[finished],
	);

	const handleNext = useCallback(() => {
		if (isLastQuestion) {
			setFinished(true);
		} else {
			setCurrentIndex((i) => i + 1);
		}
	}, [isLastQuestion]);

	const handleRestart = useCallback(() => {
		setCurrentIndex(0);
		setSelectedAnswers(new Map());
		setFinished(false);
	}, []);

	if (questions.length === 0) {
		return (
			<PhoneFrame>
				<div className="flex items-center justify-center h-full text-gray-400 text-sm italic px-6 text-center">
					Tidak ada soal untuk ditampilkan
				</div>
			</PhoneFrame>
		);
	}

	if (finished) {
		const correctCount = questions.filter((q) => {
			const selected = selectedAnswers.get(q.id);
			return q.options.some((o) => o.id === selected && o.isCorrect);
		}).length;

		return (
			<PhoneFrame>
				<div className="flex flex-col items-center justify-center h-full gap-6 px-6">
					{mascotSrc && (
						<img
							src={mascotSrc}
							alt="Mascot"
							className="w-24 h-24 object-contain"
						/>
					)}
					<div className="text-center">
						<h2 className="text-xl font-bold text-telnet-secondary mb-2">
							Selesai!
						</h2>
						{showCorrect && (
							<p className="text-sm text-gray-600">
								Jawaban benar: {correctCount} / {questions.length}
							</p>
						)}
						<p className="text-xs text-gray-400 mt-1">
							{selectedAnswers.size} dari {questions.length} soal dijawab
						</p>
					</div>
					<button
						type="button"
						className="w-full max-w-[200px] py-3 rounded-xl bg-telnet-primary text-white font-bold text-sm"
						onClick={handleRestart}
					>
						Ulangi Preview
					</button>
				</div>
			</PhoneFrame>
		);
	}

	return (
		<PhoneFrame>
			<div className="flex flex-col h-full">
				{/* Progress bar */}
				<div className="px-4 pt-2 pb-1">
					<div className="relative h-3 rounded-full bg-telnet-surface overflow-hidden border border-telnet-primary/30">
						<div
							className="absolute inset-y-0 left-0 bg-telnet-primary rounded-full transition-all duration-300"
							style={{
								width: `${((currentIndex + 1) / questions.length) * 100}%`,
							}}
						/>
						{/* Dividers */}
						{questions.length <= 20 &&
							questions.map((q, i) => {
								if (i === 0) return null;
								const pct = (i / questions.length) * 100;
								return (
									<div
										key={q.id}
										className="absolute top-0 bottom-0 w-[2px] bg-white/60"
										style={{ left: `${pct}%` }}
									/>
								);
							})}
					</div>
					<p className="text-[10px] text-gray-400 text-right mt-0.5">
						{currentIndex + 1}/{questions.length}
					</p>
				</div>

				{/* Header area */}
				<div className="bg-telnet-surface px-4 py-3">
					<div className="flex items-start gap-3">
						{mascotSrc && (
							<img
								src={mascotSrc}
								alt="Mascot"
								className="w-14 h-14 object-contain shrink-0"
							/>
						)}
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-bold text-telnet-secondary">
								{title}
							</h3>
							{currentQuestion.description && (
								<div
									className="text-xs text-telnet-secondary/80 mt-1 prose prose-xs max-w-none [&_p]:m-0 [&_img]:m-0"
									dangerouslySetInnerHTML={{
										__html: currentQuestion.description,
									}}
								/>
							)}
						</div>
					</div>

					{currentQuestion.imageLink && (
						<div className="mt-3 flex justify-center">
							<img
								src={currentQuestion.imageLink}
								alt="Soal"
								className="max-h-40 rounded-lg object-contain"
							/>
						</div>
					)}
				</div>

				{/* Question + Options area */}
				<div className="flex-1 flex flex-col bg-white overflow-y-auto">
					<div className="px-4 py-3 flex-1">
						{/* Question text */}
						<div
							className="text-sm text-telnet-secondary font-semibold text-center mb-4 prose prose-sm max-w-none [&_p]:m-0 [&_img]:m-0"
							dangerouslySetInnerHTML={{
								__html: currentQuestion.question,
							}}
						/>

						{/* Options */}
						<div className="flex flex-col gap-2">
							{currentQuestion.options.map((opt, i) => {
								const isSelected = selectedOptionId === opt.id;
								const isCorrectOption = opt.isCorrect;
								const showAsCorrect = showCorrect && isCorrectOption;

								let bgClass = "bg-telnet-surface/50 border-telnet-surface";
								if (isSelected) {
									bgClass = "bg-telnet-primary/20 border-telnet-primary";
								}
								if (showAsCorrect) {
									bgClass = "bg-green-100 border-green-500";
								}

								return (
									<button
										key={opt.id}
										type="button"
										className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 text-left transition-all ${bgClass}`}
										onClick={() =>
											handleSelectOption(currentQuestion.id, opt.id)
										}
									>
										<span
											className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
												isSelected
													? "bg-telnet-primary text-white"
													: showAsCorrect
														? "bg-green-500 text-white"
														: "bg-white text-telnet-secondary border border-telnet-secondary/30"
											}`}
										>
											{showAsCorrect ? (
												<Check className="w-3.5 h-3.5" />
											) : (
												LETTERS[i]
											)}
										</span>
										<span className="text-sm text-telnet-secondary">
											{opt.text}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Navigation button */}
					<div className="px-4 py-3 mt-auto">
						<button
							type="button"
							className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
								selectedOptionId !== null
									? "bg-telnet-primary text-white"
									: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
							disabled={selectedOptionId === null}
							onClick={handleNext}
						>
							{isLastQuestion ? "Selesai" : "Lanjutkan"}
						</button>
					</div>
				</div>
			</div>
		</PhoneFrame>
	);
}
