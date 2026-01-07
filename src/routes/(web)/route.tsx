import GlobalLoader from "@/components/global/global-loading";
import AppSidebar from "@/components/global/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import FlashContainer from "@/components/global/flash-banner";
import { oauthMiddleware } from "@/middlewares/oauth";

export const Route = createFileRoute("/(web)")({
	server: {
		middleware: [oauthMiddleware],
	},
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	return (
		<>
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
		</>
	);
}

function ErrorComponent({ error }: { error: Error }) {
	return (
		<div className="flex flex-col justify-center items-center min-h-screen">
			<p className="bg-red-500 text-white p-5 rounded-lg font-semibold">
				UwU somethin errur happenin. cek logs pls. said: {error.message}
			</p>
		</div>
	);
}
