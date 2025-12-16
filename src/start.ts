import { createStart } from "@tanstack/react-start";
import { loggerMiddleware } from "./middlewares/logger";

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [loggerMiddleware],
	};
});
