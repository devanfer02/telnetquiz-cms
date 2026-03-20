import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { sidebarItems } from "@/lib/constant";
import { useAuth } from "@/providers/auth";
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
	return currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`);
};

export default function AppSidebar() {
	const { session, isPending } = useAuth();
	const routerState = useRouterState();
	const navigate = useNavigate();

	const currentPath = routerState.location.pathname;

	const logout = async () => {
		await authClient.signOut();
		navigate({
			to: "/auth/sign-in",
		});
	};

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
						<SidebarMenu className="gap-2">
							{sidebarItems.map((item) => {
								const active = isActive(currentPath, item.url);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={active}
											className={`
                        h-12 w-full transition-all duration-200 ease-in-out rounded-xl px-4
                        ${
													active
														? "bg-white text-telnet-primary shadow-md font-bold translate-x-1"
														: "text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
												}
                      `}
										>
											<Link to={item.url} className="flex items-center gap-3">
												<item.icon
													className={`transition-all duration-200 ${active ? "size-5" : "size-5 opacity-80 group-hover:opacity-100"}`}
												/>
												<span className="text-base font-medium">
													{item.title}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="bg-telnet-primary pb-6 px-4">
				<SidebarMenu>
					{isPending ? (
						<SidebarMenuItem>
							<div className="flex items-center gap-3 px-2 py-3 mb-2">
								<Skeleton className="h-10 w-10 shrink-0 rounded-full bg-white/20" />
								<div className="flex flex-col gap-2 flex-1 min-w-0">
									<Skeleton className="h-4 w-20 bg-white/20 rounded" />
									<Skeleton className="h-3 w-32 bg-white/20 rounded" />
								</div>
							</div>
						</SidebarMenuItem>
					) : (
						<SidebarMenuItem>
							<div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl">
								<img
									src={session?.user.image ?? "/avatar-placeholder.png"}
									alt={session?.user.name ?? "User"}
									className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/20"
								/>
								<div className="flex flex-col min-w-0">
									<span className="text-sm font-bold text-white truncate">
										Hi, {session?.user.name ?? "Admin"}!
									</span>
									<span
										className="text-xs text-white/70 truncate"
										title={session?.user.email}
									>
										{session?.user.email}
									</span>
								</div>
							</div>
						</SidebarMenuItem>
					)}

					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => logout()}
							className="h-12 w-full text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1 transition-all duration-200 ease-in-out rounded-xl px-4 gap-3 justify-start cursor-pointer"
						>
							<LogOut className="size-5 opacity-80 group-hover:opacity-100" />
							<span className="text-base font-medium">Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
