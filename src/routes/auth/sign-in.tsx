import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
export const Route = createFileRoute("/auth/sign-in")({
	component: SignInComponent,
	validateSearch: z.object({
		error: z.string().optional(),
	}),
});
function SignInComponent() {
	const search = useSearch({ from: "/auth/sign-in" });
	const [isLoading, setIsLoading] = useState(false);
	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard",
		});
	};
	return (
		<div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
			<style>
				{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
        `}
			</style>
			<div className="hidden bg-telnet-primary lg:flex flex-col items-center justify-center relative overflow-hidden">
				<div className="relative z-10 flex flex-col items-center p-10 text-white">
					<img
						src="/assets/mascot/chap1.png"
						alt="TelNetQuiz Mascot"
						className="max-w-105 w-full object-contain drop-shadow-2xl animate-float"
					/>
					<div className="mt-12 text-center space-y-4">
						<h2 className="text-4xl font-extrabold tracking-tight">
							Welcome Back!
						</h2>
						<p className="text-telnet-surface/90 text-lg max-w-md mx-auto leading-relaxed">
							Manage your quizzes, track student progress, and organize study
							materials all in one place.
						</p>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
				<Card className="w-full max-w-md shadow-2xl shadow-telnet-primary/20 border-none">
					<CardHeader className="space-y-4 text-center pb-2">
						<div className="flex justify-center">
							<div className="rounded-2xl bg-telnet-primary/10 p-4 shadow-inner">
								<img
									src="/telnetquiz.webp"
									alt="TelNetQuiz Logo"
									className="size-14 rounded-xl object-cover"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<div className="space-y-2"></div>
							<CardTitle className="text-3xl font-bold tracking-tight text-telnet-primary">
								Sign in to CMS
							</CardTitle>
							<CardDescription className="text-muted-foreground text-base">
								Authentication is required to access the admin panel.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<Button
							variant="outline"
							size="lg"
							className="w-full relative py-7 text-base font-semibold border-2 hover:border-telnet-primary/30 hover:bg-telnet-primary/5 transition-all duration-300 group cursor-pointer"
							onClick={handleGoogleSignIn}
							disabled={isLoading}
						>
							<div className="absolute left-6 flex items-center justify-center">
								{isLoading ? (
									<Loader2 className="size-6 animate-spin text-telnet-primary" />
								) : (
									<svg
										aria-hidden="true"
										className="size-6 transition-transform group-hover:scale-110"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
								)}
							</div>
							{isLoading ? "Signing in..." : "Continue with Google"}
						</Button>
						{search.error && (
							<div className="w-full text-center">
								<span className="text-red-500">
									{search.error.replaceAll("_", " ")}
								</span>
							</div>
						)}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<Separator />
							</div>
							<div className="relative flex justify-center text-xs uppercase"></div>
						</div>
						<div className="text-center text-sm text-muted-foreground py-2">
							<p className="max-w-100 mx-auto">
								By signing in, you agree to our{" "}
								<span className="underline underline-offset-4 hover:text-telnet-primary font-medium">
									Terms
								</span>{" "}
								and{" "}
								<span className="underline underline-offset-4 hover:text-telnet-primary font-medium">
									Privacy
								</span>
								.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
