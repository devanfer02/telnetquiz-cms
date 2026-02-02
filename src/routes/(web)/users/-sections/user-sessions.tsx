import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Key, LogOut, Monitor, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	deleteAllUserSessions,
	deleteSession,
	getUserSessions,
} from "@/actions/users";
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
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";

interface UserSessionsProps {
	user: User;
}

function parseUserAgent(userAgent: string | null): {
	device: string;
	browser: string;
} {
	if (!userAgent) return { device: "Unknown", browser: "Unknown" };

	const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
	const device = isMobile ? "Mobile" : "Desktop";

	let browser = "Unknown";
	if (userAgent.includes("Firefox")) browser = "Firefox";
	else if (userAgent.includes("Edg")) browser = "Edge";
	else if (userAgent.includes("Chrome")) browser = "Chrome";
	else if (userAgent.includes("Safari")) browser = "Safari";
	else if (userAgent.includes("Opera")) browser = "Opera";

	return { device, browser };
}

export default function UserSessions({ user }: UserSessionsProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: sessions, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.USER_SESSIONS, user.id],
		queryFn: () => getUserSessions({ data: { id: user.id } }),
		enabled: open,
	});

	const handleRevokeSession = async (sessionId: string) => {
		const result = await deleteSession({ data: { id: sessionId } });
		if (result) {
			setFlashState({
				type: "success",
				message: "Session revoked successfully",
			});
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.USER_SESSIONS, user.id],
			});
		} else {
			setFlashState({
				type: "error",
				message: "Failed to revoke session",
			});
		}
	};

	const handleRevokeAllSessions = async () => {
		const result = await deleteAllUserSessions({ data: { id: user.id } });
		if (result) {
			setFlashState({
				type: "success",
				message: "All sessions revoked successfully",
			});
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.USER_SESSIONS, user.id],
			});
		} else {
			setFlashState({
				type: "error",
				message: "Failed to revoke all sessions",
			});
		}
	};

	const isExpired = (expiresAt: Date) => new Date(expiresAt) < new Date();

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					size="icon"
					className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
					title="View Sessions"
				>
					<Key size={18} />
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[400px] sm:w-[540px] px-5">
				<SheetHeader>
					<SheetTitle>User Sessions</SheetTitle>
					<SheetDescription>
						Active sessions for {user.name} ({user.email})
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-4">
					{sessions && sessions.length > 0 && (
						<div className="flex justify-end">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										size="sm"
										className="cursor-pointer"
									>
										<LogOut size={16} className="mr-2" />
										Revoke All Sessions
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
										<AlertDialogDescription>
											This will log out the user from all devices. They will
											need to log in again.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="cursor-pointer">
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={handleRevokeAllSessions}
											className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
										>
											Revoke All
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					)}

					{isLoading && (
						<div className="text-center py-8 text-muted-foreground">
							Loading sessions...
						</div>
					)}

					{!isLoading && (!sessions || sessions.length === 0) && (
						<div className="text-center py-8 text-muted-foreground">
							No active sessions found
						</div>
					)}

					{sessions?.map((session) => {
						const { device, browser } = parseUserAgent(session.userAgent);
						const expired = isExpired(session.expiresAt);

						return (
							<div key={session.id} className="border rounded-lg p-4 space-y-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										{device === "Mobile" ? (
											<Smartphone size={20} className="text-muted-foreground" />
										) : (
											<Monitor size={20} className="text-muted-foreground" />
										)}
										<div>
											<p className="font-medium text-sm">
												{browser} on {device}
											</p>
											<p className="text-xs text-muted-foreground">
												{session.ipAddress || "Unknown IP"}
											</p>
										</div>
									</div>
									<Badge variant={expired ? "destructive" : "secondary"}>
										{expired ? "Expired" : "Active"}
									</Badge>
								</div>

								<div className="text-xs text-muted-foreground space-y-1">
									<p>
										Created:{" "}
										{formatDistanceToNow(new Date(session.createdAt), {
											addSuffix: true,
										})}
									</p>
									<p>
										Expires:{" "}
										{formatDistanceToNow(new Date(session.expiresAt), {
											addSuffix: true,
										})}
									</p>
								</div>

								<div className="flex justify-end">
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												size="sm"
												variant="outline"
												className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
											>
												<Trash2 size={14} className="mr-1" />
												Revoke
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Revoke this session?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This will log out the user from this device. The
													session ID is{" "}
													<span className="font-mono text-xs">
														{session.id.slice(0, 8)}...
													</span>
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="cursor-pointer">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleRevokeSession(session.id)}
													className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
												>
													Revoke
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						);
					})}
				</div>
			</SheetContent>
		</Sheet>
	);
}
