import { Separator } from "@/components/ui/separator";
import { flatSidebarItems } from "@/lib/constant";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	description: string;
	className?: string;
}

export default function PageHeader({
	title,
	description,
	className,
}: PageHeaderProps) {
	// Find the icon based on the title (fuzzy match or direct match)
	// Sidebar items: Dashboard, Chapters, Quiz, Study Materials, Questions, Submissions, Users
	const item = flatSidebarItems.find(
		(item) =>
			item.title.toLowerCase() === title.toLowerCase() ||
			(title === "Quizzes" && item.title === "Quiz"),
	);

	const Icon = item?.icon;

	return (
		<div className={cn("space-y-6 mb-8", className)}>
			<div className="bg-gradient-to-r from-orange-50/50 to-white border-b border-orange-100/50 rounded-xl p-4 md:p-8">
				<div className="flex items-start gap-3 md:gap-5">
					{Icon && (
						<div className="p-2 md:p-3 bg-white shadow-sm rounded-xl border border-orange-100 ring-4 ring-orange-50 shrink-0">
							<Icon
								className="w-6 h-6 md:w-8 md:h-8 text-telnet-primary"
								strokeWidth={1.5}
							/>
						</div>
					)}
					<div className="space-y-1.5 min-w-0">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
							{title}
						</h1>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
							{description}
						</p>
					</div>
				</div>
			</div>
			<Separator className="bg-border/60" />
		</div>
	);
}
