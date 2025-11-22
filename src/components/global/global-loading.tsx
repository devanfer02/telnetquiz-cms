import { useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export default function GlobalLoader() {
	const { isLoading } = useRouterState();

	if (!isLoading) return null;

	return (
		<div
			className="
        absolute inset-0 z-50
        flex items-center justify-center
        bg-black/30 backdrop-blur-sm
      "
		>
			<div className="flex flex-col items-center gap-2 px-4 py-3 bg-white rounded-lg shadow-lg">
				<Loader2 className="h-5 w-5 animate-spin text-telnet-primary" />
				<span className="text-sm font-medium text-gray-700">Loading...</span>
			</div>
		</div>
	);
}
