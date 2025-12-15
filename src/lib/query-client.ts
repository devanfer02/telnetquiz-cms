import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // don’t refetch when tab refocuses
			staleTime: 1000 * 60, // 1 minute cache by default
		},
	},
});
