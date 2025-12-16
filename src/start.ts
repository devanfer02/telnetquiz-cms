import { createStart } from "@tanstack/react-start";
import { apiKeyMiddleware } from "./middlewares/api-key";
import { loggerMiddleware } from "./middlewares/logger";

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [loggerMiddleware],
	};
});
