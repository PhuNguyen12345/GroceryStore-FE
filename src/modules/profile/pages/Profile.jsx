import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/core/store/useAuthStore";
import { employeeService } from "@/core/api/employeeService";

function buildFallbackProfile(authUser, authRole, employeeId) {
  return {
    id: employeeId || authUser?.employeeId || authUser?.id || null,
    username: authUser?.username || "-",
    fullName: authUser?.fullName || "-",
    email: authUser?.email || "-",
    phone: authUser?.phone || "-",
    role: authRole || authUser?.role || "-",
    isActive: true,
    createdAt: null,
  };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const employeeId = authUser?.id || authUser?.employeeId || null;
  const username = String(authUser?.username || "").trim();

  const usernameFromToken = useMemo(() => {
    try {
      const raw = String(token || "");
      if (!raw.includes(".")) return "";
      const payload = raw.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const decoded = JSON.parse(atob(padded));
      return String(decoded?.sub || "").trim();
    } catch {
      return "";
    }
  }, [token]);

  const effectiveUsername = username || usernameFromToken;

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        let detail = null;
        if (employeeId) {
          detail = await employeeService.getEmployeeById(employeeId);
        } else if (effectiveUsername) {
          detail = await employeeService.getEmployeeByUsername(effectiveUsername);
        }

        if (!mounted) return;

        if (!detail) {
          setProfile(buildFallbackProfile(authUser, authRole, employeeId));
          return;
        }

        setProfile({
          id: detail?.id ?? employeeId ?? null,
          username: detail?.username || authUser?.username || "-",
          fullName: detail?.fullName || authUser?.fullName || "-",
          email: detail?.email || authUser?.email || "-",
          phone: detail?.phone || authUser?.phone || "-",
          role: detail?.role || authRole || authUser?.role || "-",
          isActive: detail?.isActive,
          createdAt: detail?.createdAt || null,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || "Không tải được thông tin hồ sơ.");
        setProfile(buildFallbackProfile(authUser, authRole, employeeId));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [employeeId, effectiveUsername, authUser, authRole]);

  const initials = useMemo(() => {
    const name = String(profile?.fullName || authUser?.fullName || "").trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [profile?.fullName, authUser?.fullName]);

  return (
    <AdminLayout>
      <div className="admin-page-heading mb-4">
        <div className="admin-page-heading-text">
          <h2 className="fw-bold mb-1">Hồ sơ cá nhân</h2>
          <p className="text-muted mb-0">Thông tin tài khoản đang đăng nhập hệ thống quản trị.</p>
        </div>
      </div>

      {error ? (
        <Alert variant="warning" className="mb-3" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center text-center">
              <div
                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mb-3"
                style={{ width: 90, height: 90, fontSize: 28, fontWeight: 700 }}
              >
                {initials}
              </div>
              <h5 className="mb-1">{loading ? "Đang tải..." : profile?.fullName || "-"}</h5>
              <p className="text-muted mb-2">@{loading ? "..." : profile?.username || "-"}</p>
              <Badge bg={profile?.isActive === false ? "secondary" : "success"}>
                {profile?.isActive === false ? "Tạm khóa" : "Hoạt động"}
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Chi tiết tài khoản</h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-muted small">Vai trò</div>
                  <div className="fw-semibold">{loading ? "..." : profile?.role || "-"}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Email</div>
                  <div className="fw-semibold">{loading ? "..." : profile?.email || "-"}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Số điện thoại</div>
                  <div className="fw-semibold">{loading ? "..." : profile?.phone || "-"}</div>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/admin/settings")}>
                  Mở cài đặt
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}
