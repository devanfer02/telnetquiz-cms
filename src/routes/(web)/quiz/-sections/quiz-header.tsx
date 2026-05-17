import { Link } from "@tanstack/react-router";
import { Brain, Pencil, Trophy } from "lucide-react";
import { MetadataTable } from "@/components/global/date-metadata";
import { Button } from "@/components/ui/button";
import QuizPreviewSheet from "./quiz-preview-sheet";

const difficultyStyles = {
	easy: "bg-green-100 text-green-700 border-green-200",
	medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
	hard: "bg-red-100 text-red-700 border-red-200",
};

interface QuizHeaderProps {
	quiz: Quiz & { questions?: Question[] };
}

export default function QuizHeader({ quiz }: QuizHeaderProps) {
	const id = quiz.id.toString();

	return (
		<div className="bg-linear-to-r from-orange-50 to-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
					{/* Left side - Title and metadata */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Brain className="w-5 h-5 text-orange-600" />
							</div>
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Quiz
							</span>
						</div>
						<h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 wrap-break-word">
							{quiz.title}
						</h1>

						{/* Quiz metadata badges */}
						<div className="flex flex-wrap items-center gap-3">
							<span
								className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${difficultyStyles[quiz.difficulty]}`}
							>
								{quiz.difficulty.charAt(0).toUpperCase() +
									quiz.difficulty.slice(1)}
							</span>

							<span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
								{quiz.numberOfQuestions} Questions
							</span>

							<span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 flex items-center gap-1.5">
								<Trophy className="w-3.5 h-3.5" />
								Level {quiz.level}
							</span>

							{quiz.chapter && (
								<span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
									{quiz.chapter.title}
								</span>
							)}
						</div>
					</div>

					{/* Right side - Action buttons */}
					<div className="flex items-center gap-2 shrink-0 flex-wrap">
						<QuizPreviewSheet quiz={quiz} />
						<Button
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
							asChild
						>
							<Link
								to="/quiz/edit/$id"
								params={{ id }}
								className="flex items-center gap-2"
							>
								<Pencil className="w-4 h-4" />
								Edit Quiz
							</Link>
						</Button>
					</div>
				</div>

				<div className="mt-6 border-t border-gray-200">
					<MetadataTable
						createdAt={quiz.createdAt}
						updatedAt={quiz.updatedAt}
					/>
				</div>
			</div>
		</div>
	);
}
