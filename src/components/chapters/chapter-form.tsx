import type { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChapterSchema, ChapterValues } from "@/types/zod/chapter";

const MASCOTS = [1, 2, 3, 4];

interface ChapterFormProps {
  form: ReturnType<typeof useForm<ChapterValues, any, any, any, any, any, any, any, any, any, any, any>>
}

export default function ChapterForm({form}: ChapterFormProps) {

  return (
    <Card className="p-8 shadow-md border border-telnet-surface-darker">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="title"
        validators={{
          onChange: (value) => {
            const result = ChapterSchema.shape.title.safeParse(value.value);
            return result.success 
              ? undefined 
              : result.error.issues[0].message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-telnet-primary font-semibold text-lg"
            >
              Judul
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-telnet-surface-darker"
            />
            {field.state.meta.errors && (
              <p className="text-red-600 text-sm">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      </form.Field>
      <form.Field
        name="description"
        validators={{
          onChange: (value) => {
            const result = ChapterSchema.shape.description.safeParse(value.value);
            return result.success 
              ? undefined 
              : result.error.issues[0].message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor={field.name}
              className="text-telnet-primary font-semibold text-lg"
            >
              Deskripsi
            </Label>

            <Textarea
              id={field.name}
              rows={5}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="resize-none border-telnet-surface-darker"
            />

            {field.state.meta.errors && (
              <p className="text-red-600 text-sm">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      </form.Field> 
      <form.Field
        name="mascotId"
        validators={{
          onChange: (value) => {
            const result = ChapterSchema.shape.mascotId.safeParse(value.value);
            return result.success 
              ? undefined 
              : result.error.issues[0].message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-telnet-primary font-semibold text-lg">
              Pilih Mascot
            </Label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {MASCOTS.map((index) => (
                <Label
                  key={index}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <img
                    src={`/assets/mascot/chap${index}.png`}
                    draggable="false"
                    className="w-28 h-28 object-contain rounded-xl border p-3 border-telnet-surface-darker 
                               transition-all group-hover:border-telnet-primary group-hover:scale-105"
                  />

                  <Input
                    type="radio"
                    name={field.name}
                    value={index}
                    checked={field.state.value === index}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="mt-2 h-4 w-4 text-telnet-primary"
                  />
                </Label>
              ))}
            </div>

            {field.state.meta.errors && (
              <p className="text-red-600 text-sm">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      </form.Field>
      <Button
        className="bg-telnet-primary h-10 py-4 text-lg font-bold text-white 
                   hover:bg-white hover:text-telnet-primary border border-telnet-primary 
                   transition-colors duration-200 w-full cursor-pointer"
      >
        Tambah Chapter
      </Button>
    </form>
  </Card>
  );
}
