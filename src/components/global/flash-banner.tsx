import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { type Flash, useFlashStore } from "@/store/use-flash";

const flashStyles: Record<Flash["type"], string> = {
	error: "bg-red-50 text-red-800 border-red-300",
	success: "bg-green-50 text-green-800 border-green-300",
	info: "bg-blue-50 text-blue-800 border-blue-300",
};

interface FlashBannerProps {
	flash: Flash;
	clear: () => void;
	duration?: number;
}

function FlashBanner({ flash, clear, duration = 5000 }: FlashBannerProps) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const hideTimer = setTimeout(() => {
			setVisible(false);
		}, duration);

		const clearTimer = setTimeout(() => {
			clear();
		}, duration + 300);

		return () => {
			clearTimeout(hideTimer);
			clearTimeout(clearTimer);
		};
	}, [duration, clear]);

	return (
		<div
			role="alert"
			className={`relative flex justify-between items-start gap-3 rounded-md border px-4 py-3 shadow-sm transition-opacity duration-300 ease-out ${visible ? "opacity-100" : "opacity-0"} ${flashStyles[flash.type]}`}
		>
			<p className="text-sm leading-relaxed">{flash.message}</p>
			<div className="flex flex-col justify-center items-center">
				<button
					onClick={clear}
					aria-label="Dismiss"
					className="rounded p-1 text-current opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current cursor-pointer"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	);
}

export default function FlashContainer() {
	const { flash, clear } = useFlashStore();

	if (!flash) return null;

	return (
		<div className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 px-4">
			<FlashBanner flash={flash} clear={clear} />
		</div>
	);
}
