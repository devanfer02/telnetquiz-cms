import { Link } from "@tanstack/react-router";
import { Pencil, BookOpen } from "lucide-react";
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

					{/* Right side - Action button */}
					<Button
						className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0"
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

				{/* Content section */}
				<div className="mt-6 pt-6 border-t border-gray-200">
					<div className="prose max-w-none">
						<p className="text-gray-700 whitespace-pre-wrap">
							{studyMaterial.content}
						</p>
					</div>

					{/* Metadata table */}
					<table className="mt-6 w-full border-collapse">
						<tbody>
							{studyMaterial.createdAt && (
								<tr className="border-b border-gray-200">
									<td className="py-3 pr-4 text-sm font-medium text-gray-500 w-32">
										Created At:
									</td>
									<td className="py-3 text-sm text-gray-900">
										{new Date(studyMaterial.createdAt).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</td>
								</tr>
							)}
							{studyMaterial.updatedAt && (
								<tr className="border-b border-gray-200">
									<td className="py-3 pr-4 text-sm font-medium text-gray-500 w-32">
										Updated At:
									</td>
									<td className="py-3 text-sm text-gray-900">
										{new Date(studyMaterial.updatedAt).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
