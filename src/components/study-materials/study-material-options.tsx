import { getAllStudyMaterials } from "@/actions/study-material";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function StudyMaterialOptions() {
	const { data: materials } = useSuspenseQuery({
		queryKey: ["study-material-list"],
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
