import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { getAllSchools } from "@/actions/schools";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
import SchoolList from "./-sections/school-list";

export const Route = createFileRoute("/(web)/schools/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.SCHOOLS],
			queryFn: () => getAllSchools(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: schools } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.SCHOOLS],
		queryFn: () => getAllSchools(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Schools"
				description="Daftar semua sekolah yang terdaftar."
			/>
			<Suspense fallback={<div>Loading schools...</div>}>
				<SchoolList schools={schools} />
			</Suspense>
		</div>
	);
}
