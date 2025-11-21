import { Link, createFileRoute } from '@tanstack/react-router'
import { mockQuizzes } from '@/data/mock-quiz'
import { mockQuestionsQuiz } from '@/data/mock-question'
import QuestionList from '../questions/-sections/question-list'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export const Route = createFileRoute('/quiz/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const quizId = parseInt(id, 10)
  const quiz = mockQuizzes.find(q => q.id === quizId)
  const questions = mockQuestionsQuiz[quizId] || []

  if (!quiz) {
    return <div>Quiz not found</div>
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <div className='flex justify-between'>
          <h1 className="text-3xl font-bold text-telnet-primary">Quiz: {quiz.title}</h1>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link to='/quiz/edit/$id' params={{id}} className='flex items-center justify-center'>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Quiz
            </Link>
          </Button>
        </div>
        <p className="text-lg mt-2 text-telnet-secondary capitalize">Difficulty: {quiz.difficulty}</p>
      </div>
      <QuestionList
        questions={questions}
        disableKey={["quizId"]}
      />
    </div>
  )
}
