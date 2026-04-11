import { createFileRoute, useRouter } from "@tanstack/react-router";
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
	const router = useRouter();
	const { studyMaterial } = Route.useLoaderData();

	if (!studyMaterial) {
		return (
			<div className="flex flex-col items-center gap-4 py-16">
				<p className="text-muted-foreground">Materi tidak ditemukan.</p>
				<button
					type="button"
					onClick={() => router.history.back()}
					className="text-sm text-telnet-primary hover:underline"
				>
					Kembali ke Preview
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center gap-3 mb-6">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="p-2 rounded-lg hover:bg-muted transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
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
					imageLink={studyMaterial.imageLink}
				/>
			</div>
		</div>
	);
}
