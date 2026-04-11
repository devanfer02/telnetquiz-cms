import { Link } from "@tanstack/react-router";
import { BookOpen, Eye, Pencil } from "lucide-react";
import { MetadataTable } from "@/components/global/date-metadata";
import { Button } from "@/components/ui/button";

interface MaterialHeaderProps {
	studyMaterial: StudyMaterial;
}

export default function MaterialHeader({ studyMaterial }: MaterialHeaderProps) {
	return (
		<div className="bg-linear-to-r from-orange-50 to-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex items-start justify-between gap-6">
					{/* Left side - Title and image */}
					<div className="flex-1 min-w-0 flex gap-6">
						{/* Optional image */}
						{studyMaterial.imageLink && (
							<img
								src={studyMaterial.imageLink}
								alt={studyMaterial.title}
								className="w-32 h-32 object-cover rounded-lg shadow-md shrink-0"
							/>
						)}

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-2">
								<div className="p-2 bg-orange-100 rounded-lg">
									<BookOpen className="w-5 h-5 text-orange-600" />
								</div>
								<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
									Study Material
								</span>
							</div>
							<h1 className="text-4xl font-bold text-gray-900 mb-2 wrap-break-word">
								{studyMaterial.title}
							</h1>
						</div>
					</div>

					{/* Right side - Action buttons */}
					<div className="flex items-center gap-2 shrink-0">
						<Button
							className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
							asChild
						>
							<Link
								to="/preview/study-material/$id"
								params={{ id: studyMaterial.id.toString() }}
								className="flex items-center gap-2"
							>
								<Eye className="w-4 h-4" />
								Preview
							</Link>
						</Button>
						<Button
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
							asChild
						>
							<Link
								to="/study-materials/edit/$id"
								params={{ id: studyMaterial.id.toString() }}
								className="flex items-center gap-2"
							>
								<Pencil className="w-4 h-4" />
								Edit Material
							</Link>
						</Button>
					</div>
				</div>

				{/* Content section */}
				<div className="mt-6 pt-6 border-t border-gray-200">
					<div className="prose max-w-none">
						<div
							className="text-gray-700"
							dangerouslySetInnerHTML={{ __html: studyMaterial.content }}
						/>
					</div>

					<MetadataTable
						createdAt={studyMaterial.createdAt}
						updatedAt={studyMaterial.updatedAt}
					/>
				</div>
			</div>
		</div>
	);
}
