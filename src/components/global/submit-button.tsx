import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SubmitButtonProps {
	isSubmitting: boolean;
	children: React.ReactNode;
}

export default function SubmitButton({
	isSubmitting,
	children,
}: SubmitButtonProps) {
	return (
		<Button
			type="submit"
			disabled={isSubmitting}
			className="bg-telnet-primary h-10 py-4 text-lg font-bold text-white 
             hover:bg-white hover:text-telnet-primary border border-telnet-primary 
             transition-colors duration-200 w-full cursor-pointer"
		>
			{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
		</Button>
	);
}
