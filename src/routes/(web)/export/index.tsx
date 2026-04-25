import { createFileRoute } from "@tanstack/react-router";
import { getSpreadsheetUrl } from "@/actions/export";
import PageHeader from "@/components/global/page-header";
import ExportCard from "./-sections/export-card";

export const Route = createFileRoute("/(web)/export/")({
	loader: async () => {
		const { url } = await getSpreadsheetUrl();
		return { spreadsheetUrl: url };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { spreadsheetUrl } = Route.useLoaderData();

	return (
		<div>
			<PageHeader
				title="Export Content"
				description="Export pretest, soal kuis, dan materi pembelajaran ke Google Spreadsheet."
			/>
			<ExportCard spreadsheetUrl={spreadsheetUrl} />
		</div>
	);
}
