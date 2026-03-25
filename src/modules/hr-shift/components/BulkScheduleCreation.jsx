import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Form, Modal, ProgressBar, Row, Spinner } from "react-bootstrap";
import { FaCheck, FaChevronDown, FaChevronUp, FaClock, FaTimes, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { employeeService } from "@/core/api/employeeService";
import { shiftService } from "@/core/api/shiftService";
import { workScheduleService } from "@/core/api/workScheduleService";
import { getErrorMessage, normalizePageResult } from "../utils/staffUtils";

const getDaysInRange = (startDate, endDate) => {
  const days = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    days.push(new Date(current).toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
};

const getWeekdays = (startDate) => {
  const start = new Date(startDate);
  const days = [];

  // Find Monday of the week
  const monday = new Date(start);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  // Get Monday to Friday
  for (let i = 0; i < 5; i++) {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    days.push(day.toISOString().split("T")[0]);
  }

  return days;
};

const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("vi-VN", { weekday: "short", month: "2-digit", day: "2-digit", year: "numeric" });
};

const getDayName = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
};

export default function BulkScheduleCreation({ onSuccess, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [rangeMode, setRangeMode] = useState("week"); // 'week', 'range', 'custom'
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [allDaysForPreview, setAllDaysForPreview] = useState([]);

  // Progress state
  const [creating, setCreating] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState(0);
  const [creatingTotal, setCreatingTotal] = useState(0);
  const [creationResults, setCreationResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [expandedPreview, setExpandedPreview] = useState(true);

  const generateDaysPreview = useCallback(() => {
    let days = [];

    if (rangeMode === "week") {
      days = getWeekdays(startDate);
    } else if (rangeMode === "range") {
      days = getDaysInRange(startDate, endDate);
    }

    setAllDaysForPreview(days);
  }, [rangeMode, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateDaysPreview();
  }, [generateDaysPreview]);

  useEffect(() => {
    if (rangeMode === "week") {
      setSelectedDays(getWeekdays(startDate));
    } else if (rangeMode === "range") {
      setSelectedDays(getDaysInRange(startDate, endDate));
    }
  }, [rangeMode, startDate, endDate]);

  const loadData = async () => {
    try {
      const [empResult, shiftResult] = await Promise.all([
        employeeService.getAllEmployees(0, 200),
        shiftService.getAllShifts(0, 200),
      ]);

      const empList = normalizePageResult(empResult).content || [];
      const shiftList = normalizePageResult(shiftResult).content || [];

      setEmployees(empList.filter((emp) => emp.isActive));
      setShifts(shiftList.filter((s) => s.isActive));
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải dữ liệu"));
    }
  };

  const handleToggleDay = (day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedDays([...allDaysForPreview]);
  };

  const handleClearAll = () => {
    setSelectedDays([]);
  };

  const canCreateSchedules = selectedEmployee && selectedShift && selectedDays.length > 0;

  const handleCreateSchedules = async () => {
    if (!canCreateSchedules) {
      setError("Vui lòng chọn nhân viên, ca làm và ít nhất một ngày");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");
      setCreationResults([]);
      setCreatingProgress(0);
      setCreatingTotal(selectedDays.length);

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < selectedDays.length; i++) {
        const day = selectedDays[i];
        try {
          const payload = {
            employeeId: Number(selectedEmployee),
            shiftId: Number(selectedShift),
            workDate: day,
            notes: "",
          };

          // Validate first
          await workScheduleService.validateWorkSchedule(payload);

          // Create
          await workScheduleService.createWorkSchedule(payload);

          results.push({
            date: day,
            status: "success",
            message: `${formatDate(day)} - Thành công`,
          });
          successCount++;
        } catch (err) {
          results.push({
            date: day,
            status: "error",
            message: `${formatDate(day)} - ${getErrorMessage(err, "Thất bại")}`,
          });
          failureCount++;
        }

        setCreatingProgress(i + 1);
      }

      setCreationResults(results);
      setShowResults(true);

      const message =
        failureCount === 0
          ? `Tạo thành công ${successCount} lịch làm việc`
          : `Tạo ${successCount} thành công, ${failureCount} thất bại`;

      setSuccess(message);

      if (failureCount === 0) {
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Lỗi khi tạo lịch làm việc"));
    } finally {
      setCreating(false);
    }
  };

  const selectedEmployeeObj = employees.find((e) => String(e.id) === String(selectedEmployee));
  const selectedShiftObj = shifts.find((s) => String(s.id) === String(selectedShift));

  return (
    <div className="bulk-schedule-creation">
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
        <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4">
          <h6 className="mb-0 fw-semibold d-flex">
            <FaUserTie className="me-2 m-1" />
            Thông tin nhân viên & ca làm
          </h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <label className="form-label">Nhân viên</label>
              <Form.Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={creating}
                className="form-select-md"
              >
                <option value="">Chọn nhân viên</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName || emp.username}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <label className="form-label">Ca làm việc</label>
              <Form.Select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                disabled={creating}
                className="form-select-md"
              >
                <option value="">Chọn ca</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {selectedEmployeeObj && selectedShiftObj && (
            <Row className="mt-4">
              <Col md={6}>
                <Card className="bg-light border-0 p-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaUserTie className="text-primary fs-5" />
                    <div>
                      <small className="text-muted d-block">Nhân viên đã chọn</small>
                      <strong>{selectedEmployeeObj.fullName || selectedEmployeeObj.username}</strong>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="bg-light border-0 p-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaClock className="text-success fs-5" />
                    <div>
                      <small className="text-muted d-block">Ca làm</small>
                      <strong>
                        {selectedShiftObj.name} - {selectedShiftObj.startTime} ~ {selectedShiftObj.endTime}
                      </strong>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <Card className="admin-panel border-0 mb-4">
        <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4">
          <h6 className="mb-0 fw-semibold d-flex">
            <FaClock className="me-2 m-1" />
            Chọn các ngày làm việc
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <label className="form-label fw-semibold">Chế độ chọn:</label>
            <div className="d-flex gap-3 flex-wrap">
              <Form.Check
                type="radio"
                label="Tuần làm việc (T2-T6)"
                name="rangeMode"
                value="week"
                checked={rangeMode === "week"}
                onChange={(e) => setRangeMode(e.target.value)}
                disabled={creating}
              />
              <Form.Check
                type="radio"
                label="Khoảng ngày"
                name="rangeMode"
                value="range"
                checked={rangeMode === "range"}
                onChange={(e) => setRangeMode(e.target.value)}
                disabled={creating}
              />
              
            </div>
          </div>

          {rangeMode !== "custom" && (
            <Row className="mb-4 g-3">
              <Col md={6}>
                <label className="form-label">Ngày bắt đầu</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={creating}
                />
              </Col>
              {rangeMode === "range" && (
                <Col md={6}>
                  <label className="form-label">Ngày kết thúc</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={creating}
                    min={startDate}
                  />
                </Col>
              )}
            </Row>
          )}

          <div className="mb-3 d-flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSelectAll} disabled={creating || selectedDays.length === allDaysForPreview.length}>
              Chọn tất cả
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearAll} disabled={creating || selectedDays.length === 0}>
              Bỏ chọn
            </Button>
          </div>

          <div className="border rounded p-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-3 cursor-pointer" onClick={() => setExpandedPreview(!expandedPreview)}>
              <strong>
                {expandedPreview ? <FaChevronUp /> : <FaChevronDown />} Ngày đã chọn ({selectedDays.length}/{allDaysForPreview.length})
              </strong>
              <Badge bg={selectedDays.length > 0 ? "success" : "secondary"}>{selectedDays.length} ngày</Badge>
            </div>

            {expandedPreview && (
              <div className="row g-2">
                {allDaysForPreview.map((day) => (
                  <div key={day} className="col-6 col-md-4 col-lg-3">
                    <Form.Check
                      type="checkbox"
                      id={`day-${day}`}
                      label={
                        <span>
                          <strong>{getDayName(day)}</strong> {formatDate(day)}
                        </span>
                      }
                      checked={selectedDays.includes(day)}
                      onChange={() => handleToggleDay(day)}
                      disabled={creating}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedDays.length > 0 && (
            <Alert variant="info" className="mt-4 mb-0">
              <strong>Sẵn sàng tạo:</strong> {selectedDays.length} lịch làm việc cho{" "}
              <strong>{selectedEmployeeObj?.fullName || selectedEmployeeObj?.username}</strong> - ca{" "}
              <strong>{selectedShiftObj?.name}</strong>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {creating && (
        <Card className="admin-panel border-0 mb-4 bg-light">
          <Card.Body>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Spinner animation="border" size="sm" />
              <div>
                <strong>Đang tạo lịch làm việc...</strong>
                <br />
                <small className="text-muted">
                  {creatingProgress} / {creatingTotal}
                </small>
              </div>
            </div>
            <ProgressBar now={(creatingProgress / creatingTotal) * 100} animated />
          </Card.Body>
        </Card>
      )}

      {showResults && (
        <Card className="admin-panel border-0 mb-4">
          <Card.Header className="bg-white border-0 pt-3 px-3 px-md-4">
            <h6 className="mb-0 fw-semibold">Kết quả tạo lịch</h6>
          </Card.Header>
          <Card.Body>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {creationResults.map((result) => (
                <div key={result.date} className="d-flex align-items-center gap-2 mb-2 p-2 border-bottom">
                  {result.status === "success" ? (
                    <FaCheck className="text-success" />
                  ) : (
                    <FaTimes className="text-danger" />
                  )}
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex gap-2 justify-content-end">
        <Button variant="outline" onClick={onCancel} disabled={creating}>
          Hủy
        </Button>
        <Button onClick={handleCreateSchedules} disabled={!canCreateSchedules || creating} size="lg">
          {creating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang tạo...
            </>
          ) : (
            <>
              <FaCheck className="me-2" />
              Tạo {selectedDays.length} lịch
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
