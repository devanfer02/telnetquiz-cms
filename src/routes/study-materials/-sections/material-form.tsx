import FileInput from "@/components/global/file-input";
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
	oldImageLink?: string | null;
	buttonText: string;
}

export default function MaterialForm({
	form,
	buttonText,
	oldImageLink,
}: MaterialFormProps) {
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
						<div className="">
							{/* Show existing image if available */}
							{oldImageLink && (
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Current Image
									</label>
									<div className="relative inline-block">
										<img
											src={oldImageLink}
											className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
										/>
										<span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
											Current
										</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">
										Upload a new image to replace this one
									</p>
								</div>
							)}

							<FileInput
								id={field.name}
								htmlFor={field.name}
								action={(e) => field.handleChange(e.target.files?.[0])}
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
