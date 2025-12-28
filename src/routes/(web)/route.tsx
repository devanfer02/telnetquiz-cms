import GlobalLoader from "@/components/global/global-loading";
import AppSidebar from "@/components/global/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import FlashContainer from "@/components/global/flash-banner";

export const Route = createFileRoute("/(web)")({
	component: RouteComponent,
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
