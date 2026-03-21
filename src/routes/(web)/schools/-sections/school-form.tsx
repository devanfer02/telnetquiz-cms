import { useStore } from "@tanstack/react-form";
import SubmitButton from "@/components/global/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type SchoolFormData, schoolSchema } from "@/types/zod";

interface SchoolFormProps {
	form: ReturnType<typeof useCustomForm<SchoolFormData>>;
	buttonText: string;
}

export default function SchoolForm({ form, buttonText }: SchoolFormProps) {
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
						name="name"
						validators={{
							onChange: (value) =>
								validateField(schoolSchema, "name", value.value),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Nama Sekolah</Label>
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
					<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}
