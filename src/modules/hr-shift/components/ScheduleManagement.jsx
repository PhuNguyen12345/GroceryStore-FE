import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Modal, Row } from "react-bootstrap";
import { FaFilter, FaPlus, FaStream } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "react-bootstrap/Form";
import { employeeService } from "@/core/api/employeeService";
import { shiftService } from "@/core/api/shiftService";
import { workScheduleService } from "@/core/api/workScheduleService";
import {
  ATTENDANCE_OPTIONS,
  PAGE_SIZE,
  getErrorMessage,
  normalizePageResult,
} from "../utils/staffUtils";
import EntityPagination from "./EntityPagination";
import WorkScheduleTable from "./WorkScheduleTable";
import BulkScheduleCreation from "./BulkScheduleCreation";

export default function ScheduleManagement() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showBulkCreation, setShowBulkCreation] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    shiftId: "",
    workDate: "",
    manualAttendance: "",
    notes: "",
  });
  const [selectedDateCounts, setSelectedDateCounts] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });
  const [lookupEmployees, setLookupEmployees] = useState([]);
  const [lookupShifts, setLookupShifts] = useState([]);

  const clearToastAfter = (setter) => setTimeout(() => setter(""), 2500);

  useEffect(() => {
    setPage(0);
  }, [dateFilter, employeeFilter, shiftFilter, attendanceFilter]);

  const loadLookups = useCallback(async () => {
    try {
      const [employeeResult, shiftResult] = await Promise.all([
        employeeService.getAllEmployees(0, 200),
        shiftService.getAllShifts(0, 200),
      ]);

      setLookupEmployees(normalizePageResult(employeeResult).content || []);
      setLookupShifts(normalizePageResult(shiftResult).content || []);
    } catch {
      setLookupEmployees([]);
      setLookupShifts([]);
    }
  }, []);

  const loadSelectedDateCounts = useCallback(async () => {
    if (!dateFilter) {
      setSelectedDateCounts({ total: 0, present: 0, absent: 0 });
      return;
    }

    try {
      const [total, present, absent] = await Promise.all([
        workScheduleService.countByDate(dateFilter),
        workScheduleService.countPresentByDate(dateFilter),
        workScheduleService.countAbsentByDate(dateFilter),
      ]);

      setSelectedDateCounts({
        total: Number(total || 0),
        present: Number(present || 0),
        absent: Number(absent || 0),
      });
    } catch {
      setSelectedDateCounts({ total: 0, present: 0, absent: 0 });
    }
  }, [dateFilter]);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const hasFilter =
        Boolean(dateFilter) ||
        Boolean(employeeFilter) ||
        Boolean(shiftFilter) ||
        attendanceFilter !== "all";

      const result = hasFilter
        ? await workScheduleService.searchWorkSchedules({
            date: dateFilter,
            employeeId: employeeFilter,
            shiftId: shiftFilter,
            attendanceStatus:
              attendanceFilter === "all" ? "" : attendanceFilter,
            page: page,
            size: PAGE_SIZE,
          })
        : await workScheduleService.getAllWorkSchedules(page, PAGE_SIZE);

      const normalized = normalizePageResult(result);

      const filtered = normalized.content.filter((item) => {
        if (
          dateFilter &&
          String(item.workDate || item.date || "").slice(0, 10) !== dateFilter
        ) {
          return false;
        }
        if (
          employeeFilter &&
          String(item.employeeId || item.employee?.id || "") !==
            String(employeeFilter)
        ) {
          return false;
        }
        if (
          shiftFilter &&
          String(item.shiftId || item.shift?.id || "") !== String(shiftFilter)
        ) {
          return false;
        }

        const attendance = item.attendanceStatus || item.status || "PENDING";
        if (attendanceFilter !== "all" && attendance !== attendanceFilter) {
          return false;
        }

        return true;
      });

      const enriched = filtered.map((item) => {
        const currentShiftId = item.shiftId || item.shift?.id;
        const matchedShift = lookupShifts.find(
          (shift) => String(shift.id) === String(currentShiftId),
        );

        return {
          ...item,
          shiftStart:
            item.shiftStart ||
            item.shiftStartTime ||
            item.shift?.startTime ||
            matchedShift?.startTime,
          shiftEnd:
            item.shiftEnd ||
            item.shiftEndTime ||
            item.shift?.endTime ||
            matchedShift?.endTime,
        };
      });

      setSchedules(enriched);
      setTotalPages(normalized.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải lịch làm việc"));
    } finally {
      setLoading(false);
    }
  }, [attendanceFilter, dateFilter, employeeFilter, page, shiftFilter, lookupShifts]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    loadSelectedDateCounts();
  }, [loadSelectedDateCounts]);

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    setForm({
      employeeId: String(schedule?.employeeId || schedule?.employee?.id || ""),
      shiftId: String(schedule?.shiftId || schedule?.shift?.id || ""),
      workDate: String(schedule?.workDate || schedule?.date || "").slice(0, 10),
      manualAttendance:
        schedule == null
          ? ""
          : schedule?.isPresent === true
            ? "true"
            : schedule?.isPresent === false
              ? "false"
              : "",
      notes: schedule?.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.employeeId || !form.shiftId || !form.workDate) {
        setError("Vui lòng chọn nhân viên, ca làm và ngày làm việc");
        return;
      }

      const payload = {
        employeeId: Number(form.employeeId),
        shiftId: Number(form.shiftId),
        workDate: form.workDate,
        notes: form.notes.trim(),
      };

      if (editingSchedule) {
        if (form.manualAttendance === "makeup") {
          payload.isPresent = true;
        } else if (form.manualAttendance === "true") {
          payload.isPresent = true;
        } else if (form.manualAttendance === "false") {
          payload.isPresent = false;
        }
      }

      const scheduleKeyChanged =
        !editingSchedule ||
        String(
          editingSchedule?.employeeId || editingSchedule?.employee?.id || "",
        ) !== String(form.employeeId) ||
        String(editingSchedule?.shiftId || editingSchedule?.shift?.id || "") !==
          String(form.shiftId) ||
        String(editingSchedule?.workDate || editingSchedule?.date || "").slice(
          0,
          10,
        ) !== form.workDate;

      if (scheduleKeyChanged) {
        await workScheduleService.validateWorkSchedule(payload);
      }

      if (editingSchedule) {
        await workScheduleService.updateWorkSchedule(
          editingSchedule.id,
          payload,
        );
        setSuccess("Cập nhật lịch làm việc thành công");
      } else {
        await workScheduleService.createWorkSchedule(payload);
        setSuccess("Tạo lịch làm việc thành công");
      }

      setShowModal(false);
      setEditingSchedule(null);
      await loadSchedules();
      await loadSelectedDateCounts();
      clearToastAfter(setSuccess);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể lưu lịch làm việc"));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await workScheduleService.deleteWorkSchedule(deleteId);
      setSuccess("Xóa lịch làm việc thành công");
      setDeleteId(null);
      await loadSchedules();
      await loadSelectedDateCounts();
      clearToastAfter(setSuccess);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể xóa lịch làm việc"));
    }
  };

  const handleScheduleAction = async (action, successMessage) => {
    try {
      await action();
      setSuccess(successMessage);
      await loadSchedules();
      await loadSelectedDateCounts();
      clearToastAfter(setSuccess);
    } catch (err) {
      setError(getErrorMessage(err, "Không thể cập nhật lịch làm việc"));
    }
  };

  const isAttendanceLocked = Boolean(
    editingSchedule &&
    (editingSchedule?.checkInTime || editingSchedule?.checkOutTime),
  );

  return (
    <>
      <Row className="g-3 mb-4">
        <Col md={6} lg={4}>
          <Card className="admin-panel border-0 h-100">
            <Card.Body>
              <small className="text-muted">Tổng lịch theo ngày lọc</small>
              <h3 className="fw-bold mb-0">{selectedDateCounts.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="admin-panel border-0 h-100">
            <Card.Body>
              <small className="text-muted">Đi làm theo ngày lọc</small>
              <h3 className="fw-bold mb-0 text-success">
                {selectedDateCounts.present}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="admin-panel border-0 h-100">
            <Card.Body>
              <small className="text-muted">Vắng theo ngày lọc</small>
              <h3 className="fw-bold mb-0 text-danger">
                {selectedDateCounts.absent}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      <Card className="admin-panel border-0 mb-4">
        <Card.Body>
          <div className="row g-3 align-items-end">
            <div className="col-md-4 col-lg-2">
              <label className="form-label">Ngày làm việc</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
            </div>
            <div className="col-md-4 col-lg-3">
              <label className="form-label">Nhân viên</label>
              <Form.Select
                value={employeeFilter}
                onChange={(event) => setEmployeeFilter(event.target.value)}
              >
                <option value="">Tất cả nhân viên</option>
                {lookupEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName ||
                      employee.name ||
                      employee.username ||
                      employee.id}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4 col-lg-3">
              <label className="form-label">Ca làm</label>
              <Form.Select
                value={shiftFilter}
                onChange={(event) => setShiftFilter(event.target.value)}
              >
                <option value="">Tất cả ca</option>
                {lookupShifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4 col-lg-2">
              <label className="form-label">Điểm danh</label>
              <Form.Select
                value={attendanceFilter}
                onChange={(event) => setAttendanceFilter(event.target.value)}
              >
                <option value="all">Tất cả</option>
                {ATTENDANCE_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4 col-lg-2 d-grid">
              <Button
                variant="outline"
                onClick={() => {
                  setDateFilter("");
                  setEmployeeFilter("");
                  setShiftFilter("");
                  setAttendanceFilter("all");
                }}
              >
                <FaFilter className="me-2" /> Xóa bộ lọc
              </Button>
            </div>
            <div className="col-md-4 col-lg-2 d-grid">
              <Button onClick={() => openModal()}>
                <FaPlus className="me-2" /> Thêm lịch
              </Button>
            </div>
            <div className="col-md-4 col-lg-3 d-grid">
              <Button variant="success" onClick={() => setShowBulkCreation(true)} className="bg-success text-white">
                <FaStream className="me-2" /> Tạo lịch hàng loạt
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="admin-panel border-0">
        <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Danh sách lịch làm việc</h6>
          <Badge bg="light" text="dark">
            {schedules.length} bản ghi
          </Badge>
        </Card.Header>
        <Card.Body className="pt-1">
          <WorkScheduleTable
            schedules={schedules}
            loading={loading}
            page={page}
            onEdit={openModal}
            onDelete={setDeleteId}
            onCheckIn={(id) =>
              handleScheduleAction(
                () => workScheduleService.checkIn(id),
                "Check-in thành công",
              )
            }
            onCheckOut={(id) =>
              handleScheduleAction(
                () => workScheduleService.checkOut(id),
                "Check-out thành công",
              )
            }
            onPresent={(id) =>
              handleScheduleAction(
                () => workScheduleService.markPresent(id),
                "Đã đánh dấu đi làm",
              )
            }
            onAbsent={(id) =>
              handleScheduleAction(
                () => workScheduleService.markAbsent(id),
                "Đã đánh dấu vắng",
              )
            }
          />
        </Card.Body>
      </Card>

      <EntityPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSchedule ? "Cập nhật lịch làm việc" : "Thêm lịch làm việc"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          <div>
            <label className="form-label">Nhân viên</label>
            <Form.Select
              value={form.employeeId}
              disabled={isAttendanceLocked}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, employeeId: event.target.value }))
              }
            >
              <option value="">Chọn nhân viên</option>
              {lookupEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName ||
                    employee.name ||
                    employee.username ||
                    employee.id}
                </option>
              ))}
            </Form.Select>
          </div>
          <div>
            <label className="form-label">Ca làm việc</label>
            <Form.Select
              value={form.shiftId}
              disabled={isAttendanceLocked}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, shiftId: event.target.value }))
              }
            >
              <option value="">Chọn ca làm việc</option>
              {lookupShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </Form.Select>
          </div>
          <div>
            <label className="form-label">Ngày làm việc</label>
            <Input
              type="date"
              value={form.workDate}
              disabled={isAttendanceLocked}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, workDate: event.target.value }))
              }
            />
          </div>
          {editingSchedule && (
            <div>
              <label className="form-label">Đã điểm danh</label>
              <Form.Select
                value={form.manualAttendance}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    manualAttendance: event.target.value,
                  }))
                }
              >
                <option value="">Giữ nguyên trạng thái hiện tại</option>
                <option value="true">Có (đi làm)</option>
                <option value="false">Không (vắng)</option>
                <option value="makeup">Điểm danh bù</option>
              </Form.Select>
              <small className="text-muted d-block mt-1">
                Điểm danh bù sẽ được hiển thị khi đánh dấu đi làm thủ công mà
                không có giờ check-in.
              </small>
            </div>
          )}
          {isAttendanceLocked && (
            <small className="text-muted">
              Lịch đã có chấm công nên không thể đổi Nhân viên, Ca làm và Ngày
              làm.
            </small>
          )}
          <div>
            <label className="form-label">Ghi chú</label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
            />
          </div>

          {form.employeeId && (
            <small className="text-muted">
              {`Số ngày đã phân: ${selectedDateCounts.total} | `}
              {`Số ngày đã đi làm: ${selectedDateCounts.present}`}
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(deleteId)} onHide={() => setDeleteId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa lịch làm việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắc chắn muốn xóa lịch làm việc này?</Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showBulkCreation}
        onHide={() => setShowBulkCreation(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Tạo lịch làm việc hàng loạt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BulkScheduleCreation
            onSuccess={() => {
              setShowBulkCreation(false);
              loadSchedules();
              loadSelectedDateCounts();
            }}
            onCancel={() => setShowBulkCreation(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
