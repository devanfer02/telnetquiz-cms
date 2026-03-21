import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./components/global/root-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const rqContext = TanstackQuery.getContext();

	const router = createRouter({
		routeTree,
		context: {
			queryClient: rqContext.queryClient,
			user: null,
			session: null,
		},
		defaultPreload: "intent",
		Wrap: (props: { children: React.ReactNode }) => {
			return <TanstackQuery.Provider>{props.children}</TanstackQuery.Provider>;
		},
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
};
