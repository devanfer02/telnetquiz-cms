import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { sidebarItems } from "@/lib/constant";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";

const isActive = (currentPath: string, itemUrl: string) => {
	return currentPath === itemUrl || currentPath.startsWith(itemUrl + "/");
};

export default function AppSidebar() {
	const routerState = useRouterState();

	const currentPath = routerState.location.pathname;

	return (
		<Sidebar>
			<SidebarHeader className="bg-telnet-primary">
				<SidebarGroupLabel className="text-xl text-white font-bold mt-5">
					TelNetQuiz CMS
				</SidebarGroupLabel>
			</SidebarHeader>
			<SidebarContent className="bg-telnet-primary text-white font-bold">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.title} className="py-1">
									<SidebarMenuButton
										asChild
										className={`py-5 hover:text-telnet-dark-brown duration-200 ${isActive(currentPath, item.url) ? "bg-white text-telnet-primary" : "bg-telnet-primary text-white"}`}
									>
										<Link to={item.url}>
											<item.icon className="size-5!" />
											<span className="text-md">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="bg-telnet-primary">
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<div className="flex flex-row gap-x-5 mb-4 cursor-pointer text-white">
							<LogOut className="size-5!" />
							<span className="text-lg font-semibold">Logout</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarFooter>
		</Sidebar>
	);
}
