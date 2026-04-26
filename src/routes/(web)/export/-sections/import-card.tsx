import {
	AlertTriangle,
	CheckCircle2,
	ExternalLink,
	FileDown,
	Loader2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { commitImportAction, previewImportAction } from "@/actions/import";
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

type PreviewResult = Awaited<ReturnType<typeof previewImportAction>>;
type ApplyResult = Awaited<ReturnType<typeof commitImportAction>>;
type Section = NonNullable<PreviewResult>["pretest"];

interface ImportCardProps {
	spreadsheetUrl: string;
}

const SECTION_LABELS: Record<"pretest" | "quiz" | "material", string> = {
	pretest: "Pretest",
	quiz: "Pertanyaan Quiz",
	material: "Materi Belajar",
};

const FIELD_LABELS: Record<string, string> = {
	description: "Deskripsi",
	question: "Pertanyaan",
	imageLink: "Link Gambar",
	options: "Pilihan Jawaban",
	title: "Judul",
	content: "Konten",
};

const totalUpdates = (preview: NonNullable<PreviewResult>): number =>
	preview.pretest.update.length +
	preview.quiz.update.length +
	preview.material.update.length;

function SectionSummary({
	label,
	section,
}: {
	label: string;
	section: Section;
}) {
	const hasIssues = section.invalid.length > 0 || section.notFound.length > 0;

	return (
		<div className="rounded-md border bg-background p-3 space-y-2">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span className="font-medium">{label}</span>
				<span className="text-emerald-700">{section.update.length} update</span>
				<span className="text-muted-foreground">
					{section.unchanged} tidak berubah
				</span>
				{section.invalid.length > 0 ? (
					<span className="text-amber-700">
						{section.invalid.length} invalid
					</span>
				) : null}
				{section.notFound.length > 0 ? (
					<span className="text-red-700">
						{section.notFound.length} ID tidak ada di DB
					</span>
				) : null}
			</div>

			{section.update.length > 0 ? (
				<details className="text-xs">
					<summary className="cursor-pointer text-emerald-700">
						Lihat detail perubahan
					</summary>
					<ul className="mt-1 space-y-1 text-muted-foreground">
						{section.update.map((entry) => (
							<li key={entry.id}>
								<span className="font-mono">#{entry.id}</span>{" "}
								<span className="text-foreground">
									{entry.changedFields
										.map((f) => FIELD_LABELS[f] ?? f)
										.join(", ")}
								</span>
							</li>
						))}
					</ul>
				</details>
			) : null}

			{hasIssues ? (
				<details className="text-xs">
					<summary className="cursor-pointer text-amber-700">
						Lihat masalah
					</summary>
					<ul className="mt-1 space-y-1 text-muted-foreground">
						{section.invalid.map((err) => (
							<li key={`invalid-${err.rowIdx}`}>
								<AlertTriangle
									size={12}
									className="inline mr-1 text-amber-600"
								/>
								Baris {err.rowIdx}
								{err.id !== null ? ` (#${err.id})` : ""}:{" "}
								{err.errors.join("; ")}
							</li>
						))}
						{section.notFound.map((nf) => (
							<li key={`notfound-${nf.rowIdx}`}>
								<XCircle size={12} className="inline mr-1 text-red-600" />
								Baris {nf.rowIdx}: ID #{nf.id} tidak ditemukan di DB
							</li>
						))}
					</ul>
				</details>
			) : null}
		</div>
	);
}

export default function ImportCard({ spreadsheetUrl }: ImportCardProps) {
	const [isPreviewing, setIsPreviewing] = useState(false);
	const [isApplying, setIsApplying] = useState(false);
	const [preview, setPreview] = useState<PreviewResult>(null);
	const [applyResult, setApplyResult] = useState<ApplyResult>(null);

	const handlePreview = async () => {
		setIsPreviewing(true);
		setApplyResult(null);
		const result = await previewImportAction();
		setIsPreviewing(false);
		setPreview(result);
		if (!result) {
			setFlashState({
				type: "error",
				message:
					"Gagal membaca spreadsheet. Periksa GOOGLE_SHEET_ID dan akses service account.",
			});
		}
	};

	const handleApply = async () => {
		setIsApplying(true);
		const result = await commitImportAction();
		setIsApplying(false);
		setApplyResult(result);
		setPreview(null);

		if (!result) {
			setFlashState({
				type: "error",
				message: "Gagal menerapkan import dari spreadsheet.",
			});
			return;
		}

		const total =
			result.applied.pretest + result.applied.quiz + result.applied.material;

		if (result.failed.length === 0) {
			setFlashState({
				type: "success",
				message: `Berhasil menerapkan ${total} perubahan dari spreadsheet.`,
			});
		} else {
			setFlashState({
				type: "error",
				message: `${total} perubahan diterapkan, ${result.failed.length} gagal.`,
			});
		}
	};

	const updateCount = preview ? totalUpdates(preview) : 0;

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileDown size={20} />
					Import dari Google Spreadsheet
				</CardTitle>
				<CardDescription>
					Pratinjau perubahan dari spreadsheet sebelum diterapkan ke database.
					Hanya baris dengan ID yang sudah ada di database yang akan diperbarui
					&mdash; baris baru atau yang dihapus dari sheet diabaikan.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap items-center gap-3">
					<Button
						type="button"
						onClick={handlePreview}
						disabled={isPreviewing || isApplying}
						variant="outline"
						className="cursor-pointer"
					>
						{isPreviewing ? (
							<>
								<Loader2 size={18} className="animate-spin" />
								Memuat preview...
							</>
						) : (
							<>
								<FileDown size={18} />
								Preview Import
							</>
						)}
					</Button>

					<Button asChild variant="outline" className="cursor-pointer">
						<a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer">
							<ExternalLink size={16} />
							Edit di Spreadsheet
						</a>
					</Button>
				</div>

				{preview ? (
					<div className="space-y-3">
						<SectionSummary
							label={SECTION_LABELS.pretest}
							section={preview.pretest}
						/>
						<SectionSummary
							label={SECTION_LABELS.quiz}
							section={preview.quiz}
						/>
						<SectionSummary
							label={SECTION_LABELS.material}
							section={preview.material}
						/>

						<div className="flex flex-wrap items-center gap-3 pt-2">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										type="button"
										disabled={updateCount === 0 || isApplying}
										className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
									>
										{isApplying ? (
											<>
												<Loader2 size={18} className="animate-spin" />
												Menerapkan...
											</>
										) : (
											<>
												<CheckCircle2 size={18} />
												Apply {updateCount} update
											</>
										)}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Terapkan perubahan ke database?
										</AlertDialogTitle>
										<AlertDialogDescription>
											{updateCount} baris akan diperbarui di database. Konten
											teks dari spreadsheet akan menimpa konten saat ini (format
											kaya seperti bold, list akan hilang dan diganti dengan
											paragraf sederhana).
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="cursor-pointer">
											Batal
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleApply}
											className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
										>
											Apply
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>

							<Button
								type="button"
								variant="ghost"
								onClick={() => setPreview(null)}
								className="cursor-pointer"
							>
								Batal
							</Button>
						</div>
					</div>
				) : null}

				{applyResult ? (
					<div className="rounded-lg border bg-muted/50 p-4 space-y-3">
						<div>
							<div className="text-sm font-medium">Hasil import terakhir</div>
							<div className="text-sm text-muted-foreground">
								Pretest: {applyResult.applied.pretest} · Quiz:{" "}
								{applyResult.applied.quiz} · Materi:{" "}
								{applyResult.applied.material}
							</div>
						</div>
						{applyResult.failed.length > 0 ? (
							<div className="text-sm">
								<div className="font-medium text-red-700">
									{applyResult.failed.length} baris gagal
								</div>
								<ul className="mt-1 space-y-1 text-xs text-muted-foreground">
									{applyResult.failed.map((f) => (
										<li key={`${f.entity}-${f.id}`}>
											{SECTION_LABELS[f.entity]} #{f.id}: {f.error}
										</li>
									))}
								</ul>
							</div>
						) : null}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
