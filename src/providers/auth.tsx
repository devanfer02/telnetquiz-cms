import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/lib/auth-client";

type AuthContextValue = {
	session: {
		user: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			email: string;
			emailVerified: boolean;
			name: string;
			image?: string | null | undefined;
		};
		session: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			userId: string;
			expiresAt: Date;
			token: string;
			ipAddress?: string | null | undefined;
			userAgent?: string | null | undefined;
		};
	} | null;
	isPending: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending } = authClient.useSession();

	return (
		<AuthContext.Provider value={{ session, isPending }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return ctx;
}
