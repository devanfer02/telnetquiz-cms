import { Coffee, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function useGreeting() {
	const [mounted, setMounted] = useState(false);
	const [greeting, setGreeting] = useState("");
	const [icon, setIcon] = useState(<Sun className="size-5 text-yellow-500" />);

	useEffect(() => {
		const hour = new Date().getHours();

		if (hour >= 5 && hour < 12) {
			setGreeting("Good morning");
			setIcon(<Coffee className="size-5 text-amber-500" />);
		} else if (hour >= 12 && hour < 18) {
			setGreeting("Good afternoon");
			setIcon(<Sun className="size-5 text-orange-400" />);
		} else if (hour >= 18 && hour < 22) {
			setGreeting("Good evening");
			setIcon(<Moon className="size-5 text-indigo-400" />);
		} else {
			setGreeting("Good night");
			setIcon(<Moon className="size-5 text-blue-400" />);
		}
		setMounted(true);
	}, []);

	return { mounted, greeting, icon };
}
