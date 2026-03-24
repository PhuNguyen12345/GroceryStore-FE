import { create } from "zustand";
import {
	clearStorageItem,
	getStorageItem,
	setStorageItem,
} from "@/common/utils/storage";

const AUTH_STORAGE_KEY = "gs-auth";
const AUTH_STORAGE_TYPE = "session";

const ALLOWED_STAFF_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_STAFF", "CASHIER"];

function normalizeRole(role = "") {
	return String(role)
		.trim()
		.toUpperCase()
		.replace(/^ROLE_/, "")
		.replace(/\s+/g, "_");
}

function decodeJwtPayload(token = "") {
	try {
		const tokenParts = String(token).split(".");
		if (tokenParts.length < 2) return null;

		const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
		return JSON.parse(atob(padded));
	} catch {
		return null;
	}
}

function isTokenExpired(token = "") {
	const payload = decodeJwtPayload(token);
	const exp = Number(payload?.exp || 0);

	if (!exp) return true;
	return Date.now() >= exp * 1000;
}

function toAuthState(rawAuth = {}) {
	const token = String(rawAuth.token || "").trim();
	const user = rawAuth.user && typeof rawAuth.user === "object" ? rawAuth.user : null;
	const role = normalizeRole(rawAuth.role || user?.role || "");
	const isValidRole = ALLOWED_STAFF_ROLES.includes(role);
	const isAuthenticated = Boolean(token) && isValidRole && !isTokenExpired(token);

	return {
		token: isAuthenticated ? token : "",
		user: isAuthenticated ? user : null,
		role: isAuthenticated ? role : "",
		isAuthenticated,
	};
}

function saveAuthState(nextAuthState) {
	setStorageItem(AUTH_STORAGE_KEY, {
		token: nextAuthState.token,
		role: nextAuthState.role,
		user: nextAuthState.user,
	}, AUTH_STORAGE_TYPE);
}

const initialAuthState = toAuthState(getStorageItem(AUTH_STORAGE_KEY, {}, AUTH_STORAGE_TYPE));
if (!initialAuthState.isAuthenticated) {
	clearStorageItem(AUTH_STORAGE_KEY, AUTH_STORAGE_TYPE);
}

export const useAuthStore = create((set) => ({
	...initialAuthState,

	loginSuccess: ({ token, user, role }) => {
		const nextAuthState = toAuthState({ token, user, role });
		saveAuthState(nextAuthState);
		set(nextAuthState);
	},

	logout: () => {
		clearStorageItem(AUTH_STORAGE_KEY, AUTH_STORAGE_TYPE);
		set({
			token: "",
			user: null,
			role: "",
			isAuthenticated: false,
		});
	},

	hasRole: (roles = []) => {
		const roleCandidates = Array.isArray(roles) ? roles : [roles];
		return roleCandidates
			.map((candidate) => normalizeRole(candidate))
			.includes(normalizeRole(useAuthStore.getState().role));
	},

	isStaffRole: () => ALLOWED_STAFF_ROLES.includes(normalizeRole(useAuthStore.getState().role)),
}));

export { ALLOWED_STAFF_ROLES };
