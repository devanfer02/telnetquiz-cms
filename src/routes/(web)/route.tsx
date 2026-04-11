import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { Cat, SpeechBubble } from "react-kawaii";
import FlashContainer from "@/components/global/flash-banner";
import GlobalLoader from "@/components/global/global-loading";
import AppSidebar from "@/components/global/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { accounts } from "@/database/schema";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { AuthProvider } from "@/providers/auth";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (!session) return { authenticated: false } as const;

	const [account] = await db
		.select({ providerId: accounts.providerId })
		.from(accounts)
		.where(eq(accounts.userId, session.user.id))
		.limit(1);

	if (!account || account.providerId !== "google") {
		return { authenticated: false } as const;
	}

	return { authenticated: true } as const;
});

export const Route = createFileRoute("/(web)")({
	beforeLoad: async () => {
		const result = await checkAuth();
		if (!result.authenticated) {
			throw redirect({ to: "/auth/sign-in" });
		}
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
