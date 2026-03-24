import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Col, Form, Row, Table } from "react-bootstrap";
import AdminLayout from "@/layouts/AdminLayout";
import { useAuthStore } from "@/core/store/useAuthStore";
import { employeeService } from "@/core/api/employeeService";
import { shiftService } from "@/core/api/shiftService";
import axiosClient from "@/core/api/axiosClient";

const SETTINGS_STORAGE_KEY = "gs-admin-settings";

function toDateInput(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeEmployeeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
}

function loadLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);

  const saved = loadLocalSettings();
  const [shopName, setShopName] = useState(saved?.shopName || "GroceryStore");
  const [supportEmail, setSupportEmail] = useState(saved?.supportEmail || "support@grocerystore.vn");
  const [timezone, setTimezone] = useState(saved?.timezone || "Asia/Bangkok");
  const [settingsSaved, setSettingsSaved] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [sessionProfile, setSessionProfile] = useState(null);
  const [systemStats, setSystemStats] = useState({
    activeEmployees: 0,
    activeShifts: 0,
    schedulesToday: 0,
    presentToday: 0,
    absentToday: 0,
  });

  const employeeId = authUser?.id || authUser?.employeeId || null;
  const usernameFromUser = String(authUser?.username || "").trim();
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
  const effectiveUsername = usernameFromUser || usernameFromToken;

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const today = toDateInput(new Date());

        const sessionProfilePromise = employeeId
          ? employeeService.getEmployeeById(employeeId).catch(() => null)
          : effectiveUsername
            ? employeeService.getEmployeeByUsername(effectiveUsername).catch(() => null)
            : Promise.resolve(null);

        const [employeeListRaw, shiftListRaw, dailyStats, sessionDetail] = await Promise.all([
          employeeService.getAllEmployees(0, 500),
          shiftService.getAllShifts(0, 500),
          axiosClient.get("/work-schedules/stats/daily", { params: { date: today } }).then((res) => res.data),
          sessionProfilePromise,
        ]);

        if (!mounted) return;

        const employeeList = normalizeEmployeeList(employeeListRaw);
        const shiftList = Array.isArray(shiftListRaw) ? shiftListRaw : [];

        setSystemStats({
          activeEmployees: employeeList.filter((item) => item?.isActive).length,
          activeShifts: shiftList.filter((item) => item?.isActive).length,
          schedulesToday: Number(dailyStats?.scheduled || 0),
          presentToday: Number(dailyStats?.present || 0),
          absentToday: Number(dailyStats?.absent || 0),
        });
        setEmployees(employeeList);
        setSessionProfile(
          sessionDetail || {
            id: employeeId || null,
            username: effectiveUsername || authUser?.username || "",
            fullName: authUser?.fullName || "",
            role: authRole || authUser?.role || "",
          },
        );
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || "Không tải được dữ liệu cài đặt.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [employeeId, effectiveUsername, authRole, authUser?.fullName, authUser?.role, authUser?.username]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "ALL") return employees;
    return employees.filter((item) => String(item?.role || "").toUpperCase() === roleFilter);
  }, [employees, roleFilter]);

  const roleOptions = useMemo(
    () => Array.from(new Set(employees.map((item) => String(item?.role || "").toUpperCase()).filter(Boolean))),
    [employees],
  );

  const saveLocalSettings = () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        shopName: shopName.trim(),
        supportEmail: supportEmail.trim(),
        timezone,
      }),
    );
    setSettingsSaved("Đã lưu cài đặt cục bộ thành công.");
    setTimeout(() => setSettingsSaved(""), 2000);
  };

  return (
    <AdminLayout>
      <div className="admin-page-heading mb-4">
        <div className="admin-page-heading-text">
          <h2 className="fw-bold mb-1">Cài đặt hệ thống</h2>
          <p className="text-muted mb-0">Theo dõi trạng thái vận hành và cấu hình quản trị.</p>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mb-3">
          {error}
        </Alert>
      ) : null}
      {settingsSaved ? <Alert variant="success">{settingsSaved}</Alert> : null}

      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Thông tin cửa hàng</h5>
              <Form>
                <Form.Group className="mb-3" controlId="shopName">
                  <Form.Label>Tên cửa hàng</Form.Label>
                  <Form.Control
                    type="text"
                    value={shopName}
                    onChange={(event) => setShopName(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="supportEmail">
                  <Form.Label>Email hỗ trợ</Form.Label>
                  <Form.Control
                    type="email"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="shopTimezone">
                  <Form.Label>Múi giờ hệ thống</Form.Label>
                  <Form.Select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="UTC">UTC</option>
                  </Form.Select>
                </Form.Group>

                <button type="button" className="btn btn-success" onClick={saveLocalSettings}>
                  Lưu cài đặt
                </button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Thông tin phiên đăng nhập</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Tài khoản</span>
                  <Badge bg="primary">
                    {sessionProfile?.username || authUser?.username || effectiveUsername || "Không rõ"}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Họ tên</span>
                  <Badge bg="dark">{sessionProfile?.fullName || authUser?.fullName || "Không rõ"}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Vai trò</span>
                  <Badge bg="info">{sessionProfile?.role || authRole || authUser?.role || "Không rõ"}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Nhân sự đang hoạt động</span>
                  <Badge bg="success">
                    {loading ? "..." : Number(systemStats.activeEmployees || 0).toLocaleString("vi-VN")}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Ca làm đang mở</span>
                  <Badge bg="secondary">
                    {loading ? "..." : Number(systemStats.activeShifts || 0).toLocaleString("vi-VN")}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={12}>
          <div className="admin-panel p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 className="mb-0">Thống kê chấm công hôm nay</h5>
              <Badge bg="light" text="dark">
                {toDateInput(new Date())}
              </Badge>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Badge bg="primary" className="px-3 py-2">
                Lịch làm: {loading ? "..." : Number(systemStats.schedulesToday || 0).toLocaleString("vi-VN")}
              </Badge>
              <Badge bg="success" className="px-3 py-2">
                Có mặt: {loading ? "..." : Number(systemStats.presentToday || 0).toLocaleString("vi-VN")}
              </Badge>
              <Badge bg="danger" className="px-3 py-2">
                Vắng: {loading ? "..." : Number(systemStats.absentToday || 0).toLocaleString("vi-VN")}
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      <div className="admin-panel p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="mb-0">Danh sách nhân sự</h5>
          <Form.Select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            style={{ width: 220 }}
          >
            <option value="ALL">Tất cả vai trò</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Form.Select>
        </div>

        <Table responsive hover className="align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Nhân sự</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Đang tải...
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((user, index) => (
                <tr key={user?.id || `${user?.username}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{user?.fullName || user?.username || "-"}</td>
                  <td>{String(user?.role || "").toUpperCase() || "-"}</td>
                  <td>{user?.email || "-"}</td>
                  <td>
                    <Badge bg={user?.isActive ? "success" : "secondary"}>
                      {user?.isActive ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Không có dữ liệu nhân sự.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </AdminLayout>
  );
}
