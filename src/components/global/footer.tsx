import { Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full mb-5 backdrop-blur-sm bg-telnet-primary/5 border rounded-xl ">
			<div
				className="mx-auto 
                      max-w-md p-4 flex items-center justify-center gap-2 shadow-sm"
			>
				<span className="text-sm text-muted-foreground">Made with</span>

				<Heart className="w-4 h-4 text-telnet-primary" />
				<span className="text-sm text-muted-foreground">by</span>
				<span className="text-sm font-medium text-telnet-primary">
					Devan F.
				</span>
			</div>
		</footer>
	);
}
