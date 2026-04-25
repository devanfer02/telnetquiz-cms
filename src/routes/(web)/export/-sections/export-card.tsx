import { ExternalLink, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { exportContentAction } from "@/actions/export";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { setFlashState } from "@/store/use-flash";

type ExportResult = Awaited<ReturnType<typeof exportContentAction>>;

interface ExportCardProps {
	spreadsheetUrl: string;
}

export default function ExportCard({ spreadsheetUrl }: ExportCardProps) {
	const [isExporting, setIsExporting] = useState(false);
	const [lastResult, setLastResult] = useState<ExportResult>(null);

	const handleExport = async () => {
		setIsExporting(true);
		const result = await exportContentAction();
		setIsExporting(false);

		if (result) {
			setLastResult(result);
			setFlashState({
				type: "success",
				message: `Berhasil mengekspor konten (Pretest: ${result.counts.pretest}, Quiz: ${result.counts.quiz}, Materi: ${result.counts.studyMaterials}).`,
			});
		} else {
			setFlashState({
				type: "error",
				message:
					"Gagal mengekspor konten. Periksa konfigurasi GOOGLE_SHEET_ID dan akses service account.",
			});
		}
	};

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileSpreadsheet size={20} />
					Export ke Google Spreadsheet
				</CardTitle>
				<CardDescription>
					Konten akan dituliskan ke spreadsheet yang sudah dikonfigurasi (
					<code>GOOGLE_SHEET_ID</code>) dengan tiga tab:{" "}
					<span className="font-medium">Pretest</span>,{" "}
					<span className="font-medium">Quiz Questions</span>, dan{" "}
					<span className="font-medium">Study Materials</span>. Setiap export
					akan menimpa isi tab tersebut.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap items-center gap-3">
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								disabled={isExporting}
								className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
							>
								{isExporting ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										Mengekspor...
									</>
								) : (
									<>
										<FileSpreadsheet size={18} />
										Export to Sheets
									</>
								)}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Export ke Google Spreadsheet?
								</AlertDialogTitle>
								<AlertDialogDescription>
									Tindakan ini akan menimpa isi tab{" "}
									<span className="font-semibold">Pretest</span>,{" "}
									<span className="font-semibold">Quiz Questions</span>, dan{" "}
									<span className="font-semibold">Study Materials</span> pada
									spreadsheet yang dikonfigurasi. Pastikan service account
									memiliki akses Editor terhadap spreadsheet.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="cursor-pointer">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleExport}
									className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
								>
									Export
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<Button asChild variant="outline" className="cursor-pointer">
						<a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink size={16} />
							Lihat Spreadsheet
						</a>
					</Button>
				</div>

				{lastResult ? (
					<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
						<div>
							<div className="text-sm font-medium">Hasil export terakhir</div>
							<div className="text-sm text-muted-foreground">
								Pretest: {lastResult.counts.pretest} · Quiz:{" "}
								{lastResult.counts.quiz} · Materi:{" "}
								{lastResult.counts.studyMaterials}
							</div>
						</div>
						<Button
							asChild
							className="bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							<a
								href={lastResult.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLink size={16} />
								Buka Spreadsheet
							</a>
						</Button>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
