import ChapterOptions from "@/components/chapters/chapter-options";
import SubmitButton from "@/components/global/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type QuizFormData, quizSchema } from "@/types/zod";
import { useStore } from "@tanstack/react-form";
import { Suspense } from "react";

interface QuizFormProps {
	form: ReturnType<typeof useCustomForm<QuizFormData>>;
	buttonText: string;
}

export default function QuizForm({ form, buttonText }: QuizFormProps) {
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

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
						onChange: (value) =>
							validateField(quizSchema, "title", value.value),
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
								<p className="text-red-600 text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>
				<form.Field
					name="level"
					validators={{
						onChange: (value) =>
							validateField(quizSchema, "level", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-telnet-primary font-semibold text-lg"
							>
								Level
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								className="border-telnet-surface-darker"
							/>
							{field.state.meta.errors && (
								<p className="text-red-600 text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>
				<form.Field
					name="difficulty"
					validators={{
						onChange: (value) =>
							validateField(quizSchema, "difficulty", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-telnet-primary font-semibold text-lg"
							>
								Kesulitan
							</Label>
							<select
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value as "easy" | "medium" | "hard",
									)
								}
								className="w-full p-2 border border-telnet-surface-darker rounded-md"
							>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
							{field.state.meta.errors && (
								<p className="text-red-600 text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>
				<form.Field
					name="chapterId"
					validators={{
						onChange: (value) =>
							validateField(quizSchema, "chapterId", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-telnet-primary font-semibold text-lg"
							>
								Chapter
							</Label>
							<select
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								className="w-full p-2 border border-telnet-surface-darker rounded-md"
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
							{field.state.meta.errors && (
								<p className="text-red-600 text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
			</form>
		</Card>
	);
}
