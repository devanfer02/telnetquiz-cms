import { createFileRoute } from "@tanstack/react-router";
import QuizForm from "@/components/quiz/quiz-form";
import { QuizValues } from "@/types/zod/quiz";
import { useCustomForm } from "@/hooks/use-custom-form";

export const Route = createFileRoute("/quiz/add")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const form = useCustomForm({
    defaultValues: {
      title: "",
      difficulty: "easy",
      numberOfQuestions: 1,
      chapterId: 0,
    } as QuizValues,
    onSubmit: async ({ value }) => {
      console.log("submitted ", value);
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-telnet-primary font-black text-3xl">
          Tambah Kuis Baru
        </h1>
        <p className="text-muted-foreground">
          Isi form di bawah untuk menambahkan kuis baru.
        </p>
      </div>
      <QuizForm form={form} buttonText="Tambah"/>
    </>
  );
}
