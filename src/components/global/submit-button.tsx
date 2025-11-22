import { Button } from "../ui/button";

interface SubmitButtonProps {
	children: React.ReactNode;
}

export default function SubmitButton({ children }: SubmitButtonProps) {
	return (
		<Button
			className="bg-telnet-primary h-10 py-4 text-lg font-bold text-white 
               hover:bg-white hover:text-telnet-primary border border-telnet-primary 
               transition-colors duration-200 w-full cursor-pointer"
		>
			{children}
		</Button>
	);
}
