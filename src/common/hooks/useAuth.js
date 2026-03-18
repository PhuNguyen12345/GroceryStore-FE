import { useAuthStore } from "@/core/store/useAuthStore";

export function useAuth() {
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);
	const role = useAuthStore((state) => state.role);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const loginSuccess = useAuthStore((state) => state.loginSuccess);
	const logout = useAuthStore((state) => state.logout);

	const hasRole = (roles = []) => {
		const roleCandidates = Array.isArray(roles) ? roles : [roles];
		const normalizedCurrentRole = String(role || "")
			.trim()
			.toUpperCase()
			.replace(/^ROLE_/, "")
			.replace(/\s+/g, "_");

		return roleCandidates
			.map((candidate) =>
				String(candidate || "")
					.trim()
					.toUpperCase()
					.replace(/^ROLE_/, "")
					.replace(/\s+/g, "_")
			)
			.includes(normalizedCurrentRole);
	};

	return {
		token,
		user,
		role,
		isAuthenticated,
		hasRole,
		loginSuccess,
		logout,
	};
}
