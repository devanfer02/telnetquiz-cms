import { createFileRoute } from "@tanstack/react-router";
import { getStudyMaterialById } from "@/actions/study-material";
import NotFound from "@/components/global/not-found";
import QuestionList from "../questions/-sections/question-list";
import MaterialHeader from "./-sections/material-header";

export const Route = createFileRoute("/(web)/study-materials/$id")({
	loader: async ({ params }) => {
		const studyMaterial = await getStudyMaterialById({
			data: Number(params.id),
		});

		return {
			studyMaterial,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { studyMaterial } = Route.useLoaderData();

	if (!studyMaterial) {
		return <NotFound message="Study Material not found" />;
	}

	return (
		<div className="p-4">
			<div className="mb-3">
				<MaterialHeader studyMaterial={studyMaterial} />
			</div>
			<div className="mt-8">
				<QuestionList
					questions={studyMaterial.questions}
					disableKey={["materialId"] as any}
				/>
			</div>
		</div>
	);
}
