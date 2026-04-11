import { Volume2 } from "lucide-react";
import PhoneFrame from "./phone-frame";

interface StudyMaterialPreviewerProps {
	title: string;
	content: string;
}

export default function StudyMaterialPreviewer({
	title,
	content,
}: StudyMaterialPreviewerProps) {
	return (
		<PhoneFrame>
			<div className="flex flex-col h-full bg-[#E8862A]">
				{/* Header */}
				<div className="px-5 pt-4 pb-3 flex items-center justify-between">
					<h1 className="text-white font-bold text-lg leading-tight flex-1 text-center">
						{title}
					</h1>
					<button
						type="button"
						className="p-1.5 rounded-full bg-white/20 shrink-0 ml-2"
					>
						<Volume2 className="w-4 h-4 text-white" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-5 pb-4">
					<div className="bg-[#F5A623] rounded-2xl p-5">
						<div
							className="prose prose-sm max-w-none
								[&_h1]:text-gray-900 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2
								[&_h2]:text-gray-900 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2
								[&_h3]:text-gray-900 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-1.5
								[&_p]:text-gray-800 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3
								[&_ul]:text-gray-800 [&_ul]:text-sm [&_ul]:pl-5 [&_ul]:mb-3
								[&_ol]:text-gray-800 [&_ol]:text-sm [&_ol]:pl-5 [&_ol]:mb-3
								[&_li]:mb-1
								[&_strong]:text-gray-900
								[&_a]:text-blue-800 [&_a]:underline
								[&_img]:rounded-lg [&_img]:my-3
								text-gray-800"
							dangerouslySetInnerHTML={{ __html: content }}
						/>
					</div>
				</div>

				{/* Bottom button */}
				<div className="px-5 pb-4 pt-2">
					<div className="w-full py-3.5 rounded-2xl bg-[#2D2D2D] text-white font-bold text-sm text-center">
						Mulai Kuis
					</div>
				</div>
			</div>
		</PhoneFrame>
	);
}
