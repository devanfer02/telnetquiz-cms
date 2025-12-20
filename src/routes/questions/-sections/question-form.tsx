import { Plus, Trash2 } from "lucide-react";
import SubmitButton from "@/components/global/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import {
	type QuestionFormData,
	type QuestionsFormData,
	questionSchema,
} from "@/types/zod";
import OptionsArray from "./options-form";
import { Suspense } from "react";
import QuizOptions from "@/components/quiz/quiz-options";
import StudyMaterialOptions from "@/components/study-materials/study-material-options";

interface QuestionFormProps {
	form: ReturnType<typeof useCustomForm<QuestionsFormData>>;
	buttonText: string;
}

function createEmptyQuestion(index: number): QuestionFormData {
	return {
		quizId: 0,
		materialId: 0,
		description: "",
		question: "",
		options: [{ questionId: `Q${index + 1}`, text: "", isCorrect: false }],
	};
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
				name="quizId"
				validators={{
					onChange: (value) =>
						validateField(questionSchema, "quizId", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label
							htmlFor={field.name}
							className="text-telnet-primary font-semibold text-lg"
						>
							Quiz
						</Label>
						<select
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
							className="w-full p-2 border border-telnet-surface-darker rounded-md"
						>
							<option value={0} hidden>
								Pilih Quiz
							</option>
							<Suspense fallback={<option disabled>Loading quizzes...</option>}>
								<QuizOptions />
							</Suspense>
						</select>
						{field.state.meta.errors && (
							<p className="text-red-600 text-sm">{field.state.meta.errors}</p>
						)}
					</div>
				)}
			</form.Field>
			<form.Field
				name="materialId"
				validators={{
					onChange: (value) =>
						validateField(questionSchema, "materialId", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label
							htmlFor={field.name}
							className="text-telnet-primary font-semibold text-lg"
						>
							Study Material
						</Label>
						<select
							id={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
							className="w-full p-2 border border-telnet-surface-darker rounded-md"
						>
							<option value={0} hidden>
								Pilih Study Material
							</option>
							<Suspense
								fallback={<option disabled>Loading study materials...</option>}
							>
								<StudyMaterialOptions />
							</Suspense>
						</select>
						{field.state.meta.errors && (
							<p className="text-red-600 text-sm">{field.state.meta.errors}</p>
						)}
					</div>
				)}
			</form.Field>

			<Label className="text-telnet-primary font-semibold text-lg">
				Questions
			</Label>
			<form.Field name="questions" mode="array">
				{(questionsField) => (
					<div className="space-y-6">
						{questionsField.state.value.map((_question, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="flex justify-between items-center">
										<span>Question {index + 1}</span>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											onClick={() => questionsField.removeValue(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<form.Field
										name={`questions[${index}].description`}
										validators={{
											onChange: (value) =>
												validateField(
													questionSchema,
													"description",
													value.value,
												),
										}}
									>
										{(field) => (
											<div>
												<Label className="mb-2" htmlFor={field.name}>
													Description
												</Label>
												<Textarea
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="e.g. This question is about TCP/IP..."
												/>
												{field.state.meta.errors && (
													<p className="text-red-500 text-sm mt-1">
														{field.state.meta.errors.join(", ")}
													</p>
												)}
											</div>
										)}
									</form.Field>
									<form.Field
										name={`questions[${index}].question`}
										validators={{
											onChange: (value) =>
												validateField(questionSchema, "question", value.value),
										}}
									>
										{(field) => (
											<div>
												<Label className="mb-2" htmlFor={field.name}>
													Question Text
												</Label>
												<Textarea
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													placeholder="e.g. What is the function of the transport layer?"
												/>
												{field.state.meta.errors && (
													<p className="text-red-500 text-sm mt-1">
														{field.state.meta.errors.join(", ")}
													</p>
												)}
											</div>
										)}
									</form.Field>
									<form.Field
										name={`questions[${index}].image`}
										validators={{
											onChange: (value) => {
												const file = value.value;
												if (!file) return undefined; // optional → OK

												return validateField(questionSchema, "image", file);
											},
										}}
									>
										{(field) => (
											<div>
												<Label className="mb-2" htmlFor={field.name}>
													Image (Optional)
												</Label>
												<Input
													id={field.name}
													name={field.name}
													onBlur={field.handleBlur}
													onChange={(e) => {
														const file = e.target.files?.[0] ?? null;
														field.handleChange(file);
													}}
													type="file"
													accept="image/*"
													className="flex flex-col items-center justify-center pt-1.5"
												/>
												{field.state.meta.errors && (
													<p className="text-red-500 text-sm mt-1">
														{field.state.meta.errors.join(", ")}
													</p>
												)}
											</div>
										)}
									</form.Field>

									<OptionsArray form={form} questionIndex={index} />
								</CardContent>
							</Card>
						))}
						<div className="flex justify-between items-center mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									questionsField.pushValue(
										createEmptyQuestion(questionsField.state.value.length),
									);
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Question
							</Button>
						</div>
						{questionsField.state.meta.errors && (
							<p className="text-red-500 text-sm mt-1">
								{questionsField.state.meta.errors.join(", ")}
							</p>
						)}
					</div>
				)}
			</form.Field>
			<SubmitButton>{buttonText}</SubmitButton>
		</form>
	);
}
