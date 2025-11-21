import { questionSchema } from "@/types/zod/question";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useCustomForm } from "@/hooks/use-custom-form";
import SubmitButton from "@/components/global/submit-button";

interface QuestionFormProps {
  form: ReturnType<typeof useCustomForm<{ questions: Question[] }>>
  buttonText: string;
}

interface OptionsArrayProps {
  form: ReturnType<typeof useCustomForm<{ questions: Question[] }>>
  questionIndex: number 
}

function createEmptyQuestion(index: number): Question {
  return {
    id: `Q${index + 1}`,
    quizId: "",
    imageLink: "",
    description: "",
    question: "",
    options: [
      { questionId: `Q${index + 1}`, text: "", isCorrect: false },
    ],
  }
}

function OptionsArray({ form, questionIndex }: OptionsArrayProps) {
  return (
    <form.Field
      name={`questions[${questionIndex}].options`}
      mode="array"
    >
      {(optionsField) => (
        <div>
          <Label>Options</Label>

          <div className="space-y-3 mt-3">
            {optionsField.state.value.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                {/* Radio button (mark correct) */}
                <input
                  type="radio"
                  name={`correctOption-${questionIndex}`}
                  checked={option.isCorrect}
                  onChange={() => {
                    optionsField.handleChange(
                      optionsField.state.value.map((o, i) => ({
                        ...o,
                        isCorrect: i === optionIndex,
                      }))
                    )
                  }}
                  className="h-5 w-5 text-telnet-primary"
                />

                {/* Option text field */}
                <form.Field
                  name={`questions[${questionIndex}].options[${optionIndex}].text`}
                >
                  {(optionField) => (
                    <Input
                      id={optionField.name}
                      name={optionField.name}
                      value={optionField.state.value}
                      onBlur={optionField.handleBlur}
                      onChange={(e) => optionField.handleChange(e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1"
                    />
                  )}
                </form.Field>

                {/* Remove option */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={optionsField.state.value.length <= 1}
                  onClick={() => optionsField.removeValue(optionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() =>
              optionsField.pushValue({ questionId: `Q${questionIndex}`, text: "", isCorrect: false })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}
    </form.Field>
  )
}


export default function QuestionForm({ form, buttonText }: QuestionFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="questions"
        mode="array"
      >
        {(questionsField) => (
          <div className="space-y-6">
            {questionsField.state.value.map((_question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Question {index + 1}</span>
                    <Button type="button" variant="destructive" size="icon" onClick={() => questionsField.removeValue(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form.Field
                    name={`questions[${index}].description`}
                    validators={{
                      onChange: (value) => {
                        const result = questionSchema.shape.description.safeParse(value.value);
                        return result.success 
                          ? undefined 
                          : result.error.issues[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label className="mb-2" htmlFor={field.name}>Description</Label>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. This question is about TCP/IP..."
                        />
                        {field.state.meta.errors && <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>}
                      </div>
                    )}
                  </form.Field>
                  <form.Field
                    name={`questions[${index}].question`}
                    validators={{
                      onChange: (value) => {
                        const result = questionSchema.shape.question.safeParse(value.value);
                        return result.success 
                          ? undefined 
                          : result.error.issues[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label className="mb-2" htmlFor={field.name}>Question Text</Label>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. What is the function of the transport layer?"
                        />
                        {field.state.meta.errors && <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>}
                      </div>
                    )}
                  </form.Field>
                    <form.Field
                      name={`questions[${index}].image`}
                      validators={{
                        onChange: (value) => {
                          const file = value.value 
                          if (!file) return undefined // optional → OK
                    
                          const result = questionSchema.shape.image.safeParse(file)
                          return result.success ? undefined : result.error.issues[0].message
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label className="mb-2" htmlFor={field.name}>Image (Optional)</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null
                              field.handleChange(file)
                            }}
                            type="file"
                            accept="image/*"
                            className="flex flex-col items-center justify-center pt-1.5"
                          />
                          {field.state.meta.errors && <p className="text-red-500 text-sm mt-1">{field.state.meta.errors.join(', ')}</p>}
                        </div>
                      )}
                    </form.Field>
                  
                  <OptionsArray form={form} questionIndex={index}/>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between items-center mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => questionsField.pushValue(
                  createEmptyQuestion(questionsField.state.value.length)
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" size="lg" disabled={!canSubmit}>
                    {isSubmitting ? "..." : buttonText}
                  </Button>
                )}
              />
            </div>
            {questionsField.state.meta.errors && <p className="text-red-500 text-sm mt-1">{questionsField.state.meta.errors.join(', ')}</p>}
          </div>
        )}
      </form.Field>
      <SubmitButton>
        Tambah Pertanyaan
      </SubmitButton>
    </form>
  )
}