import { create } from "zustand";
import {
	clearStorageItem,
	getStorageItem,
	setStorageItem,
} from "@/common/utils/storage";

const AUTH_STORAGE_KEY = "gs-auth";

const ALLOWED_STAFF_ROLES = ["CASHIER", "INVENTORY_STAFF", "ADMIN"];

function normalizeRole(role = "") {
	return String(role)
		.trim()
		.toUpperCase()
		.replace(/^ROLE_/, "")
		.replace(/\s+/g, "_");
}

function toAuthState(rawAuth = {}) {
	const token = String(rawAuth.token || "").trim();
	const user = rawAuth.user && typeof rawAuth.user === "object" ? rawAuth.user : null;
	const role = normalizeRole(rawAuth.role || user?.role || "");

	return {
		token,
		user,
		role,
		isAuthenticated: Boolean(token),
	};
}

function saveAuthState(nextAuthState) {
	setStorageItem(AUTH_STORAGE_KEY, {
		token: nextAuthState.token,
		role: nextAuthState.role,
		user: nextAuthState.user,
	});
}

const initialAuthState = toAuthState(getStorageItem(AUTH_STORAGE_KEY, {}));

export const useAuthStore = create((set) => ({
	...initialAuthState,

	loginSuccess: ({ token, user, role }) => {
		const nextAuthState = toAuthState({ token, user, role });
		saveAuthState(nextAuthState);
		set(nextAuthState);
	},

	logout: () => {
		clearStorageItem(AUTH_STORAGE_KEY);
		set({
			token: "",
			user: null,
			role: "",
			isAuthenticated: false,
		});
	},

	hasRole: (roles = []) => {
		const roleCandidates = Array.isArray(roles) ? roles : [roles];

		set((state) => state);

		return roleCandidates
			.map((candidate) => normalizeRole(candidate))
			.includes(normalizeRole(useAuthStore.getState().role));
	},

	isStaffRole: () => ALLOWED_STAFF_ROLES.includes(normalizeRole(useAuthStore.getState().role)),
}));

export { ALLOWED_STAFF_ROLES };
