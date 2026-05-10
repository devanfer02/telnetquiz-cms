import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "@/lib/devtools";
import { env } from "@/lib/env";
// @ts-expect-error
import appCss from "../css/styles.css?url";

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
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "description",
				content:
					"Media pembelajaran interaktif berbasis kuis untuk mata pelajaran Media dan Jaringan Telekomunikasi bagi siswa SMK jurusan Teknik Komputer dan Jaringan.",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:title",
				content: "TelNetQuiz — Media Pembelajaran Interaktif",
			},
			{
				property: "og:description",
				content:
					"Aplikasi kuis interaktif untuk mata pelajaran Media dan Jaringan Telekomunikasi bagi siswa SMK jurusan Teknik Komputer dan Jaringan.",
			},
			{ property: "og:image", content: `${env.VITE_APP_URL}/telnetquiz.webp` },
			{ property: "og:url", content: `${env.VITE_APP_URL}` },
			{ property: "og:site_name", content: "TelNetQuiz" },
			{ name: "twitter:card", content: "summary" },
			{
				name: "twitter:title",
				content: "TelNetQuiz — Media Pembelajaran Interaktif",
			},
			{
				name: "twitter:description",
				content:
					"Aplikasi kuis interaktif untuk mata pelajaran Media dan Jaringan Telekomunikasi bagi siswa SMK jurusan Teknik Komputer dan Jaringan.",
			},
			{
				name: "twitter:image",
				content: `${env.VITE_APP_URL}/telnetquiz.webp`,
			},
			{
				title: "TelNetQuiz",
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
