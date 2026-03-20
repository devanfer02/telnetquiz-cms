import { useQueryClient } from "@tanstack/react-query";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	removeUser,
	resetUserProgressAction,
	updateUser,
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
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { EditUserFormData } from "@/types/zod";
import UserForm from "./user-form";
import UserSessions from "./user-sessions";

interface UserActionsProps {
	user: User;
}

export default function UserActions({ user }: UserActionsProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			fullname: user.name,
			email: user.email,
			password: "",
			gender: user.gender ?? undefined,
			grade: user.grade ?? "",
		} as EditUserFormData,
		onSubmit: async ({ value }) => {
			const result = await updateUser({
				data: {
					id: user.id,
					user: value,
				},
			});

			if (result) {
				setFlashState({
					type: "success",
					message: "User updated successfully",
				});
				setOpen(false);
				await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
			} else {
				setFlashState({
					type: "error",
					message: "Failed to update user",
				});
			}
		},
	});

	const handleResetProgress = async () => {
		const result = await resetUserProgressAction({ data: { id: user.id } });
		if (result) {
			setFlashState({
				type: "success",
				message: "User progress has been reset",
			});
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
		} else {
			setFlashState({
				type: "error",
				message: "Failed to reset user progress",
			});
		}
	};

	const handleDelete = async () => {
		const result = await removeUser({ data: { id: user.id } });
		if (result) {
			setFlashState({
				type: "success",
				message: "User deleted successfully",
			});
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
		} else {
			setFlashState({
				type: "error",
				message: "Failed to delete user",
			});
		}
	};

	return (
		<div className="flex gap-2">
			<UserSessions user={user} />

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button
						size="icon"
						className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
					>
						<Edit size={18} />
					</Button>
				</SheetTrigger>
				<SheetContent className="w-250 px-5">
					<SheetHeader>
						<SheetTitle>Edit User</SheetTitle>
						<SheetDescription>Update user details.</SheetDescription>
					</SheetHeader>
					<div className="">
						<UserForm form={form} buttonText="Perbaharui User" />
					</div>
				</SheetContent>
			</Sheet>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						size="icon"
						className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
						title="Reset Progress"
					>
						<RotateCcw size={18} />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset User Progress?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete all quiz submissions and pretest submissions for{" "}
							<span className="font-semibold">{user.name}</span>. Their scores,
							level completions, and achievements will be reset. This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleResetProgress}
							className="bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
						>
							Reset Progress
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						size="icon"
						className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
					>
						<Trash2 size={18} />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete this
							user with ID <span className="font-semibold">{user.id}</span>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="cursor-pointer">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
