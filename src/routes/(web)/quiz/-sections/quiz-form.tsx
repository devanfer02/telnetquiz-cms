import ChapterOptions from "@/components/chapters/chapter-options";
import SubmitButton from "@/components/global/submit-button";
import { Card, CardContent } from "@/components/ui/card";
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
		<Card>
			<CardContent className="pt-6">
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
								<Label htmlFor={field.name}>Judul</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors && (
									<p className="text-destructive text-sm">
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
								<Label htmlFor={field.name}>Level</Label>
								<Input
									id={field.name}
									type="number"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(Number(e.target.value))}
								/>
								{field.state.meta.errors && (
									<p className="text-destructive text-sm">
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
								<Label htmlFor={field.name}>Kesulitan</Label>
								<div className="relative">
									<select
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												e.target.value as "easy" | "medium" | "hard",
											)
										}
										className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
									>
										<option value="easy">Easy</option>
										<option value="medium">Medium</option>
										<option value="hard">Hard</option>
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
					<form.Field
						name="chapterId"
						validators={{
							onChange: (value) =>
								validateField(quizSchema, "chapterId", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Chapter</Label>
								<div className="relative">
									<select
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(Number(e.target.value))}
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

					<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}
