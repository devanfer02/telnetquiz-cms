import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addSchool } from "@/actions/schools";
import FormPageLayout from "@/components/global/form-page-layout";
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
		<FormPageLayout
			backTo="/schools"
			title="Tambah Sekolah Baru"
			description="Isi form di bawah untuk menambahkan sekolah baru."
		>
			<SchoolForm form={form} buttonText="Tambah" />
		</FormPageLayout>
	);
}
