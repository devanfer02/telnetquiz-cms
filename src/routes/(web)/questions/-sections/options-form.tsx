import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { optionSchema, type QuestionsFormData } from "@/types/zod";

interface OptionsArrayProps {
	form: ReturnType<typeof useCustomForm<QuestionsFormData>>;
	questionIndex: number;
}

export default function OptionsArray({
	form,
	questionIndex,
}: OptionsArrayProps) {
	return (
		<form.Field name={`questions[${questionIndex}].options`} mode="array">
			{(optionsField) => {
				const options = optionsField.state.value || [];

				return (
					<div>
						<Label>Options</Label>
						<div className="space-y-3 mt-3">
							{options.map((_, optionIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: dynamic form array uses index
								<div key={optionIndex} className="flex items-center gap-2">
									{/* Radio button (mark correct) */}
									<form.Field
										name={`questions[${questionIndex}].options[${optionIndex}].isCorrect`}
									>
										{(correctField) => (
											<div className="flex items-center justify-center">
												<input
													type="radio"
													name={`correctOption-${questionIndex}`}
													checked={correctField.state.value}
													onChange={() => {
														options.forEach((_, i) => {
															form.setFieldValue(
																`questions[${questionIndex}].options[${i}].isCorrect`,
																i === optionIndex,
															);
														});
													}}
													className="h-4 w-4 cursor-pointer accent-primary"
												/>
											</div>
										)}
									</form.Field>

									{/* Option text field */}
									<form.Field
										name={`questions[${questionIndex}].options[${optionIndex}].text`}
										validators={{
											onChange: (value) =>
												validateField(optionSchema, "text", value.value),
										}}
									>
										{(optionField) => (
											<div className="flex-1">
												<Input
													id={optionField.name}
													name={optionField.name}
													value={optionField.state.value}
													onBlur={optionField.handleBlur}
													onChange={(e) =>
														optionField.handleChange(e.target.value)
													}
													placeholder={`Option ${optionIndex + 1}`}
												/>
												{optionField.state.meta.errors && (
													<p className="text-destructive text-sm mt-1">
														{optionField.state.meta.errors}
													</p>
												)}
											</div>
										)}
									</form.Field>

									{/* Remove option */}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										disabled={options.length <= 1}
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
								optionsField.pushValue({
									questionId: `Q${questionIndex}`,
									text: "",
									isCorrect: false,
								})
							}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Option
						</Button>
					</div>
				);
			}}
		</form.Field>
	);
}
