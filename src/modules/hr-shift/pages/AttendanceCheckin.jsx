import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { FaCalendarCheck, FaClock, FaRegCalendarAlt, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/common/hooks/useAuth";
import { attendanceService } from "@/core/api/attendanceService";
import { calculateAttendanceStatus, getErrorMessage } from "@/modules/hr-shift/utils/staffUtils";

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function formatDate(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("vi-VN");
}

function formatDateTime(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString("vi-VN");
}

function getStatusDisplay(item) {
  const attendanceInfo = calculateAttendanceStatus(item);
  return attendanceInfo;
}

export default function AttendanceCheckinPage() {
  const { role } = useAuth();
  const normalizedRole = String(role || "").toUpperCase().replace(/^ROLE_/, "");
  const canViewManagerReport = normalizedRole === "ADMIN" || normalizedRole === "STORE_MANAGER";

  const [todaySchedule, setTodaySchedule] = useState(null);
  const [history, setHistory] = useState([]);
  const [reportDate, setReportDate] = useState(todayInput());
  const [dailyReport, setDailyReport] = useState(null);

  const [fromDate, setFromDate] = useState(monthStartInput());
  const [toDate, setToDate] = useState(todayInput());

  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearNoticeLater = (setter) => {
    window.setTimeout(() => setter(""), 2200);
  };

  const loadToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await attendanceService.getMyTodaySchedule();
      setTodaySchedule(data || null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setTodaySchedule(null);
      } else {
        setError(getErrorMessage(err, "Không tải được lịch làm hôm nay"));
      }
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!fromDate || !toDate) return;

    setLoadingHistory(true);
    try {
      const data = await attendanceService.getMySchedulesInRange(fromDate, toDate);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistory([]);
      setError(getErrorMessage(err, "Không tải được lịch chấm công"));
    } finally {
      setLoadingHistory(false);
    }
  }, [fromDate, toDate]);

  const loadDailyReport = useCallback(async () => {
    if (!canViewManagerReport || !reportDate) return;

    setLoadingReport(true);
    try {
      const data = await attendanceService.getDailyReport(reportDate);
      setDailyReport(data || null);
    } catch (err) {
      setDailyReport(null);
      setError(getErrorMessage(err, "Không tải được báo cáo điểm danh ngày"));
    } finally {
      setLoadingReport(false);
    }
  }, [canViewManagerReport, reportDate]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (canViewManagerReport) {
      loadDailyReport();
    }
  }, [canViewManagerReport, loadDailyReport]);

  const stats = useMemo(() => {
    const total = history.length;
    const present = history.filter((item) => item?.status === "PRESENT").length;
    const late = history.filter((item) => item?.status === "LATE").length;
    const absent = history.filter((item) => item?.status === "ABSENT").length;
    return { total, present, late, absent };
  }, [history]);

  const canClockIn = Boolean(todaySchedule) && !todaySchedule?.checkInTime && !actionLoading;
  const canClockOut = Boolean(todaySchedule?.checkInTime) && !todaySchedule?.checkOutTime && !actionLoading;

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      await attendanceService.clockIn();
      setSuccess("Điểm danh vào ca thành công");
      await Promise.all([loadToday(), loadHistory(), loadDailyReport()]);
      clearNoticeLater(setSuccess);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể điểm danh vào ca"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      await attendanceService.clockOut();
      setSuccess("Điểm danh ra ca thành công");
      await Promise.all([loadToday(), loadHistory(), loadDailyReport()]);
      clearNoticeLater(setSuccess);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể điểm danh ra ca"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-heading mb-4">
        <div className="admin-page-heading-text">
          <h2 className="fw-bold mb-1">Chấm công nhân viên</h2>
          <p className="text-muted mb-0">Xem ca làm được phân công, điểm danh vào ca và kết thúc ca làm.</p>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" onClose={() => setError("")} dismissible className="mb-3">
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible className="mb-3">
          {success}
        </Alert>
      ) : null}

      <Row className="g-3 mb-4">
        <Col xl={7}>
          <Card className="admin-panel border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <FaCalendarCheck /> Lịch hôm nay
                </h5>
                {loadingToday ? <Spinner animation="border" size="sm" /> : null}
              </div>

              {!loadingToday && !todaySchedule ? (
                <Alert variant="info" className="mb-0">
                  Hôm nay chưa có ca làm được phân công.
                </Alert>
              ) : null}

              {todaySchedule ? (
                <>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <div className="small text-muted">Ngày làm</div>
                      <div className="fw-semibold">{formatDate(todaySchedule.workDate)}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted">Ca làm</div>
                      <div className="fw-semibold">{todaySchedule.shiftName || "-"}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted">Giờ bắt đầu</div>
                      <div className="fw-semibold">{todaySchedule.shiftStart || "-"}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted">Giờ kết thúc</div>
                      <div className="fw-semibold">{todaySchedule.shiftEnd || "-"}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted">Check-in</div>
                      <div className="fw-semibold">{formatDateTime(todaySchedule.checkInTime)}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted">Check-out</div>
                      <div className="fw-semibold">{formatDateTime(todaySchedule.checkOutTime)}</div>
                    </Col>
                  </Row>

                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    {(() => {
                      const statusInfo = getStatusDisplay(todaySchedule);
                      return <Badge bg={statusInfo.variant}>{statusInfo.status}</Badge>;
                    })()}
                    {todaySchedule?.isPresent ? <Badge bg="success">Đã ghi nhận đi làm</Badge> : null}
                  </div>

                  <div className="d-flex gap-2">
                    <Button onClick={handleClockIn} disabled={!canClockIn}>
                      <FaSignInAlt className="me-2" />
                      {actionLoading && canClockIn ? "Đang xử lý..." : "Điểm danh vào ca"}
                    </Button>
                    <Button variant="outline" onClick={handleClockOut} disabled={!canClockOut}>
                      <FaSignOutAlt className="me-2" />
                      {actionLoading && canClockOut ? "Đang xử lý..." : "Điểm danh ra ca"}
                    </Button>
                  </div>
                </>
              ) : null}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="admin-panel border-0 h-100">
            <Card.Body>
              <h5 className="mb-3 d-flex align-items-center gap-2">
                <FaClock /> Tổng quan kỳ đang xem
              </h5>

              <Row className="g-3">
                <Col sm={6}>
                  <div className="admin-kpi-card">
                    <h6>Tổng ca</h6>
                    <h3>{stats.total}</h3>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="admin-kpi-card">
                    <h6>Đúng giờ</h6>
                    <h3>{stats.present}</h3>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="admin-kpi-card">
                    <h6>Đi trễ</h6>
                    <h3>{stats.late}</h3>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="admin-kpi-card">
                    <h6>Vắng</h6>
                    <h3>{stats.absent}</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="admin-panel border-0 mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
            <div>
              <label className="form-label mb-1">Từ ngày</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="form-label mb-1">Đến ngày</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <Button onClick={loadHistory}>
              <FaRegCalendarAlt className="me-2" /> Lọc lịch
            </Button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : history.length === 0 ? (
            <Alert variant="info" className="mb-0">Không có lịch làm trong khoảng thời gian đã chọn.</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Ngày làm</th>
                    <th>Ca làm</th>
                    <th>Giờ ca</th>
                    <th>Trạng thái</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const statusInfo = getStatusDisplay(item);
                    return (
                      <tr key={item.scheduleId}>
                        <td>{formatDate(item.workDate)}</td>
                        <td>{item.shiftName || "-"}</td>
                        <td>{item.shiftStart || "-"} - {item.shiftEnd || "-"}</td>
                        <td>
                          <Badge bg={statusInfo.variant}>{statusInfo.status}</Badge>
                        </td>
                        <td>{formatDateTime(item.checkInTime)}</td>
                        <td>{formatDateTime(item.checkOutTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {canViewManagerReport ? (
        <Card className="admin-panel border-0">
          <Card.Body>
            <div className="d-flex flex-wrap justify-content-between gap-2 align-items-end mb-3">
              <h5 className="mb-0">Báo cáo điểm danh theo ngày (Manager/Admin)</h5>
              <div className="d-flex gap-2 align-items-end">
                <div>
                  <label className="form-label mb-1">Ngày báo cáo</label>
                  <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                </div>
                <Button onClick={loadDailyReport}>Xem báo cáo</Button>
              </div>
            </div>

            {loadingReport ? (
              <div className="text-center py-3"><Spinner animation="border" /></div>
            ) : dailyReport ? (
              <>
                <Row className="g-3 mb-3">
                  <Col md={2}><div className="admin-kpi-card"><h6>Scheduled</h6><h3>{dailyReport.totalScheduled || 0}</h3></div></Col>
                  <Col md={2}><div className="admin-kpi-card"><h6>Present</h6><h3>{dailyReport.totalPresent || 0}</h3></div></Col>
                  <Col md={2}><div className="admin-kpi-card"><h6>Late</h6><h3>{dailyReport.totalLate || 0}</h3></div></Col>
                  <Col md={2}><div className="admin-kpi-card"><h6>Absent</h6><h3>{dailyReport.totalAbsent || 0}</h3></div></Col>
                  <Col md={2}><div className="admin-kpi-card"><h6>Not yet</h6><h3>{dailyReport.totalNotYet || 0}</h3></div></Col>
                </Row>

                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Nhân viên</th>
                        <th>Ca</th>
                        <th>Giờ ca</th>
                        <th>Trạng thái</th>
                        <th>Đi trễ (phút)</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dailyReport.entries || []).map((entry) => {
                        const statusInfo = getStatusDisplay(entry);
                        return (
                          <tr key={entry.scheduleId}>
                            <td>{entry.employeeFullName || entry.employeeUsername || "-"}</td>
                            <td>{entry.shiftName || "-"}</td>
                            <td>{entry.shiftStart || "-"} - {entry.shiftEnd || "-"}</td>
                            <td><Badge bg={statusInfo.variant}>{statusInfo.status}</Badge></td>
                            <td>{entry.minutesLate ?? "-"}</td>
                            <td>{formatDateTime(entry.checkInTime)}</td>
                            <td>{formatDateTime(entry.checkOutTime)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <Alert variant="info" className="mb-0">Chưa có dữ liệu báo cáo cho ngày đã chọn.</Alert>
            )}
          </Card.Body>
        </Card>
      ) : null}
    </AdminLayout>
  );
}
