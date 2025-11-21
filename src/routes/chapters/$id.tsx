import { createFileRoute } from '@tanstack/react-router'
import { mockChapters } from '@/data/mock-chapter'
import { mockQuizzesChapter } from '@/data/mock-quiz'
import QuizList from '../quiz/-sections/quiz-list'

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
        <h1 className="text-3xl font-bold text-telnet-primary">Chapter: {chapter.title}</h1>
        <p className="text-lg mt-2 text-telnet-secondary">{chapter.description}</p>
      </div>
      <QuizList
        quizzes={quizzes}
      />
    </div>
  )
}
