import { LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutDashboard() {
	return (
		<Card className="py-4 mt-5">
			<CardContent className="lg:flex">
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-3 w-4/5">
						<LayoutDashboard size={28} className="text-telnet-primary" />
						<h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
							TelNetQuiz Content Management System Dashboard
						</h1>
					</div>
					<p className="text-muted-foreground leading-relaxed max-w-3xl text-sm lg:text-md">
						Welcome to <strong>TelNetQuiz Panel</strong> — the central hub for
						managing all quiz content, chapters, and user submissions. Monitor
						user's activity, update materials, and ensure a seamless learning
						experience for vocational students.
					</p>
				</div>
				<div className="flex flex-col justify-center items-center lg:w-1/4 my-5 lg:my-0">
					<img src="/assets/mascot/chap1.png" className="max-w-[150px]" />
				</div>
			</CardContent>
		</Card>
	);
}
