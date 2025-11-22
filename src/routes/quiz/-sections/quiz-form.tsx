import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockChapters } from "@/data/mock-chapter";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { type QuizFormData, QuizSchema } from "@/types/zod/quiz";

interface QuizFormProps {
	form: ReturnType<typeof useCustomForm<QuizFormData>>;
	buttonText: string;
}

export default function QuizForm({ form, buttonText }: QuizFormProps) {
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
							const result = QuizSchema.shape.title.safeParse(value.value);
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
						onChange: (value) => {
							const result = QuizSchema.shape.difficulty.safeParse(value.value);
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
					name="numberOfQuestions"
					validators={{
						onChange: (value) => {
							const result = QuizSchema.shape.numberOfQuestions.safeParse(
								value.value,
							);
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
								Jumlah Pertanyaan
							</Label>
							<Input
								id={field.name}
								type="number"
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
					name="chapterId"
					validators={{
						onChange: (value) => {
							const result = QuizSchema.shape.chapterId.safeParse(value.value);
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
								Chapter
							</Label>
							<select
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								className="w-full p-2 border border-telnet-surface-darker rounded-md"
							>
								<option value={0}>Pilih Chapter</option>
								{mockChapters.map((chapter) => (
									<option key={chapter.id} value={chapter.id}>
										{chapter.title}
									</option>
								))}
							</select>
							{field.state.meta.errors && (
								<p className="text-red-600 text-sm">
									{field.state.meta.errors}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<Button
					className="bg-telnet-primary h-10 py-4 text-lg font-bold text-white
                   hover:bg-white hover:text-telnet-primary border border-telnet-primary
                   transition-colors duration-200 w-full cursor-pointer"
				>
					{buttonText}
				</Button>
			</form>
		</Card>
	);
}
