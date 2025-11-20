import { createFileRoute } from '@tanstack/react-router'
import ChapterList from './-sections/chapter-list'
import { mockChapters } from '@/data/mock-chapter'

export const Route = createFileRoute('/chapters')({
  loader: () => ({data: mockChapters}),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <>
      <div className="mt-3 mb-5">
        <h1 className="text-3xl font-black text-telnet-primary tracking-tight">Chapters</h1>
        <p className="text-muted-foreground">
          Daftar semua chapter tentang Media dan Jaringan Telekomunikasi.
        </p>
      </div>
      <ChapterList
        chapters={data}
      />
    </>
  )
}
