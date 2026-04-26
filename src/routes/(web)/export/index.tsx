import { createFileRoute } from "@tanstack/react-router";
import { getSpreadsheetUrl } from "@/actions/export";
import PageHeader from "@/components/global/page-header";
import ExportCard from "./-sections/export-card";
import ImportCard from "./-sections/import-card";

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
		<div className="space-y-6">
			<PageHeader
				title="Export & Import Content"
				description="Export pretest, soal kuis, dan materi pembelajaran ke Google Spreadsheet, atau import perubahan kembali ke database."
			/>
			<ExportCard spreadsheetUrl={spreadsheetUrl} />
			<ImportCard spreadsheetUrl={spreadsheetUrl} />
		</div>
	);
}
