import { Link, createFileRoute } from '@tanstack/react-router'
import { mockChapters } from '@/data/mock-chapter'
import { mockQuizzesChapter } from '@/data/mock-quiz'
import QuizList from '../quiz/-sections/quiz-list'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export const Route = createFileRoute('/chapters/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const chapterId = parseInt(id, 10)
  const chapter = mockChapters.find(c => c.id === chapterId)
  const quizzes = mockQuizzesChapter[chapterId] || []

  if (!chapter) {
    return <div>Chapter not found</div>
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className='flex justify-between'>
          <h1 className="text-3xl font-bold text-telnet-primary">Chapter: {chapter.title}</h1>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link  to='/chapters/edit/$id' params={{id}} className='flex items-center justify-center'>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Chapter
            </Link>
          </Button>

        </div>

        <p className="text-lg mt-2 text-telnet-secondary">{chapter.description}</p>
      </div>
      <QuizList
        quizzes={quizzes}
        disableKey={["chapterId"]}
      />
    </div>
  )
}
