import { useStore } from "@tanstack/react-form";
import SubmitButton from "@/components/global/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useCustomForm } from "@/hooks/use-custom-form";
import { validateField } from "@/lib/utils";
import { type EditUserFormData, editUserSchema } from "@/types/zod";

interface UserFormProps {
	form: ReturnType<typeof useCustomForm<EditUserFormData>>;
	buttonText: string;
}

export default function UserForm({ form, buttonText }: UserFormProps) {
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				e.stopPropagation();
				await form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field
				name="fullname"
				validators={{
					onChange: (value) =>
						validateField(editUserSchema, "fullname", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Fullname</Label>
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
				name="email"
				validators={{
					onChange: (value) =>
						validateField(editUserSchema, "email", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Email</Label>
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
				name="password"
				validators={{
					onChange: (value) =>
						validateField(editUserSchema, "password", value.value),
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Password (Optional)</Label>
						<Input
							id={field.name}
							type="password"
							placeholder="Leave empty to keep unchanged"
							value={field.state.value || ""}
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
			<form.Field name="gender">
				{(field) => (
					<div className="space-y-2">
						<Label>Gender</Label>
						<select
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							value={
								field.state.value === true
									? "male"
									: field.state.value === false
										? "female"
										: ""
							}
							onChange={(e) => {
								const val = e.target.value;
								field.handleChange(
									val === "male" ? true : val === "female" ? false : undefined,
								);
							}}
						>
							<option value="">Select gender</option>
							<option value="male">Laki-Laki</option>
							<option value="female">Perempuan</option>
						</select>
					</div>
				)}
			</form.Field>
			<form.Field name="grade">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Grade (Kelas)</Label>
						<Input
							id={field.name}
							value={field.state.value || ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="e.g. 10, 11, 12"
						/>
					</div>
				)}
			</form.Field>
			<SubmitButton isSubmitting={isSubmitting}>{buttonText}</SubmitButton>
		</form>
	);
}
