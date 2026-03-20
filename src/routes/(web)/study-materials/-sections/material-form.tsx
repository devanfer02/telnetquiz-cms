import { useStore } from "@tanstack/react-form";
import FileInput from "@/components/global/file-input";
import { RichTextarea } from "@/components/global/quill-textarea";
import SubmitButton from "@/components/global/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type StudyMaterialFormData, studyMaterialSchema } from "@/types/zod";

interface MaterialFormProps {
	form: ReturnType<typeof useCustomForm<StudyMaterialFormData>>;
	oldImageLink?: string | null;
	buttonText: string;
}

export default function MaterialForm({
	form,
	buttonText,
	oldImageLink,
}: MaterialFormProps) {
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
								validateField(studyMaterialSchema, "title", value.value),
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
						name="content"
						validators={{
							onChange: (value) =>
								validateField(studyMaterialSchema, "content", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Konten</Label>

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
						name="imageFile"
						validators={{
							onChange: (value) =>
								validateField(studyMaterialSchema, "imageFile", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								{/* Show existing image if available */}
								{oldImageLink && (
									<div className="mb-4">
										<Label className="mb-2 block">Current Image</Label>
										<div className="relative inline-block">
											<img
												src={oldImageLink}
												alt="Current study material"
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

								<Label htmlFor={field.name}>Image (Optional)</Label>
								<FileInput
									id={field.name}
									htmlFor={field.name}
									action={(e) => field.handleChange(e.target.files?.[0])}
								/>
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
