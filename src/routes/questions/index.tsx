import { createFileRoute } from '@tanstack/react-router'
import QuestionList from './-sections/question-list'
import { mockQuestions } from '@/data/mock-question'

export const Route = createFileRoute('/questions/')({
  loader: () => {
    const safe = mockQuestions.map(q => ({
      ...q,
      image: null,
    }))
    return { data: safe }
  },  
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <>
      <div className="mt-3 mb-5">
        <h1 className="text-3xl font-black text-telnet-primary tracking-tight">Questions</h1>
        <p className="text-muted-foreground">
          Daftar semua pertanyaan tentang Media dan Jaringan Telekomunikasi.
        </p>
      </div>
      <QuestionList
        questions={data}
      />
    </>
  )
}
