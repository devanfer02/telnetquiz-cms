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
			<Card className="flex flex-row items-start gap-3 p-5 hover:border-telnet-primary/50 hover:shadow-md transition-all duration-200 group cursor-pointer h-full">
				<div className="p-2 rounded-lg bg-orange-50 text-telnet-primary group-hover:bg-telnet-primary group-hover:text-white transition-colors">
					<Icon className="size-10" />
				</div>
				<div className="flex flex-col gap-1 justify-center ">
					<p className="text-3xl font-bold tracking-tight text-foreground">
						{counter}
					</p>
					<h3 className="text-md font-medium text-muted-foreground group-hover:text-telnet-primary transition-colors">
						{title}
					</h3>
				</div>
			</Card>
		</Link>
	);
}
