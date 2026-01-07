import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";
import { addChapter } from "@/actions/chapters";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(web)/chapters/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			title: "",
			description: "",
			mascotId: 1,
		} as ChapterFormData,
		onSubmit: async ({ value }) => {
			const result = await addChapter({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create chapter. See logs.",
				});

				navigate({ to: "/chapters" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new chapter",
			});

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAPTERS] });

			navigate({
				to: "/chapters/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/chapters">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Tambah Chapter Baru
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk menambahkan chapter baru.
					</p>
				</div>
			</div>
			<Separator />
			<ChapterForm form={form} buttonText="Tambah" />
		</div>
	);
}
