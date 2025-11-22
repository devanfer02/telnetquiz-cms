import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

interface CardStatProps {
	icon: LucideIcon;
	title: string;
	target: string;
	counter: number;
}

export default function CardStat({
	icon: Icon,
	title,
	counter,
	target,
}: CardStatProps) {
	return (
		<Link to={target}>
			<Card className="flex items-center gap-4 p-4 hover:bg-telnet-primary duration-200 group cursor-pointer">
				<Icon className="size-6 text-telnet-primary group-hover:text-white" />
				<div className="text-center">
					<h3 className="text-xs lg:text-sm font-medium text-muted-foreground group-hover:text-white">
						{title}
					</h3>
					<p className="text-2xl font-semibold">{counter}</p>
				</div>
			</Card>
		</Link>
	);
}
