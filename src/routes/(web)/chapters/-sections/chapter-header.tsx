import { Link } from "@tanstack/react-router";
import { BookMarked, Pencil } from "lucide-react";
import { MetadataTable } from "@/components/global/date-metadata";
import { Button } from "@/components/ui/button";

interface ChapterHeaderProps {
	chapter: Chapter;
}

export default function ChapterHeader({ chapter }: ChapterHeaderProps) {
	const id = chapter.id.toString();

	return (
		<div className="bg-linear-to-r from-orange-50 to-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex items-start justify-between gap-6">
					{/* Left side - Title and description */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-orange-100 rounded-lg">
								<BookMarked className="w-5 h-5 text-orange-600" />
							</div>
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Chapter
							</span>
						</div>
						<h1 className="text-4xl font-bold text-gray-900 mb-3 wrap-break-word">
							{chapter.title}
						</h1>
					</div>

					{/* Right side - Action button */}
					<Button
						className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0"
						asChild
					>
						<Link
							to="/chapters/edit/$id"
							params={{ id }}
							className="flex items-center gap-2"
						>
							<Pencil className="w-4 h-4" />
							Edit Chapter
						</Link>
					</Button>
				</div>
				<div className="mt-6 pt-6 border-t border-gray-200 overflow-hidden">
					<p className="text-gray-700 break-words whitespace-pre-wrap">
						{chapter.description}
					</p>

					<MetadataTable
						createdAt={chapter.createdAt}
						updatedAt={chapter.updatedAt}
					/>
				</div>
			</div>
		</div>
	);
}
