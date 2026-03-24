import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/common/hooks/useAuth";

function normalizeRole(role = "") {
	return String(role).trim().toUpperCase().replace(/^ROLE_/, "");
}

function getRoleHomePath(role = "") {
	const normalized = normalizeRole(role);
	if (normalized === "INVENTORY_STAFF") return "/admin/inventory";
	if (normalized === "CASHIER") return "/orders";
	return "/admin";
}

export default function PrivateRoutes({ allowedRoles = [] }) {
	const location = useLocation();
	const { isAuthenticated, hasRole, role } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
		return <Navigate to={getRoleHomePath(role)} replace state={{ unauthorized: true }} />;
	}

	return <Outlet />;
}
