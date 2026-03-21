import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { addSchool } from "@/actions/schools";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { SchoolFormData } from "@/types/zod";
import SchoolForm from "./-sections/school-form";

export const Route = createFileRoute("/(web)/schools/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			name: "",
		} as SchoolFormData,
		onSubmit: async ({ value }) => {
			const result = await addSchool({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create school. See logs.",
				});
				navigate({ to: "/schools" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new school",
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.SCHOOLS],
			});

			navigate({ to: "/schools" });
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/schools">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Tambah Sekolah Baru
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk menambahkan sekolah baru.
					</p>
				</div>
			</div>
			<Separator />
			<SchoolForm form={form} buttonText="Tambah" />
		</div>
	);
}
