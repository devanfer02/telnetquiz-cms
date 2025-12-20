import { createFileRoute } from "@tanstack/react-router";
import StudyMaterialList from "./-sections/material-list";
import { getAllStudyMaterials } from "@/actions/study-material";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/study-materials/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: ["study-material-list"],
			queryFn: () => getAllStudyMaterials(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: studyMaterials } = useSuspenseQuery({
		queryKey: ["study-material-list"],
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
