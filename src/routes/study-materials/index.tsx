import { createFileRoute } from "@tanstack/react-router";
import StudyMaterialList from "./-sections/material-list";
import { getAllStudyMaterials } from "@/actions/study-material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";

export const Route = createFileRoute("/study-materials/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.STUDY_MATERIALS],
			queryFn: () => getAllStudyMaterials(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: studyMaterials } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.STUDY_MATERIALS],
		queryFn: () => getAllStudyMaterials(),
		staleTime: 60 * 1000,
	});

	return (
		<>
			<div className="mt-3 mb-5">
				<h1 className="text-3xl font-black text-telnet-primary tracking-tight">
					Study Materials
				</h1>
				<p className="text-muted-foreground">
					Daftar materi pelajaran tentang Media dan Jaringan Telekomunikasi
				</p>
			</div>
			<StudyMaterialList studyMaterials={studyMaterials} />
		</>
	);
}
