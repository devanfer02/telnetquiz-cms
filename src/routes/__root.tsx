import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "@/lib/devtools";
import { type QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
// @ts-ignore
import appCss from "../css/styles.css?url";
import { env } from "@/lib/env";

interface MyRouterContext {
	queryClient: QueryClient;
	user: User | null;
	session: Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "description",
				content: "TelNetQuiz content managament system platform.",
			},
			{ property: "og:title", content: "TelNetQuiz" },
			{
				property: "og:description",
				content: "TelNetQuiz mobile app content management system",
			},
			{ property: "og:image", content: `${env.VITE_APP_URL}/telnetquiz.webp` },
			{ property: "og:url", content: `${env.VITE_APP_URL}` },
			{ property: "twitter:title", content: "TelNetQuiz" },
			{
				property: "twitter:description",
				content: "TelNetQuiz mobile app content management system",
			},
			{
				property: "twitter:image",
				content: `${env.VITE_APP_URL}/telnetquiz.webp`,
			},
			{ property: "twitter:url", content: `${env.VITE_APP_URL}` },
			{
				title: "TelNetQuiz Panel",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),

	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage,
});

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="w-full">
				<Outlet />
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtools />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFoundPage() {
	return (
		<div className="flex flex-col justify-center align-center items-center min-h-screen">
			<h1 className="text-2xl text-center">404 | Page Not Found</h1>
		</div>
	);
}
