import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/common/hooks/useAuth";

export default function PrivateRoutes({ allowedRoles = [] }) {
	const location = useLocation();
	const { isAuthenticated, hasRole } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
		return <Navigate to="/login" replace state={{ from: location, unauthorized: true }} />;
	}

	return <Outlet />;
}
