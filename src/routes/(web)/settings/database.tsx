import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Database as DatabaseIcon,
	FlaskConical,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { getCurrentDbMode, switchDbMode } from "@/actions/db-mode";
import PageHeader from "@/components/global/page-header";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";

type DbMode = "production" | "testing";

export const Route = createFileRoute("/(web)/settings/database")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.DB_MODE],
			queryFn: () => getCurrentDbMode(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const { data } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.DB_MODE],
		queryFn: () => getCurrentDbMode(),
	});

	const [isSwitching, setIsSwitching] = useState(false);
	const currentMode: DbMode = data.mode;
	const targetMode: DbMode =
		currentMode === "production" ? "testing" : "production";

	const handleSwitch = async () => {
		setIsSwitching(true);
		try {
			const result = await switchDbMode({ data: { mode: targetMode } });
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DB_MODE] });
			await queryClient.invalidateQueries();
			setFlashState({
				type: "success",
				message: `Database switched to ${result.mode.toUpperCase()}`,
			});
		} catch (err) {
			console.error("Failed to switch DB mode:", err);
			setFlashState({
				type: "error",
				message: "Failed to switch database",
			});
		} finally {
			setIsSwitching(false);
		}
	};

	const isProd = currentMode === "production";

	return (
		<div>
			<PageHeader
				title="Database"
				description="Pilih database mana yang sedang digunakan oleh CMS. Perubahan berlaku global untuk seluruh proses server."
			/>

			<Card className="max-w-2xl">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<DatabaseIcon className="size-5 text-orange-500" />
							<CardTitle>Active Database</CardTitle>
						</div>
						<Badge
							className={
								isProd
									? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
									: "bg-amber-100 text-amber-700 hover:bg-amber-100"
							}
						>
							{isProd ? (
								<span className="flex items-center gap-1">
									<ShieldCheck className="size-3" /> PRODUCTION
								</span>
							) : (
								<span className="flex items-center gap-1">
									<FlaskConical className="size-3" /> TESTING
								</span>
							)}
						</Badge>
					</div>
					<CardDescription>
						Saat ini koneksi diarahkan ke{" "}
						<span className="font-semibold">
							{isProd ? "SUPABASE_DB_URL" : "SUPABASE_DB_TESTING_URL"}
						</span>
						.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4 text-sm text-amber-800">
						<p className="font-semibold mb-1">Peringatan</p>
						<p>
							Switch ini bersifat <span className="font-semibold">global</span>{" "}
							dan memengaruhi seluruh admin yang login. Setelah switch, cache
							React Query akan di-invalidate; refresh halaman lain untuk memuat
							data terbaru.
						</p>
					</div>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								type="button"
								disabled={isSwitching}
								className={
									targetMode === "testing"
										? "bg-amber-600 hover:bg-amber-700 text-white"
										: "bg-emerald-600 hover:bg-emerald-700 text-white"
								}
							>
								{isSwitching
									? "Switching..."
									: `Switch to ${targetMode.toUpperCase()}`}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Switch database ke {targetMode.toUpperCase()}?
								</AlertDialogTitle>
								<AlertDialogDescription>
									Semua admin yang sedang login akan melihat data dari database{" "}
									<span className="font-semibold">{targetMode}</span>. Pastikan
									Anda mengerti konsekuensinya sebelum melanjutkan.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Batal</AlertDialogCancel>
								<AlertDialogAction onClick={handleSwitch}>
									Ya, switch sekarang
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</div>
	);
}
