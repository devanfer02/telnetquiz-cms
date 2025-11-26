import { createFileRoute } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";

export const Route = createFileRoute("/chapters/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const form = useCustomForm({
		defaultValues: {
			title: "",
			description: "",
			mascotId: 1,
		} as ChapterFormData,
		onSubmit: async ({ value }) => {
			console.log("submitted ", value);
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Tambah Chapter Baru
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan chapter baru.
				</p>
			</div>
			<ChapterForm form={form} buttonText="Tambah" />
		</>
	);
}
