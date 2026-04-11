import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FormPageLayoutProps {
	title: string;
	description: string;
	children: ReactNode;
}

export default function FormPageLayout({
	title,
	description,
	children,
}: FormPageLayoutProps) {
	const router = useRouter();

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.history.back()}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
			</div>
			<Separator />
			{children}
		</div>
	);
}
