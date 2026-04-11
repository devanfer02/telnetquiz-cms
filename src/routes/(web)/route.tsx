import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Cat, SpeechBubble } from "react-kawaii";
import FlashContainer from "@/components/global/flash-banner";
import GlobalLoader from "@/components/global/global-loading";
import AppSidebar from "@/components/global/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { oauthMiddleware } from "@/middlewares/auth";
import { AuthProvider } from "@/providers/auth";

export const Route = createFileRoute("/(web)")({
	server: {
		middleware: [oauthMiddleware],
	},
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	return (
		<AuthProvider>
			<SidebarProvider>
				<AppSidebar />
				<div className="relative flex-1">
					<GlobalLoader />

					<main className="px-6 mt-8 w-full">
						<FlashContainer />
						<Outlet />
					</main>
				</div>
			</SidebarProvider>
		</AuthProvider>
	);
}

function ErrorComponent({ error }: { error: Error }) {
	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-red-50">
			<div className="flex flex-col items-center gap-4 max-w-md text-center">
				<Cat size={160} mood="sad" color="#fca5a5" />
				<div className="bg-white border-2 border-red-300 rounded-2xl px-8 py-6 shadow-lg">
					<p className="text-red-400 text-3xl font-bold tracking-wide mb-1">
						UwU
					</p>
					<p className="text-red-500 font-semibold text-lg mb-3">
						somethin errur happenin ~
					</p>
					<p className="text-red-400 text-sm mb-4">cek logs pls nyaa~</p>
					<div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
						<p className="text-red-600 text-xs font-mono break-all">
							{error.message}
						</p>
					</div>
				</div>
				<SpeechBubble size={60} mood="sad" color="#fecaca" />
			</div>
		</div>
	);
}
