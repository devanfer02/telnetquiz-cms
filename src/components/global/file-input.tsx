import { File, Upload, X } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FileInputProps {
	id: string;
	htmlFor?: string;
	action?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({ id, htmlFor, action }: FileInputProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileChange = (file: File | undefined) => {
		if (file) {
			setSelectedFile(file);
		}
	};

	return (
		<div className="w-full mx-auto">
			<Label className="block text-telnet-primary text-lg font-semibold mb-2">
				Gambar
			</Label>

			<section
				aria-label="File drop zone"
				onDrop={(e) => {
					e.preventDefault();
					setIsDragging(false);
					const file = e.dataTransfer.files?.[0];
					handleFileChange(file);
				}}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => {
					setIsDragging(false);
				}}
				className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 ease-in-out
          ${
						isDragging
							? "border-orange-500 bg-orange-50"
							: "border-telnet-surface-darker bg-white hover:border-orange-400"
					}
        `}
			>
				{!selectedFile ? (
					<div className="text-center">
						<Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<div className="mb-2">
							<label
								htmlFor={htmlFor}
								className="cursor-pointer inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
							>
								<Input
									id={id}
									type="file"
									className="sr-only"
									onChange={(e) => {
										handleFileChange(e.target.files?.[0]);
										if (action) {
											action(e);
										}
									}}
									accept="image/*"
								/>
								Browse...
							</label>
						</div>
						<p className="text-sm text-gray-500">
							or drag and drop your file here
						</p>
						<p className="text-xs text-gray-400 mt-1">
							PNG, JPG, GIF up to 10MB
						</p>
					</div>
				) : (
					<div className="flex items-center justify-between bg-gray-50 rounded-md p-4">
						<div className="flex items-center space-x-3">
							<File className="h-8 w-8 text-orange-500" />
							<div>
								<p className="text-sm font-medium text-gray-900">
									{selectedFile.name}
								</p>
								<p className="text-xs text-gray-500">
									{(selectedFile.size / 1024).toFixed(2)} KB
								</p>
							</div>
						</div>
						<button
							onClick={() => {
								setSelectedFile(null);
							}}
							className="p-1 hover:bg-gray-200 rounded-full transition-colors"
							type="button"
						>
							<X className="h-5 w-5 text-gray-500" />
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
