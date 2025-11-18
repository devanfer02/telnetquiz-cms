import { createFileRoute } from '@tanstack/react-router'
import ChapterList from './-sections/chapter-list'

export const Route = createFileRoute('/chapters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="my-5">
        <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
        <p className="text-muted-foreground">
          Daftar semua chapter tentang Media dan Jaringan Telekomunikasi.
        </p>
      </div>
      <ChapterList 
      />
    </>
  )
}
