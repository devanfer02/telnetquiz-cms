import SubmitButton from "@/components/global/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type ChapterFormData, chapterSchema } from "@/types/zod";
import { useStore } from "@tanstack/react-form";

import { RichTextarea } from "@/components/global/quill-textarea";

const MASCOTS = [1, 2, 3, 4];

interface ChapterFormProps {
	form: ReturnType<typeof useCustomForm<ChapterFormData>>;
	buttonText: string;
}

export default function ChapterForm({ form, buttonText }: ChapterFormProps) {
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<Card>
			<CardContent className="pt-6">
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						e.stopPropagation();
						await form.handleSubmit();
					}}
					className="space-y-6"
				>
					<form.Field
						name="title"
						validators={{
							onChange: (value) =>
								validateField(chapterSchema, "title", value.value),
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
						name="description"
						validators={{
							onChange: (value) =>
								validateField(chapterSchema, "description", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Deskripsi</Label>

								<RichTextarea
									value={field.state.value}
									onChange={(val) => field.handleChange(val)}
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
						name="mascotId"
						validators={{
							onChange: (value) =>
								validateField(chapterSchema, "mascotId", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label>Pilih Mascot</Label>

								<div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
									{MASCOTS.map((index) => (
										<Label
											key={index}
											className="flex flex-col items-center cursor-pointer group"
										>
											<img
												src={`/assets/mascot/chap${index}.png`}
												draggable="false"
												className={`w-28 h-28 object-contain rounded-xl border p-3 transition-all group-hover:scale-105 ${
													field.state.value === index
														? "border-primary bg-primary/5 ring-2 ring-primary/20"
														: "border-border hover:border-primary/50"
												}`}
											/>

											<Input
												type="radio"
												name={field.name}
												value={index}
												checked={field.state.value === index}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(Number(e.target.value))
												}
												className="sr-only"
											/>
										</Label>
									))}
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
