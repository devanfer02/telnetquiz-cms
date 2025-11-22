import {
	type FormOptions as TanStackFormOptions,
	useForm,
} from "@tanstack/react-form";

export interface InputProperties<TData>
	extends TanStackFormOptions<
		TData,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any,
		any
	> {}

export function useCustomForm<TData>(properties: InputProperties<TData>) {
	const form = useForm(properties);

	return form;
}
