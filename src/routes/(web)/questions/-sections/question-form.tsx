import { useStore } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { Suspense } from "react";
import ChapterOptions from "@/components/chapters/chapter-options";
import { RichTextarea } from "@/components/global/quill-textarea";
import SubmitButton from "@/components/global/submit-button";
import QuizOptions from "@/components/quiz/quiz-options";
import StudyMaterialOptions from "@/components/study-materials/study-material-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import {
	type QuestionFormData,
	type QuestionsFormData,
	questionSchema,
} from "@/types/zod";
import OptionsArray from "./options-form";

interface QuestionFormProps {
	form: ReturnType<typeof useCustomForm<QuestionsFormData>>;
	buttonText: string;
}

function createEmptyQuestion(
	index: number,
	type: "pretest" | "quiz",
): QuestionFormData {
	return {
		type: type,
		quizId: null,
		chapterId: null,
		materialId: 0,
		description: "",
		question: "",
		options: [{ questionId: `Q${index + 1}`, text: "", isCorrect: false }],
	};
}
export default function QuestionForm({ form, buttonText }: QuestionFormProps) {
	const isSubmitting = useStore(form.store, (store) => store.isSubmitting);
	const type = useStore(form.store, (state) => state.values.type);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6 mb-10"
		>
			<form.Field
				name="type"
				validators={{
					onChange: (value) =>
						validateField(questionSchema, "type", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Type</Label>
						<div className="relative">
							<select
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value as QuestionsFormData["type"],
									)
								}
								className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
							>
								<option value="quiz">Quiz</option>
								<option value="pretest">Pretest</option>
							</select>
						</div>
						{field.state.meta.errors && (
							<p className="text-destructive text-sm">
								{field.state.meta.errors}
							</p>
						)}
					</div>
				)}
			</form.Field>

			{type === "quiz" ? (
				<form.Field
					name="quizId"
					validators={{
						onChange: (value) =>
							validateField(questionSchema, "quizId", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Quiz</Label>
							<div className="relative">
								<select
									id={field.name}
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value === "" ? null : Number(e.target.value),
										)
									}
									className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
								>
									<option value={0} hidden>
										Pilih Quiz
									</option>
									<Suspense
										fallback={<option disabled>Loading quizzes...</option>}
									>
										<QuizOptions />
									</Suspense>
								</select>
							</div>
							{field.state.meta.errors && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>
			) : (
				<form.Field
					name="chapterId"
					validators={{
						onChange: (value) =>
							validateField(questionSchema, "chapterId", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Chapter</Label>
							<div className="relative">
								<select
									id={field.name}
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value === "" ? null : Number(e.target.value),
										)
									}
									className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
								>
									<option value={0} hidden>
										Pilih Chapter
									</option>
									<Suspense
										fallback={<option disabled>Loading chapters...</option>}
									>
										<ChapterOptions />
									</Suspense>
								</select>
							</div>
							{field.state.meta.errors && (
								<p className="text-destructive text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>
			)}

			<form.Field
				name="materialId"
				validators={{
					onChange: (value) =>
						validateField(questionSchema, "materialId", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Study Material (Optional)</Label>
						<div className="relative">
							<select
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
							>
								<option value={0} hidden>
									Pilih Study Material
								</option>
								<Suspense
									fallback={
										<option disabled>Loading study materials...</option>
									}
								>
									<StudyMaterialOptions />
								</Suspense>
							</select>
						</div>
						{field.state.meta.errors && (
							<p className="text-destructive text-sm">
								{field.state.meta.errors}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="text-lg font-medium">Questions</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							form.pushFieldValue(
								"questions",
								createEmptyQuestion(
									form.getFieldValue("questions").length,
									type,
								),
							);
						}}
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Question
					</Button>
				</div>

				<form.Field name="questions" mode="array">
					{(questionsField) => (
						<div className="space-y-6">
							{questionsField.state.value.map((_question, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: dynamic form array uses index
								<Card key={index}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-base font-semibold">
											Question {index + 1}
										</CardTitle>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-muted-foreground hover:text-destructive"
											onClick={() => questionsField.removeValue(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</CardHeader>
									<CardContent className="space-y-4 pt-2">
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
												<div className="space-y-2">
													<Label htmlFor={field.name}>Description</Label>
													<RichTextarea
														value={field.state.value}
														onChange={(val) => field.handleChange(val)}
													/>
													{field.state.meta.errors && (
														<p className="text-destructive text-sm">
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
													validateField(
														questionSchema,
														"question",
														value.value,
													),
											}}
										>
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={field.name}>Question Text</Label>
													<RichTextarea
														value={field.state.value}
														onChange={(val) => field.handleChange(val)}
													/>
													{field.state.meta.errors && (
														<p className="text-destructive text-sm">
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
													if (!file || typeof file === "string")
														return undefined; // optional or existing → OK

													return validateField(questionSchema, "image", file);
												},
											}}
										>
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={field.name}>Image (Optional)</Label>

													{/* Show existing image if available */}
													{typeof field.state.value === "string" &&
														field.state.value && (
															<div className="mb-4">
																<div className="relative inline-block">
																	<img
																		src={field.state.value}
																		alt="Current Question"
																		className="w-48 h-48 object-cover rounded-lg border-2 border-border shadow-sm"
																	/>
																	<span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
																		Current
																	</span>
																</div>
																<p className="text-sm text-muted-foreground mt-2">
																	Upload a new image to replace this one
																</p>
															</div>
														)}

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
														className="pt-1.5"
													/>
													{field.state.meta.errors && (
														<p className="text-destructive text-sm">
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

							{questionsField.state.meta.errors && (
								<p className="text-destructive text-sm">
									{questionsField.state.meta.errors.join(", ")}
								</p>
							)}
						</div>
					)}
				</form.Field>
			</div>

			<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
		</form>
	);
}
