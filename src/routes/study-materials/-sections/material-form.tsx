import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type StudyMaterialFormData, studyMaterialSchema } from "@/types/zod";
import { Loader2 } from "lucide-react";

interface MaterialFormProps {
	form: ReturnType<typeof useCustomForm<StudyMaterialFormData>>;
	buttonText: string;
}

export default function MaterialForm({ form, buttonText }: MaterialFormProps) {
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
							validateField(studyMaterialSchema, "title", value.value),
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
					name="content"
					validators={{
						onChange: (value) =>
							validateField(studyMaterialSchema, "content", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-telnet-primary font-semibold text-lg"
							>
								Konten
							</Label>

							<Textarea
								id={field.name}
								rows={5}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="resize-none border-telnet-surface-darker"
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
					name="imageFile"
					validators={{
						onChange: (value) =>
							validateField(studyMaterialSchema, "imageFile", value.value),
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-telnet-primary font-semibold text-lg"
							>
								Gambar
							</Label>
							<Input
								id={field.name}
								type="file"
								onChange={(e) => field.handleChange(e.target.files?.[0])}
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
				<Button
					type="submit"
					disabled={form.state.isSubmitting}
					className="bg-telnet-primary h-10 py-4 text-lg font-bold text-white 
                   hover:bg-white hover:text-telnet-primary border border-telnet-primary 
                   transition-colors duration-200 w-full cursor-pointer"
				>
					{form.state.isSubmitting ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						buttonText
					)}
				</Button>
			</form>
		</Card>
	);
}
