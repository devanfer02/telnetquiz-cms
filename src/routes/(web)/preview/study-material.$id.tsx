import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getStudyMaterialById } from "@/actions/study-material";
import StudyMaterialPreviewer from "@/components/preview/study-material-previewer";

export const Route = createFileRoute("/(web)/preview/study-material/$id")({
	loader: async ({ params }) => {
		const studyMaterial = await getStudyMaterialById({
			data: Number(params.id),
		});
		return { studyMaterial };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { studyMaterial } = Route.useLoaderData();

	if (!studyMaterial) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<p className="text-muted-foreground">Materi tidak ditemukan.</p>
				<Link
					to="/preview"
					className="text-sm text-telnet-primary hover:underline"
				>
					Kembali ke Preview
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-3 mb-6">
				<Link
					to="/preview"
					className="p-2 rounded-lg hover:bg-muted transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<div>
					<h1 className="text-2xl font-bold">{studyMaterial.title}</h1>
					<p className="text-sm text-muted-foreground">
						Preview materi pelajaran
					</p>
				</div>
			</div>

			<div className="flex justify-center">
				<StudyMaterialPreviewer
					title={studyMaterial.title}
					content={studyMaterial.content}
				/>
			</div>
		</div>
	);
}
