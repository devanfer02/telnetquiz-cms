import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getSchoolById, updateSchool } from "@/actions/schools";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { SchoolFormData } from "@/types/zod";
import SchoolForm from "./-sections/school-form";

export const Route = createFileRoute("/(web)/schools/edit/$id")({
	loader: async ({ params }) => {
		const school = await getSchoolById({ data: Number(params.id) });

		if (school === null) {
			throw redirect({
				to: "/schools",
			});
		}

		return { school };
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { school } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			name: school?.name,
		} as SchoolFormData,
		onSubmit: async ({ value }) => {
			const result = await updateSchool({
				data: {
					id: school.id,
					school: value,
				},
			});

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to update school. See logs.",
				});
				navigate({ to: "/schools" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully updated school",
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
						Edit Sekolah {school?.name}
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk memperbarui sekolah.
					</p>
				</div>
			</div>
			<Separator />
			<SchoolForm form={form} buttonText="Perbarui" />
		</div>
	);
}
