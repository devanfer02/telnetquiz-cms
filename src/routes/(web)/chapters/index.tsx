import { createFileRoute } from "@tanstack/react-router";
import ChapterList from "./-sections/chapter-list";
import { getAllChapters } from "@/actions/chapters";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { QUERY_KEYS } from "@/lib/constant";
import PageHeader from "@/components/global/page-header";

export const Route = createFileRoute("/(web)/chapters/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.CHAPTERS],
			queryFn: () => getAllChapters(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: chapters } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.CHAPTERS],
		queryFn: () => getAllChapters(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Chapters"
				description="Daftar semua chapter tentang Media dan Jaringan Telekomunikasi."
			/>
			<Suspense fallback={<div>Loading chapters...</div>}>
				<ChapterList chapters={chapters} />
			</Suspense>
		</div>
	);
}
