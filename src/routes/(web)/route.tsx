import GlobalLoader from "@/components/global/global-loading";
import AppSidebar from "@/components/global/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import FlashProvider from "@/providers/flash-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

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
						<FlashProvider />
						<Outlet />
					</main>
				</div>
			</SidebarProvider>
		</>
	);
}
