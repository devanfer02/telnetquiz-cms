import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSchoolById, updateSchool } from "@/actions/schools";
import FormPageLayout from "@/components/global/form-page-layout";
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
		<FormPageLayout
			title={`Edit Sekolah ${school?.name}`}
			description="Isi form di bawah untuk memperbarui sekolah."
		>
			<SchoolForm form={form} buttonText="Perbarui" />
		</FormPageLayout>
	);
}
