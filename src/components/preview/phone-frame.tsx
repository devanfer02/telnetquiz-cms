import { Battery, Signal, Wifi } from "lucide-react";
import type { ReactNode } from "react";

interface PhoneFrameProps {
	children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
	return (
		<div className="relative mx-auto w-[375px] h-[780px] rounded-[2.5rem] border-4 border-gray-800 bg-white shadow-2xl overflow-hidden flex flex-col">
			{/* Notch */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-800 rounded-b-2xl z-20" />

			{/* Status bar */}
			<div className="flex items-center justify-between px-8 pt-2 pb-1 text-[10px] text-gray-600 bg-white z-10">
				<span className="font-medium">9:41</span>
				<div className="flex items-center gap-1">
					<Signal className="w-3 h-3" />
					<Wifi className="w-3 h-3" />
					<Battery className="w-3 h-3" />
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>

			{/* Home indicator */}
			<div className="flex justify-center py-2 bg-white">
				<div className="w-32 h-1 rounded-full bg-gray-300" />
			</div>
		</div>
	);
}
