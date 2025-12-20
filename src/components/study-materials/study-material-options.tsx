import { getAllStudyMaterials } from "@/actions/study-material";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function StudyMaterialOptions() {
	const { data: materials } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.STUDY_MATERIALS],
		queryFn: () => getAllStudyMaterials(),
	});

	return (
		<>
			{materials.map((material) => (
				<option key={material.id} value={material.id}>
					{material.title}
				</option>
			))}
		</>
	);
}
