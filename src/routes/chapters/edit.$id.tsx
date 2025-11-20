import ChapterForm from '@/components/chapters/chapter-form';
import { mockChapters } from '@/data/mock-chapter';
import { useCustomForm } from '@/hooks/use-custom-form';
import { ChapterValues } from '@/types/zod/chapter';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chapters/edit/$id')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { id } = Route.useParams()
  const chapterId = parseInt(id, 10)
  const chapter = mockChapters.find(c => c.id === chapterId)

  const form = useCustomForm({
    defaultValues: {
      id: chapter?.id,
      title: chapter?.title,
      description: chapter?.description,
      mascotId: chapter?.mascotId,
    } as ChapterValues,
    onSubmit: async ({ value }) => {
      console.log("submitted ", value);
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-telnet-primary font-black text-3xl">
          Edit Chapter { id }
        </h1>
        <p className="text-muted-foreground">
          Isi form di bawah untuk menambahkan chapter baru.
        </p>
      </div>
      <ChapterForm form={form} buttonText='Perbarui'/>
    </>
  );
}