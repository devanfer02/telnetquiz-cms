import { useStore } from "@tanstack/react-form";
import SubmitButton from "@/components/global/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type AchievementFormData, achievementSchema } from "@/types/zod";

interface AchievementFormProps {
	form: ReturnType<typeof useCustomForm<AchievementFormData>>;
	buttonText: string;
}

export default function AchievementForm({
	form,
	buttonText,
}: AchievementFormProps) {
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
						name="slug"
						validators={{
							onChange: (value) =>
								validateField(achievementSchema, "slug", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Slug</Label>
								<Input
									id={field.name}
									placeholder="contoh: pretest_complete"
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
						name="title"
						validators={{
							onChange: (value) =>
								validateField(achievementSchema, "title", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Judul</Label>
								<Input
									id={field.name}
									placeholder="contoh: Penjelajah Pretest"
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
						name="description"
						validators={{
							onChange: (value) =>
								validateField(achievementSchema, "description", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Deskripsi</Label>
								<Input
									id={field.name}
									placeholder="contoh: Menyelesaikan pretest"
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

					<form.Field name="icon">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Icon (lucide icon name)</Label>
								<Input
									id={field.name}
									placeholder="contoh: trophy, star, crown"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field
						name="rule"
						validators={{
							onChange: (value) => {
								const base = validateField(
									achievementSchema,
									"rule",
									value.value,
								);
								if (base) return base;
								try {
									JSON.parse(value.value);
									return undefined;
								} catch {
									return "Rule harus berupa JSON yang valid";
								}
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Rule (JSON Logic)</Label>
								<textarea
									id={field.name}
									rows={6}
									className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
									placeholder={'{ ">": [{ "var": "total_submissions" }, 0] }'}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								<p className="text-muted-foreground text-xs">
									Variabel yang tersedia: pretest_taken, pretest_total,
									pretest_correct, pretest_score, total_submissions, best_score,
									levels_completed, chapters_completed, total_score,
									has_perfect_score
								</p>
								{field.state.meta.errors && (
									<p className="text-destructive text-sm">
										{field.state.meta.errors}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="isActive">
						{(field) => (
							<div className="flex items-center gap-2">
								<input
									id={field.name}
									type="checkbox"
									checked={field.state.value}
									onChange={(e) => field.handleChange(e.target.checked)}
									className="h-4 w-4 rounded border-gray-300"
								/>
								<Label htmlFor={field.name}>Aktif</Label>
							</div>
						)}
					</form.Field>

					<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}
