import { lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";

// Only load on client
const ReactQuill =
	typeof window !== "undefined"
		? lazy(() => import("react-quill-new"))
		: () => null;

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export function RichTextarea({ value, onChange }: Props) {
	// Don't render on server
	if (typeof window === "undefined") {
		return (
			<div className="bg-white border rounded-md p-4 h-40 flex items-center justify-center text-gray-500">
				Loading editor...
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="bg-white border rounded-md p-4 h-40 flex items-center justify-center text-gray-500">
					Loading editor...
				</div>
			}
		>
			<ReactQuill
				theme="snow"
				value={value}
				onChange={onChange}
				className="bg-white"
			/>
		</Suspense>
	);
}
