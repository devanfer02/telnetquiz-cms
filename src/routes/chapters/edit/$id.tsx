import ChapterForm from '@/components/chapters/chapter-form';
import { ChapterValues } from '@/types/zod/chapter';
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chapters/edit/$id')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      mascotId: 0,
    } as ChapterValues,
    onSubmit: async ({ value }) => {
      console.log("submitted ", value);
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-telnet-primary font-black text-3xl">
          Tambah Chapter Baru
        </h1>
        <p className="text-muted-foreground">
          Isi form di bawah untuk menambahkan chapter baru.
        </p>
      </div>
      <ChapterForm form={form}/>
    </>
  );
}