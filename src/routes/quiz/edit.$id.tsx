import QuizForm from '@/components/quiz/quiz-form';
import { mockQuizzes } from '@/data/mock-quiz';
import { useCustomForm } from '@/hooks/use-custom-form';
import { QuizValues } from '@/types/zod/quiz';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/edit/$id')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { id } = Route.useParams()
  const quizId = parseInt(id, 10)
  const quiz = mockQuizzes.find(c => c.id === quizId)

  const form = useCustomForm({
    defaultValues: {
      id: quiz?.id,
      title: quiz?.title,
      difficulty: quiz?.difficulty,
      numberOfQuestions: quiz?.numberOfQuestions,
      chapterId: quiz?.chapterId,
    } as QuizValues,
    onSubmit: async ({ value }) => {
      console.log("submitted ", value);
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-telnet-primary font-black text-3xl">
          Edit Kuis { quiz?.title }
        </h1>
        <p className="text-muted-foreground">
          Isi form di bawah untuk memperbarui kuis.
        </p>
      </div>
      <QuizForm form={form} buttonText='Perbarui'/>
    </>
  );
}
