import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAllStudyMaterials } from "@/actions/study-material";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
import StudyMaterialList from "./-sections/material-list";

export const Route = createFileRoute("/(web)/study-materials/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: studyMaterials } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.STUDY_MATERIALS],
		queryFn: () => getAllStudyMaterials(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Study Materials"
				description="Daftar semua materi pelajaran   tentang Media dan Jaringan Telekomunikasi."
			/>
			<StudyMaterialList studyMaterials={studyMaterials} />
		</div>
	);
}
