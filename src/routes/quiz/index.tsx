import { createFileRoute } from '@tanstack/react-router'
import QuizList from './-sections/quiz-list'
import { mockQuizzes } from '@/data/mock-quiz'

export const Route = createFileRoute('/quiz/')({
  loader: () => ({ data: mockQuizzes }),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <>
      <div className="mt-3 mb-5">
        <h1 className="text-3xl font-black text-telnet-primary tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">
          Daftar semua kuis tentang Media dan Jaringan Telekomunikasi.
        </p>
      </div>
      <QuizList
        quizzes={data}
      />
    </>
  )
}
