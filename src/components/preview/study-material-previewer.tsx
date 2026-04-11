import { Volume2 } from "lucide-react";
import PhoneFrame from "./phone-frame";

interface StudyMaterialPreviewerProps {
	title: string;
	content: string;
	imageLink?: string | null;
}

export default function StudyMaterialPreviewer({
	title,
	content,
	imageLink,
}: StudyMaterialPreviewerProps) {
	return (
		<PhoneFrame>
			<div className="flex flex-col h-full bg-[#F37704]">
				{/* Scrollable content area */}
				<div className="flex-1 overflow-y-auto">
					<div className="px-5 pt-4 pb-3 flex items-center gap-3">
						<h1 className="text-white font-bold text-xl leading-tight flex-1 text-center font-[Nunito]">
							{title}
						</h1>
						<button
							type="button"
							className="p-2 rounded-full bg-white/20 shrink-0"
						>
							<Volume2 className="w-5 h-5 text-white" />
						</button>
					</div>

					{imageLink && (
						<div className="flex justify-center px-5 pb-3">
							<img
								src={imageLink}
								alt={title}
								className="max-h-[200px] rounded-xl object-contain"
							/>
						</div>
					)}

					{/* Content card */}
					<div className="px-4 pb-4">
						<div className="bg-[#F9BD85] rounded-[20px] p-5">
							<div
								className="prose prose-sm max-w-none
									[&_h1]:text-[#662500] [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3
									[&_h2]:text-[#662500] [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3
									[&_h3]:text-[#662500] [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1.5 [&_h3]:mt-2
									[&_p]:text-[#3D1A00] [&_p]:text-[13px] [&_p]:leading-relaxed [&_p]:mb-2.5
									[&_ul]:text-[#3D1A00] [&_ul]:text-[13px] [&_ul]:pl-5 [&_ul]:mb-2.5
									[&_ol]:text-[#3D1A00] [&_ol]:text-[13px] [&_ol]:pl-5 [&_ol]:mb-2.5
									[&_li]:mb-1 [&_li]:leading-relaxed
									[&_strong]:text-[#662500]
									[&_a]:text-[#8B340D] [&_a]:underline
									[&_img]:rounded-lg [&_img]:my-3
									text-[#3D1A00]"
								dangerouslySetInnerHTML={{ __html: content }}
							/>
						</div>
					</div>
				</div>

				{/* Bottom button */}
				<div className="px-5 pb-5 pt-2">
					<div className="w-full py-3.5 rounded-2xl bg-[#8B340D] text-[#FFDAB7] font-bold text-base text-center">
						Mulai Kuis
					</div>
				</div>
			</div>
		</PhoneFrame>
	);
}
