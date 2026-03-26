import { useEffect, useMemo, useState } from "react";
import { Navbar, Container, Nav, Dropdown, Spinner, Modal, Badge } from "react-bootstrap";
import { FaUser, FaBell, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/core/store/useAuthStore";
import { inventoryService } from "@/core/api/inventoryService";
import axiosClient from "@/core/api/axiosClient";

const NOTI_READ_STORAGE_KEY = "gs-admin-notifications-read";

function toDateInput(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadReadMap() {
  try {
    const raw = localStorage.getItem(NOTI_READ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveReadMap(nextMap) {
  localStorage.setItem(NOTI_READ_STORAGE_KEY, JSON.stringify(nextMap));
}

function getPriorityMeta(priority) {
  if (priority === "high") return { label: "Cao", tone: "danger", order: 1 };
  if (priority === "medium") return { label: "Trung bình", tone: "warning", order: 2 };
  return { label: "Thấp", tone: "secondary", order: 3 };
}

function sortByPriority(a, b) {
  const left = getPriorityMeta(a.priority).order;
  const right = getPriorityMeta(b.priority).order;
  return left - right;
}

export default function AdminHeader() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const role = String(useAuthStore((state) => state.role) || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
  const canAccessSettings = role === "ADMIN";
  const canReadInventoryStats = role === "ADMIN" || role === "STORE_MANAGER" || role === "INVENTORY_STAFF";

  const roleHomePath =
    role === "INVENTORY_STAFF"
      ? "/admin/inventory"
      : role === "CASHIER"
        ? "/orders"
        : "/admin";

  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [showAllNoti, setShowAllNoti] = useState(false);
  const [readMap, setReadMap] = useState(() => loadReadMap());

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = String(user?.fullName || user?.username || "").trim();
  const avatarText = (displayName.charAt(0).toUpperCase() || "U").slice(0, 1);

  const markAsRead = (id) => {
    setReadMap((prev) => {
      const next = { ...prev, [id]: Date.now() };
      saveReadMap(next);
      return next;
    });
  };

  const markAllAsRead = () => {
    setReadMap((prev) => {
      const next = { ...prev };
      notifications.forEach((item) => {
        next[item.id] = Date.now();
      });
      saveReadMap(next);
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        setLoadingNoti(true);
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const todayText = toDateInput(today);
        const in30DaysText = toDateInput(in30Days);
        const canReadHrStats = role === "ADMIN";

        const [txToday, expiringSoon, dailyStats] = await Promise.all([
          canReadInventoryStats
            ? inventoryService.getTransactions({
                fromDate: todayText,
                toDate: todayText,
                page: 0,
                size: 1,
                sortBy: "createdAt",
                sortDir: "DESC",
              })
            : Promise.resolve(null),
          canReadInventoryStats
            ? inventoryService.getBatches({
                fromExpiryDate: todayText,
                toExpiryDate: in30DaysText,
                page: 0,
                size: 1,
              })
            : Promise.resolve(null),
          canReadHrStats
            ? axiosClient.get("/work-schedules/stats/daily", { params: { date: todayText } }).then((res) => res.data)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;

        const list = [];
        const transactionsToday = Number(txToday?.totalElements || 0);
        const expiringSoonTotal = Number(expiringSoon?.totalElements || 0);
        const absentToday = Number(dailyStats?.absent || 0);

        if (canReadHrStats && absentToday > 0) {
          list.push({
            id: `absent-staff-${todayText}`,
            priority: "high",
            text: `Hôm nay có ${absentToday} nhân sự vắng mặt.`,
            path: "/admin/settings",
          });
        }

        if (canReadInventoryStats && expiringSoonTotal > 0) {
          list.push({
            id: `expiring-batches-${todayText}`,
            priority: "high",
            text: `Có ${expiringSoonTotal} lô hàng sắp hết hạn trong 30 ngày.`,
            path: "/admin/inventory/batches",
            navState: { fromExpiryDate: todayText, toExpiryDate: in30DaysText },
          });
        }

        if (canReadInventoryStats && transactionsToday > 0) {
          list.push({
            id: `tx-today-${todayText}`,
            priority: "medium",
            text: `Hôm nay có ${transactionsToday} giao dịch kho mới.`,
            path: "/admin/inventory/transactions",
            navState: { fromDate: todayText, toDate: todayText },
          });
        }

        if (list.length === 0) {
          list.push({
            id: `all-good-${todayText}`,
            priority: "low",
            text: "Không có cảnh báo mới.",
            path: roleHomePath,
          });
        }

        setNotifications(list.sort(sortByPriority));
      } catch {
        if (!mounted) return;
        setNotifications([
          {
            id: `noti-error-${Date.now()}`,
            priority: "low",
            text: "Không tải được thông báo lúc này.",
            path: roleHomePath,
          },
        ]);
      } finally {
        if (mounted) setLoadingNoti(false);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [role]);

  const notificationsWithReadState = useMemo(
    () =>
      notifications.map((item) => ({
        ...item,
        isRead: Boolean(readMap[item.id]),
      })),
    [notifications, readMap],
  );

  const unreadCount = useMemo(
    () => notificationsWithReadState.filter((item) => !item.isRead && !item.id.startsWith("all-good-")).length,
    [notificationsWithReadState],
  );

  const groupedNotifications = useMemo(() => {
    const groups = {
      high: [],
      medium: [],
      low: [],
    };
    notificationsWithReadState.forEach((item) => {
      groups[item.priority]?.push(item);
    });
    return groups;
  }, [notificationsWithReadState]);

  const handleOpenNotification = (item) => {
    markAsRead(item.id);
    navigate(item.path, { state: item.navState });
  };

  return (
    <>
      <Navbar expand="lg" className="admin-topbar px-2" sticky="top">
        <Container fluid>
          <div>
            <div className="fw-semibold text-dark">Trang quản trị</div>
            <small className="text-muted">Quản lý dữ liệu và vận hành cửa hàng</small>
          </div>

          <Navbar.Toggle aria-controls="admin-header-nav" />

          <Navbar.Collapse id="admin-header-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  className="position-relative text-dark border-0 bg-transparent p-0 d-inline-flex align-items-center justify-content-center admin-no-caret"
                  id="dropdown-notifications"
                >
                  <FaBell size={17} />
                  {unreadCount > 0 ? (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "10px" }}
                    >
                      {unreadCount}
                    </span>
                  ) : null}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ minWidth: 380 }}>
                  <div className="d-flex justify-content-between align-items-center px-3 pt-2 pb-1">
                    <Dropdown.Header className="p-0">Thông báo</Dropdown.Header>
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={markAllAsRead}
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>

                  {loadingNoti ? (
                    <div className="px-3 py-3 text-muted d-flex align-items-center gap-2">
                      <Spinner size="sm" animation="border" />
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    notificationsWithReadState.map((item) => {
                      const priority = getPriorityMeta(item.priority);
                      return (
                        <Dropdown.Item
                          key={item.id}
                          as="button"
                          type="button"
                          className="d-flex align-items-start gap-2 py-2"
                          onClick={() => handleOpenNotification(item)}
                        >
                          <span
                            className={`badge bg-${priority.tone}`}
                            style={{ minWidth: 10, minHeight: 10, borderRadius: 9999 }}
                          />
                          <span style={{ whiteSpace: "normal", opacity: item.isRead ? 0.7 : 1 }}>
                            {item.text}
                          </span>
                          {!item.isRead ? (
                            <span className="badge bg-danger-subtle text-danger ms-auto">Mới</span>
                          ) : null}
                        </Dropdown.Item>
                      );
                    })
                  )}

                  <Dropdown.Divider className="my-1" />
                  <Dropdown.Item
                    as="button"
                    type="button"
                    className="text-primary fw-semibold"
                    onClick={() => setShowAllNoti(true)}
                  >
                    Xem tất cả thông báo
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {canAccessSettings ? (
                <Nav.Link
                  as="button"
                  className="text-dark border-0 bg-transparent"
                  onClick={() => navigate("/admin/settings")}
                >
                  <FaCog size={17} />
                </Nav.Link>
              ) : null}

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-user"
                  className="d-flex align-items-center border bg-white"
                >
                  <div
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                    style={{ width: "30px", height: "30px", fontWeight: 700, fontSize: 13 }}
                  >
                    {avatarText || <FaUser size={13} />}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as="button" type="button" onClick={() => navigate("/admin/profile")}>
                    Hồ sơ
                  </Dropdown.Item>
                  {canAccessSettings ? (
                    <Dropdown.Item as="button" type="button" onClick={() => navigate("/admin/settings")}>
                      Cài đặt
                    </Dropdown.Item>
                  ) : null}
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" type="button" className="text-danger" onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showAllNoti} onHide={() => setShowAllNoti(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tất cả thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {["high", "medium", "low"].map((level) => {
            const items = groupedNotifications[level];
            if (!items?.length) return null;
            const meta = getPriorityMeta(level);
            return (
              <div key={level} className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg={meta.tone}>{meta.label}</Badge>
                  <small className="text-muted">{items.length} thông báo</small>
                </div>
                <div className="d-grid gap-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="btn btn-light text-start border"
                      onClick={() => {
                        handleOpenNotification(item);
                        setShowAllNoti(false);
                      }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <span
                          className={`badge bg-${meta.tone}`}
                          style={{ minWidth: 10, minHeight: 10, borderRadius: 9999 }}
                        />
                        <span style={{ opacity: item.isRead ? 0.75 : 1 }}>{item.text}</span>
                        {!item.isRead ? (
                          <Badge bg="danger" className="ms-auto">
                            Mới
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </Modal.Body>
      </Modal>
    </>
  );
}
