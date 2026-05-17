import { cloneElement, isValidElement } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGreeting } from "@/hooks/use-greeting";

export default function DashboardHeader() {
	const { mounted, greeting, icon } = useGreeting();

	if (!mounted) {
		return (
			<div className="space-y-6 mb-8">
				<Skeleton className="w-full h-48 rounded-xl" />
				<Separator className="bg-border/60" />
			</div>
		);
	}

	return (
		<div className="space-y-6 mb-8">
			<div className="relative bg-linear-to-r from-orange-100/80 to-white border border-orange-100/50 rounded-xl p-4 md:p-8 overflow-hidden">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
					<div className="flex items-start gap-3 md:gap-5 max-w-2xl">
						<div className="p-3 bg-white shadow-sm rounded-xl border border-orange-100 ring-4 ring-orange-50 hidden sm:block">
							{isValidElement(icon) &&
								cloneElement(
									icon as React.ReactElement<Record<string, unknown>>,
									{
										className: "w-8 h-8 text-telnet-primary",
									},
								)}
						</div>
						<div className="space-y-2 min-w-0">
							<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
								{greeting}, ready to create?
							</h1>
							<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
								Welcome to <strong>TelNetQuiz Panel</strong>. Manage your quiz
								content, chapters, and monitor student performance all in one
								place.
							</p>
						</div>
					</div>
				</div>

				{/* Mascot Image */}
				<div className="absolute -right-4 -bottom-8 opacity-20 md:opacity-100 md:bottom-[-20px] md:right-10 pointer-events-none">
					<img
						src="/assets/mascot/chap1.png"
						alt="Mascot"
						className="w-28 h-28 md:w-40 md:h-40 object-contain transform -rotate-12"
					/>
				</div>
			</div>
			<Separator className="bg-border/60" />
		</div>
	);
}
