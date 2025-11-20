import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
} from '@tanstack/react-table'
import TanstackTable from '@/components/global/ts-table'
import { mockChapters } from '@/data/mock-chapter'
import { mockQuizzesChapter } from '@/data/mock-quiz'

export const Route = createFileRoute('/chapters/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const chapterId = parseInt(id, 10)
  const chapter = mockChapters.find(c => c.id === chapterId)
  const quizzes = mockQuizzesChapter[chapterId] || []

  const columns = useMemo<ColumnDef<Quiz>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'difficulty',
        header: 'Difficulty',
      },
      {
        accessorKey: 'numberOfQuestions',
        header: 'Questions',
      },
    ],
    []
  )

  const table = useReactTable({
    data: quizzes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  } as any)

  if (!chapter) {
    return <div>Chapter not found</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-telnet-primary">{chapter.title}</h1>
      <p className="text-lg mt-2 text-telnet-secondary">{chapter.description}</p>
      <TanstackTable
        table={table}
        columns={columns}
        title="Quizzes"
        fallbackMessage="No quizzes found for this chapter."
      />
    </div>
  )
}
