import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Container, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import {
	FaCalendarAlt,
	FaCheck,
	FaClock,
	FaFilter,
	FaPlus,
	FaSearch,
	FaTimes,
	FaTrash,
	FaUserCheck,
	FaUserTie,
} from "react-icons/fa";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { shiftService } from "@/core/api/shiftService";
import { employeeService } from "@/core/api/employeeService";
import { workScheduleService } from "@/core/api/workScheduleService";

const PAGE_SIZE = 10;
const EMPLOYEE_ROLES = ["ADMIN", "INVENTORY_STAFF", "CASHIER"];
const ATTENDANCE_OPTIONS = ["PENDING", "PRESENT", "ABSENT"];

function getPageItems(total, current) {
	if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

	const pages = [1];
	if (current > 3) pages.push("ellipsis-left");

	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i += 1) pages.push(i);

	if (current < total - 2) pages.push("ellipsis-right");
	pages.push(total);
	return pages;
}

function normalizePageResult(result) {
	if (Array.isArray(result)) {
		return { content: result, totalPages: 1, totalElements: result.length };
	}

	if (result && typeof result === "object") {
		if (Array.isArray(result.content)) {
			return {
				content: result.content,
				totalPages: result.totalPages || 1,
				totalElements: result.totalElements ?? result.content.length,
			};
		}

		if (Array.isArray(result.data)) {
			return {
				content: result.data,
				totalPages: result.totalPages || 1,
				totalElements: result.totalElements ?? result.data.length,
			};
		}
	}

	return { content: [], totalPages: 1, totalElements: 0 };
}

function getErrorMessage(err, fallback) {
	const data = err?.response?.data;
	if (typeof data === "string" && data.trim()) return data;
	if (data?.message) return data.message;
	return fallback || err?.message || "Đã có lỗi xảy ra";
}

function formatDate(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("vi-VN");
}

function formatDateTime(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString("vi-VN");
}

function normalizeTime(time = "") {
	const value = String(time || "").trim();
	if (!value) return "";
	return value.length === 5 ? `${value}:00` : value;
}

function toBooleanFilter(value) {
	if (value === "all") return undefined;
	return value === "true";
}

function ShiftTable({ shifts, loading, page, onEdit, onToggleActive }) {
	if (loading && shifts.length === 0) {
		return (
			<div className="text-center py-5">
				<Spinner animation="border" role="status" />
			</div>
		);
	}

	if (!loading && shifts.length === 0) {
		return <Alert variant="info">Chưa có ca làm việc nào</Alert>;
	}

	return (
		<div className="table-responsive">
			<Table hover className="align-middle mb-0">
				<thead>
					<tr>
						<th>STT</th>
						<th>Tên ca</th>
						<th>Bắt đầu</th>
						<th>Kết thúc</th>
						<th>Trạng thái</th>
						<th className="text-end">Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{shifts.map((shift, index) => (
						<tr key={shift.id}>
							<td>{page * PAGE_SIZE + index + 1}</td>
							<td>{shift.name || "-"}</td>
							<td>{shift.startTime || "-"}</td>
							<td>{shift.endTime || "-"}</td>
							<td>
								<Badge bg={shift.isActive ? "success" : "secondary"}>
									{shift.isActive ? "Kích hoạt" : "Tạm dừng"}
								</Badge>
							</td>
							<td>
								<div className="d-flex justify-content-end gap-2">
									<Button variant="outline" size="icon-sm" title="Sửa" onClick={() => onEdit(shift)}>
										<FaUserTie />
									</Button>
									<Button
										variant={shift.isActive ? "destructive" : "secondary"}
										size="icon-sm"
										title={shift.isActive ? "Tạm dừng" : "Kích hoạt"}
										onClick={() => onToggleActive(shift)}
									>
										{shift.isActive ? <FaTimes /> : <FaCheck />}
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}

function EmployeeTable({ employees, loading, page, onEdit, onToggleActive, onDelete }) {
	if (loading && employees.length === 0) {
		return (
			<div className="text-center py-5">
				<Spinner animation="border" role="status" />
			</div>
		);
	}

	if (!loading && employees.length === 0) {
		return <Alert variant="info">Chưa có nhân viên nào</Alert>;
	}

	return (
		<div className="table-responsive">
			<Table hover className="align-middle mb-0">
				<thead>
					<tr>
						<th>STT</th>
						<th>Họ tên</th>
						<th>Tên đăng nhập</th>
						<th>Email</th>
						<th>Vai trò</th>
						<th>Trạng thái</th>
						<th className="text-end">Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{employees.map((employee, index) => (
						<tr key={employee.id}>
							<td>{page * PAGE_SIZE + index + 1}</td>
							<td>{employee.fullName || employee.name || "-"}</td>
							<td>{employee.username || "-"}</td>
							<td>{employee.email || "-"}</td>
							<td>{employee.role || "-"}</td>
							<td>
								<Badge bg={employee.isActive ? "success" : "secondary"}>
									{employee.isActive ? "Kích hoạt" : "Tạm dừng"}
								</Badge>
							</td>
							<td>
								<div className="d-flex justify-content-end gap-2">
									<Button variant="outline" size="icon-sm" title="Sửa" onClick={() => onEdit(employee)}>
										<FaUserTie />
									</Button>
									<Button
										variant={employee.isActive ? "destructive" : "secondary"}
										size="icon-sm"
										title={employee.isActive ? "Tạm dừng" : "Kích hoạt"}
										onClick={() => onToggleActive(employee)}
									>
										{employee.isActive ? <FaTimes /> : <FaCheck />}
									</Button>
									<Button variant="destructive" size="icon-sm" title="Xóa" onClick={() => onDelete(employee.id)}>
										<FaTrash />
									</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}

function WorkScheduleTable({ schedules, loading, page, onEdit, onDelete, onCheckIn, onCheckOut, onPresent, onAbsent }) {
	if (loading && schedules.length === 0) {
		return (
			<div className="text-center py-5">
				<Spinner animation="border" role="status" />
			</div>
		);
	}

	if (!loading && schedules.length === 0) {
		return <Alert variant="info">Chưa có lịch làm việc nào</Alert>;
	}

	return (
		<div className="table-responsive">
			<Table hover className="align-middle mb-0">
				<thead>
					<tr>
						<th>STT</th>
						<th>Ngày làm</th>
						<th>Nhân viên</th>
						<th>Ca làm</th>
						<th>Check in</th>
						<th>Check out</th>
						<th>Điểm danh</th>
						<th className="text-end">Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{schedules.map((schedule, index) => {
						const attendanceStatus = schedule.attendanceStatus || schedule.status || "PENDING";

						return (
							<tr key={schedule.id}>
								<td>{page * PAGE_SIZE + index + 1}</td>
								<td>{formatDate(schedule.workDate || schedule.date)}</td>
								<td>{schedule.employeeName || schedule.employee?.fullName || "-"}</td>
								<td>{schedule.shiftName || schedule.shift?.name || "-"}</td>
								<td>{formatDateTime(schedule.checkInTime)}</td>
								<td>{formatDateTime(schedule.checkOutTime)}</td>
								<td>
									<Badge bg={attendanceStatus === "PRESENT" ? "success" : attendanceStatus === "ABSENT" ? "danger" : "warning"}>
										{attendanceStatus}
									</Badge>
								</td>
								<td>
									<div className="d-flex justify-content-end gap-2 flex-wrap">
										<Button variant="outline" size="icon-sm" title="Sửa" onClick={() => onEdit(schedule)}>
											<FaUserTie />
										</Button>
										<Button variant="secondary" size="icon-sm" title="Check in" onClick={() => onCheckIn(schedule.id)}>
											<FaClock />
										</Button>
										<Button variant="secondary" size="icon-sm" title="Check out" onClick={() => onCheckOut(schedule.id)}>
											<FaCalendarAlt />
										</Button>
										<Button variant="outline" size="icon-sm" title="Đi làm" onClick={() => onPresent(schedule.id)}>
											<FaCheck />
										</Button>
										<Button variant="destructive" size="icon-sm" title="Vắng" onClick={() => onAbsent(schedule.id)}>
											<FaTimes />
										</Button>
										<Button variant="destructive" size="icon-sm" title="Xóa" onClick={() => onDelete(schedule.id)}>
											<FaTrash />
										</Button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</div>
	);
}

function EntityPagination({ page, totalPages, onPageChange }) {
	const currentPage = page + 1;
	const pageItems = getPageItems(Math.max(totalPages, 1), currentPage);

	return (
		<div className="admin-pagination mt-4">
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(event) => {
								event.preventDefault();
								if (page > 0) onPageChange(page - 1);
							}}
							className={page === 0 ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>

					{pageItems.map((item) => (
						<PaginationItem key={item}>
							{typeof item === "number" ? (
								<PaginationLink
									href="#"
									isActive={item === currentPage}
									onClick={(event) => {
										event.preventDefault();
										onPageChange(item - 1);
									}}
								>
									{item}
								</PaginationLink>
							) : (
								<PaginationEllipsis />
							)}
						</PaginationItem>
					))}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(event) => {
								event.preventDefault();
								if (page < totalPages - 1) onPageChange(page + 1);
							}}
							className={page >= totalPages - 1 || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

export default function StaffPage() {
	const [activeTab, setActiveTab] = useState("shift");

	const [shiftPage, setShiftPage] = useState(0);
	const [shiftTotalPages, setShiftTotalPages] = useState(1);
	const [shifts, setShifts] = useState([]);
	const [shiftLoading, setShiftLoading] = useState(false);
	const [shiftSearch, setShiftSearch] = useState("");
	const [debouncedShiftSearch, setDebouncedShiftSearch] = useState("");
	const [shiftStatusFilter, setShiftStatusFilter] = useState("all");
	const [shiftStartTimeFilter, setShiftStartTimeFilter] = useState("");
	const [shiftEndTimeFilter, setShiftEndTimeFilter] = useState("");
	const [shiftError, setShiftError] = useState("");
	const [shiftSuccess, setShiftSuccess] = useState("");
	const [showShiftModal, setShowShiftModal] = useState(false);
	const [editingShift, setEditingShift] = useState(null);
	const [shiftForm, setShiftForm] = useState({ name: "", startTime: "", endTime: "", isActive: true });
	const [activeShiftCount, setActiveShiftCount] = useState(0);
	const [inactiveShiftCount, setInactiveShiftCount] = useState(0);

	const [employeePage, setEmployeePage] = useState(0);
	const [employeeTotalPages, setEmployeeTotalPages] = useState(1);
	const [employees, setEmployees] = useState([]);
	const [employeeLoading, setEmployeeLoading] = useState(false);
	const [employeeSearch, setEmployeeSearch] = useState("");
	const [debouncedEmployeeSearch, setDebouncedEmployeeSearch] = useState("");
	const [employeeRoleFilter, setEmployeeRoleFilter] = useState("all");
	const [employeeStatusFilter, setEmployeeStatusFilter] = useState("all");
	const [employeeError, setEmployeeError] = useState("");
	const [employeeSuccess, setEmployeeSuccess] = useState("");
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState(null);
	const [employeeDeleteId, setEmployeeDeleteId] = useState(null);
	const [employeeForm, setEmployeeForm] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
		role: "CASHIER",
		isActive: true,
	});
	const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
	const [employeeRoleCount, setEmployeeRoleCount] = useState(0);

	const [schedulePage, setSchedulePage] = useState(0);
	const [scheduleTotalPages, setScheduleTotalPages] = useState(1);
	const [schedules, setSchedules] = useState([]);
	const [scheduleLoading, setScheduleLoading] = useState(false);
	const [scheduleDateFilter, setScheduleDateFilter] = useState("");
	const [scheduleEmployeeFilter, setScheduleEmployeeFilter] = useState("");
	const [scheduleShiftFilter, setScheduleShiftFilter] = useState("");
	const [scheduleAttendanceFilter, setScheduleAttendanceFilter] = useState("all");
	const [scheduleError, setScheduleError] = useState("");
	const [scheduleSuccess, setScheduleSuccess] = useState("");
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [editingSchedule, setEditingSchedule] = useState(null);
	const [scheduleDeleteId, setScheduleDeleteId] = useState(null);
	const [scheduleForm, setScheduleForm] = useState({
		employeeId: "",
		shiftId: "",
		workDate: "",
		notes: "",
	});
	const [selectedDateCounts, setSelectedDateCounts] = useState({ total: 0, present: 0, absent: 0 });

	const [lookupEmployees, setLookupEmployees] = useState([]);
	const [lookupShifts, setLookupShifts] = useState([]);

	const clearToastAfter = (setter) => setTimeout(() => setter(""), 2500);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedShiftSearch(shiftSearch.trim()), 350);
		return () => clearTimeout(timer);
	}, [shiftSearch]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedEmployeeSearch(employeeSearch.trim()), 350);
		return () => clearTimeout(timer);
	}, [employeeSearch]);

	useEffect(() => {
		setShiftPage(0);
	}, [debouncedShiftSearch, shiftStatusFilter, shiftStartTimeFilter, shiftEndTimeFilter]);

	useEffect(() => {
		setEmployeePage(0);
	}, [debouncedEmployeeSearch, employeeRoleFilter, employeeStatusFilter]);

	useEffect(() => {
		setSchedulePage(0);
	}, [scheduleDateFilter, scheduleEmployeeFilter, scheduleShiftFilter, scheduleAttendanceFilter]);

	const loadShiftCounts = useCallback(async () => {
		try {
			const [activeCount, inactiveCount] = await Promise.all([
				shiftService.countByIsActive(true),
				shiftService.countByIsActive(false),
			]);

			setActiveShiftCount(Number(activeCount || 0));
			setInactiveShiftCount(Number(inactiveCount || 0));
		} catch {
			setActiveShiftCount(0);
			setInactiveShiftCount(0);
		}
	}, []);

	const loadEmployeeCounts = useCallback(async () => {
		try {
			const activeCount = await employeeService.countActive();
			setActiveEmployeeCount(Number(activeCount || 0));
		} catch {
			setActiveEmployeeCount(0);
		}

		if (employeeRoleFilter === "all") {
			setEmployeeRoleCount(0);
			return;
		}

		try {
			const roleCount = await employeeService.countByRole(employeeRoleFilter);
			setEmployeeRoleCount(Number(roleCount || 0));
		} catch {
			setEmployeeRoleCount(0);
		}
	}, [employeeRoleFilter]);

	const loadSelectedDateCounts = useCallback(async () => {
		if (!scheduleDateFilter) {
			setSelectedDateCounts({ total: 0, present: 0, absent: 0 });
			return;
		}

		try {
			const [total, present, absent] = await Promise.all([
				workScheduleService.countByDate(scheduleDateFilter),
				workScheduleService.countPresentByDate(scheduleDateFilter),
				workScheduleService.countAbsentByDate(scheduleDateFilter),
			]);

			setSelectedDateCounts({
				total: Number(total || 0),
				present: Number(present || 0),
				absent: Number(absent || 0),
			});
		} catch {
			setSelectedDateCounts({ total: 0, present: 0, absent: 0 });
		}
	}, [scheduleDateFilter]);

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

	const loadShifts = useCallback(async () => {
		try {
			setShiftLoading(true);
			setShiftError("");

			let result;
			if (debouncedShiftSearch) {
				result = await shiftService.findByNameContainingIgnoreCase(debouncedShiftSearch, shiftPage, PAGE_SIZE);
			} else if (shiftStatusFilter !== "all") {
				result = await shiftService.findByIsActive(shiftStatusFilter === "true", shiftPage, PAGE_SIZE);
			} else if (shiftStartTimeFilter && shiftEndTimeFilter) {
				result = await shiftService.findOverlaping(shiftStartTimeFilter, shiftEndTimeFilter, shiftPage, PAGE_SIZE);
			} else if (shiftStartTimeFilter) {
				result = await shiftService.findByStartTimeGreaterThanEqual(shiftStartTimeFilter, shiftPage, PAGE_SIZE);
			} else if (shiftEndTimeFilter) {
				result = await shiftService.findByEndTimeLessThanEqual(shiftEndTimeFilter, shiftPage, PAGE_SIZE);
			} else {
				result = await shiftService.getAllShifts(shiftPage, PAGE_SIZE);
			}

			const normalized = normalizePageResult(result);

			const filtered = normalized.content.filter((item) => {
				if (shiftStatusFilter === "true" && !item.isActive) return false;
				if (shiftStatusFilter === "false" && item.isActive) return false;
				if (debouncedShiftSearch && !String(item.name || "").toLowerCase().includes(debouncedShiftSearch.toLowerCase())) {
					return false;
				}
				if (shiftStartTimeFilter && String(item.startTime || "") < shiftStartTimeFilter) return false;
				if (shiftEndTimeFilter && String(item.endTime || "") > shiftEndTimeFilter) return false;
				return true;
			});

			setShifts(filtered);
			setShiftTotalPages(normalized.totalPages || 1);
		} catch (err) {
			setShiftError(getErrorMessage(err, "Không thể tải danh sách ca làm việc"));
		} finally {
			setShiftLoading(false);
		}
	}, [debouncedShiftSearch, shiftPage, shiftStatusFilter, shiftStartTimeFilter, shiftEndTimeFilter]);

	const loadEmployees = useCallback(async () => {
		try {
			setEmployeeLoading(true);
			setEmployeeError("");

			let result;
			const hasFilter = Boolean(debouncedEmployeeSearch)
				|| employeeRoleFilter !== "all"
				|| employeeStatusFilter !== "all";

			if (hasFilter) {
				result = await employeeService.searchEmployees({
					keyword: debouncedEmployeeSearch,
					role: employeeRoleFilter === "all" ? "" : employeeRoleFilter,
					isActive: toBooleanFilter(employeeStatusFilter),
					page: employeePage,
					size: PAGE_SIZE,
				});
			} else {
				result = await employeeService.getAllEmployees(employeePage, PAGE_SIZE);
			}

			const normalized = normalizePageResult(result);
			const filtered = normalized.content.filter((item) => {
				if (employeeRoleFilter !== "all" && item.role !== employeeRoleFilter) return false;
				if (employeeStatusFilter === "true" && !item.isActive) return false;
				if (employeeStatusFilter === "false" && item.isActive) return false;

				if (debouncedEmployeeSearch) {
					const text = `${item.fullName || item.name || ""} ${item.username || ""} ${item.email || ""}`
						.toLowerCase();

					if (!text.includes(debouncedEmployeeSearch.toLowerCase())) return false;
				}

				return true;
			});

			setEmployees(filtered);
			setEmployeeTotalPages(normalized.totalPages || 1);
		} catch (err) {
			setEmployeeError(getErrorMessage(err, "Không thể tải danh sách nhân viên"));
		} finally {
			setEmployeeLoading(false);
		}
	}, [debouncedEmployeeSearch, employeeRoleFilter, employeeStatusFilter, employeePage]);

	const loadSchedules = useCallback(async () => {
		try {
			setScheduleLoading(true);
			setScheduleError("");

			const hasFilter = Boolean(scheduleDateFilter)
				|| Boolean(scheduleEmployeeFilter)
				|| Boolean(scheduleShiftFilter)
				|| scheduleAttendanceFilter !== "all";

			const result = hasFilter
				? await workScheduleService.searchWorkSchedules({
						date: scheduleDateFilter,
						employeeId: scheduleEmployeeFilter,
						shiftId: scheduleShiftFilter,
						attendanceStatus: scheduleAttendanceFilter === "all" ? "" : scheduleAttendanceFilter,
						page: schedulePage,
						size: PAGE_SIZE,
					})
				: await workScheduleService.getAllWorkSchedules(schedulePage, PAGE_SIZE);

			const normalized = normalizePageResult(result);

			const filtered = normalized.content.filter((item) => {
				if (scheduleDateFilter && String(item.workDate || item.date || "").slice(0, 10) !== scheduleDateFilter) {
					return false;
				}
				if (scheduleEmployeeFilter && String(item.employeeId || item.employee?.id || "") !== String(scheduleEmployeeFilter)) {
					return false;
				}
				if (scheduleShiftFilter && String(item.shiftId || item.shift?.id || "") !== String(scheduleShiftFilter)) {
					return false;
				}

				const attendance = item.attendanceStatus || item.status || "PENDING";
				if (scheduleAttendanceFilter !== "all" && attendance !== scheduleAttendanceFilter) {
					return false;
				}

				return true;
			});

			setSchedules(filtered);
			setScheduleTotalPages(normalized.totalPages || 1);
		} catch (err) {
			setScheduleError(getErrorMessage(err, "Không thể tải lịch làm việc"));
		} finally {
			setScheduleLoading(false);
		}
	}, [scheduleAttendanceFilter, scheduleDateFilter, scheduleEmployeeFilter, schedulePage, scheduleShiftFilter]);

	useEffect(() => {
		loadLookups();
	}, [loadLookups]);

	useEffect(() => {
		loadShifts();
	}, [loadShifts]);

	useEffect(() => {
		loadEmployees();
	}, [loadEmployees]);

	useEffect(() => {
		loadSchedules();
	}, [loadSchedules]);

	useEffect(() => {
		loadShiftCounts();
	}, [loadShiftCounts, shifts]);

	useEffect(() => {
		loadEmployeeCounts();
	}, [loadEmployeeCounts, employees]);

	useEffect(() => {
		loadSelectedDateCounts();
	}, [loadSelectedDateCounts]);

	const openShiftModal = (shift = null) => {
		setEditingShift(shift);
		setShiftForm({
			name: shift?.name || "",
			startTime: shift?.startTime || "",
			endTime: shift?.endTime || "",
			isActive: shift?.isActive ?? true,
		});
		setShowShiftModal(true);
	};

	const openEmployeeModal = (employee = null) => {
		setEditingEmployee(employee);
		setEmployeeForm({
			fullName: employee?.fullName || employee?.name || "",
			username: employee?.username || "",
			email: employee?.email || "",
			password: "",
			role: employee?.role || "CASHIER",
			isActive: employee?.isActive ?? true,
		});
		setShowEmployeeModal(true);
	};

	const openScheduleModal = (schedule = null) => {
		setEditingSchedule(schedule);
		setScheduleForm({
			employeeId: String(schedule?.employeeId || schedule?.employee?.id || ""),
			shiftId: String(schedule?.shiftId || schedule?.shift?.id || ""),
			workDate: String(schedule?.workDate || schedule?.date || "").slice(0, 10),
			notes: schedule?.notes || "",
		});
		setShowScheduleModal(true);
	};

	const handleSaveShift = async () => {
		try {
			if (!shiftForm.name.trim()) {
				setShiftError("Tên ca làm việc không được để trống");
				return;
			}

			if (!shiftForm.startTime || !shiftForm.endTime) {
				setShiftError("Vui lòng chọn giờ bắt đầu và giờ kết thúc");
				return;
			}

			const payload = {
				name: shiftForm.name.trim(),
				startTime: normalizeTime(shiftForm.startTime),
				endTime: normalizeTime(shiftForm.endTime),
				isActive: shiftForm.isActive,
			};

			if (!editingShift) {
				try {
					const exists = await shiftService.existByName(payload.name);
					if (exists === true) {
						setShiftError("Tên ca làm việc đã tồn tại");
						return;
					}
				} catch {
					// Allow continue if endpoint does not exist.
				}

				await shiftService.createShift(payload);
				setShiftSuccess("Tạo ca làm việc thành công");
			} else {
				await shiftService.updateShift(editingShift.id, payload);
				setShiftSuccess("Cập nhật ca làm việc thành công");
			}

			setShowShiftModal(false);
			setEditingShift(null);
			await loadShifts();
			await loadShiftCounts();
			clearToastAfter(setShiftSuccess);
		} catch (err) {
			setShiftError(getErrorMessage(err, "Không thể lưu ca làm việc"));
		}
	};

	const handleToggleShiftActive = async (shift) => {
		try {
			if (shift.isActive) {
				await shiftService.deactivateShift(shift.id);
				setShiftSuccess("Đã tạm dừng ca làm việc");
			} else {
				await shiftService.activateShift(shift.id);
				setShiftSuccess("Đã kích hoạt ca làm việc");
			}

			await loadShifts();
			await loadShiftCounts();
			clearToastAfter(setShiftSuccess);
		} catch (err) {
			setShiftError(getErrorMessage(err, "Không thể thay đổi trạng thái ca làm việc"));
		}
	};

	const handleSaveEmployee = async () => {
		try {
			if (!employeeForm.fullName.trim() || !employeeForm.username.trim()) {
				setEmployeeError("Vui lòng nhập họ tên và tên đăng nhập");
				return;
			}

			if (!editingEmployee && !employeeForm.password.trim()) {
				setEmployeeError("Vui lòng nhập mật khẩu khi tạo nhân viên");
				return;
			}

			const payload = {
				fullName: employeeForm.fullName.trim(),
				username: employeeForm.username.trim(),
				email: employeeForm.email.trim(),
				role: employeeForm.role,
				isActive: employeeForm.isActive,
			};

			if (employeeForm.password.trim()) {
				payload.password = employeeForm.password.trim();
			}

			if (editingEmployee) {
				await employeeService.updateEmployee(editingEmployee.id, payload);
				setEmployeeSuccess("Cập nhật nhân viên thành công");
			} else {
				await employeeService.createEmployee(payload);
				setEmployeeSuccess("Tạo nhân viên thành công");
			}

			setShowEmployeeModal(false);
			setEditingEmployee(null);
			await loadEmployees();
			await loadEmployeeCounts();
			await loadLookups();
			clearToastAfter(setEmployeeSuccess);
		} catch (err) {
			setEmployeeError(getErrorMessage(err, "Không thể lưu nhân viên"));
		}
	};

	const handleToggleEmployeeActive = async (employee) => {
		try {
			if (employee.isActive) {
				await employeeService.deactivateEmployee(employee.id);
				setEmployeeSuccess("Đã tạm dừng nhân viên");
			} else {
				await employeeService.activateEmployee(employee.id);
				setEmployeeSuccess("Đã kích hoạt nhân viên");
			}

			await loadEmployees();
			await loadEmployeeCounts();
			clearToastAfter(setEmployeeSuccess);
		} catch (err) {
			setEmployeeError(getErrorMessage(err, "Không thể đổi trạng thái nhân viên"));
		}
	};

	const handleDeleteEmployee = async () => {
		if (!employeeDeleteId) return;

		try {
			await employeeService.deleteEmployee(employeeDeleteId);
			setEmployeeSuccess("Xóa nhân viên thành công");
			setEmployeeDeleteId(null);
			await loadEmployees();
			await loadEmployeeCounts();
			await loadLookups();
			clearToastAfter(setEmployeeSuccess);
		} catch (err) {
			setEmployeeError(getErrorMessage(err, "Không thể xóa nhân viên"));
		}
	};

	const handleSaveSchedule = async () => {
		try {
			if (!scheduleForm.employeeId || !scheduleForm.shiftId || !scheduleForm.workDate) {
				setScheduleError("Vui lòng chọn nhân viên, ca làm và ngày làm việc");
				return;
			}

			const payload = {
				employeeId: Number(scheduleForm.employeeId),
				shiftId: Number(scheduleForm.shiftId),
				workDate: scheduleForm.workDate,
				notes: scheduleForm.notes.trim(),
			};

			await workScheduleService.validateWorkSchedule(payload);

			if (editingSchedule) {
				await workScheduleService.updateWorkSchedule(editingSchedule.id, payload);
				setScheduleSuccess("Cập nhật lịch làm việc thành công");
			} else {
				await workScheduleService.createWorkSchedule(payload);
				setScheduleSuccess("Tạo lịch làm việc thành công");
			}

			setShowScheduleModal(false);
			setEditingSchedule(null);
			await loadSchedules();
			await loadSelectedDateCounts();
			clearToastAfter(setScheduleSuccess);
		} catch (err) {
			setScheduleError(getErrorMessage(err, "Không thể lưu lịch làm việc"));
		}
	};

	const handleDeleteSchedule = async () => {
		if (!scheduleDeleteId) return;

		try {
			await workScheduleService.deleteWorkSchedule(scheduleDeleteId);
			setScheduleSuccess("Xóa lịch làm việc thành công");
			setScheduleDeleteId(null);
			await loadSchedules();
			await loadSelectedDateCounts();
			clearToastAfter(setScheduleSuccess);
		} catch (err) {
			setScheduleError(getErrorMessage(err, "Không thể xóa lịch làm việc"));
		}
	};

	const handleScheduleAction = async (action, successMessage) => {
		try {
			await action();
			setScheduleSuccess(successMessage);
			await loadSchedules();
			await loadSelectedDateCounts();
			clearToastAfter(setScheduleSuccess);
		} catch (err) {
			setScheduleError(getErrorMessage(err, "Không thể cập nhật lịch làm việc"));
		}
	};

	return (
		<AdminLayout>
			<Container fluid>
				<div className="admin-page-heading d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
					<div className="admin-page-heading-text">
						<h2 className="fw-bold mb-1">HR Shift Management</h2>
						<p className="text-muted mb-0">Quản lý ca làm, nhân viên và lịch phân ca chấm công.</p>
					</div>
				</div>

				<Card className="admin-panel border-0 mb-4">
					<Card.Body>
						<div className="d-flex flex-wrap gap-2">
							<Button variant={activeTab === "shift" ? "default" : "outline"} onClick={() => setActiveTab("shift")}>
								<FaClock className="me-2" /> Ca làm việc
							</Button>
							<Button variant={activeTab === "employee" ? "default" : "outline"} onClick={() => setActiveTab("employee")}>
								<FaUserCheck className="me-2" /> Nhân viên
							</Button>
							<Button variant={activeTab === "schedule" ? "default" : "outline"} onClick={() => setActiveTab("schedule")}>
								<FaCalendarAlt className="me-2" /> Lịch làm việc
							</Button>
						</div>
					</Card.Body>
				</Card>

				{activeTab === "shift" && (
					<>
						<Row className="g-3 mb-4">
							<Col md={6} lg={4}>
								<Card className="admin-panel border-0 h-100">
									<Card.Body>
										<small className="text-muted">Ca đang hoạt động</small>
										<h3 className="fw-bold mb-0">{activeShiftCount}</h3>
									</Card.Body>
								</Card>
							</Col>
							<Col md={6} lg={4}>
								<Card className="admin-panel border-0 h-100">
									<Card.Body>
										<small className="text-muted">Ca tạm dừng</small>
										<h3 className="fw-bold mb-0">{inactiveShiftCount}</h3>
									</Card.Body>
								</Card>
							</Col>
						</Row>

						{shiftError && (
							<Alert variant="danger" onClose={() => setShiftError("")} dismissible>
								{shiftError}
							</Alert>
						)}

						{shiftSuccess && (
							<Alert variant="success" onClose={() => setShiftSuccess("")} dismissible>
								{shiftSuccess}
							</Alert>
						)}

						<Card className="admin-panel border-0 mb-4">
							<Card.Body>
								<div className="row g-3 align-items-end">
									<div className="col-lg-4">
										<label className="form-label">Tìm theo tên ca</label>
										<div className="position-relative">
											<FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
											<Input
												value={shiftSearch}
												onChange={(event) => setShiftSearch(event.target.value)}
												placeholder="Nhập tên ca làm việc..."
												className="ps-5"
											/>
										</div>
									</div>
									<div className="col-md-4 col-lg-2">
										<label className="form-label">Trạng thái</label>
										<Form.Select value={shiftStatusFilter} onChange={(event) => setShiftStatusFilter(event.target.value)}>
											<option value="all">Tất cả</option>
											<option value="true">Kích hoạt</option>
											<option value="false">Tạm dừng</option>
										</Form.Select>
									</div>
									<div className="col-md-4 col-lg-2">
										<label className="form-label">Giờ bắt đầu từ</label>
										<Input type="time" value={shiftStartTimeFilter} onChange={(event) => setShiftStartTimeFilter(event.target.value)} />
									</div>
									<div className="col-md-4 col-lg-2">
										<label className="form-label">Giờ kết thúc đến</label>
										<Input type="time" value={shiftEndTimeFilter} onChange={(event) => setShiftEndTimeFilter(event.target.value)} />
									</div>
									<div className="col-md-4 col-lg-2 d-grid">
										<Button onClick={() => openShiftModal()}>
											<FaPlus className="me-2" /> Thêm ca
										</Button>
									</div>
								</div>

								<div className="d-flex justify-content-end mt-3">
									<Button
										variant="outline"
										onClick={() => {
											setShiftSearch("");
											setShiftStatusFilter("all");
											setShiftStartTimeFilter("");
											setShiftEndTimeFilter("");
										}}
									>
										<FaFilter className="me-2" /> Xóa bộ lọc
									</Button>
								</div>
							</Card.Body>
						</Card>

						<Card className="admin-panel border-0">
							<Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
								<h6 className="mb-0 fw-semibold">Danh sách ca làm việc</h6>
								<Badge bg="light" text="dark">{shifts.length} bản ghi</Badge>
							</Card.Header>
							<Card.Body className="pt-1">
								<ShiftTable
									shifts={shifts}
									loading={shiftLoading}
									page={shiftPage}
									onEdit={openShiftModal}
									onToggleActive={handleToggleShiftActive}
								/>
							</Card.Body>
						</Card>

						<EntityPagination page={shiftPage} totalPages={shiftTotalPages} onPageChange={setShiftPage} />
					</>
				)}

				{activeTab === "employee" && (
					<>
						<Row className="g-3 mb-4">
							<Col md={6} lg={4}>
								<Card className="admin-panel border-0 h-100">
									<Card.Body>
										<small className="text-muted">Nhân viên đang hoạt động</small>
										<h3 className="fw-bold mb-0">{activeEmployeeCount}</h3>
									</Card.Body>
								</Card>
							</Col>
							<Col md={6} lg={4}>
								<Card className="admin-panel border-0 h-100">
									<Card.Body>
										<small className="text-muted">Số lượng theo vai trò đang lọc</small>
										<h3 className="fw-bold mb-0">{employeeRoleCount}</h3>
									</Card.Body>
								</Card>
							</Col>
						</Row>

						{employeeError && (
							<Alert variant="danger" onClose={() => setEmployeeError("")} dismissible>
								{employeeError}
							</Alert>
						)}

						{employeeSuccess && (
							<Alert variant="success" onClose={() => setEmployeeSuccess("")} dismissible>
								{employeeSuccess}
							</Alert>
						)}

						<Card className="admin-panel border-0 mb-4">
							<Card.Body>
								<div className="row g-3 align-items-end">
									<div className="col-lg-4">
										<label className="form-label">Tìm nhân viên</label>
										<div className="position-relative">
											<FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
											<Input
												value={employeeSearch}
												onChange={(event) => setEmployeeSearch(event.target.value)}
												placeholder="Theo tên, username, email..."
												className="ps-5"
											/>
										</div>
									</div>

									<div className="col-md-4 col-lg-2">
										<label className="form-label">Vai trò</label>
										<Form.Select value={employeeRoleFilter} onChange={(event) => setEmployeeRoleFilter(event.target.value)}>
											<option value="all">Tất cả vai trò</option>
											{EMPLOYEE_ROLES.map((role) => (
												<option key={role} value={role}>{role}</option>
											))}
										</Form.Select>
									</div>

									<div className="col-md-4 col-lg-2">
										<label className="form-label">Trạng thái</label>
										<Form.Select value={employeeStatusFilter} onChange={(event) => setEmployeeStatusFilter(event.target.value)}>
											<option value="all">Tất cả</option>
											<option value="true">Kích hoạt</option>
											<option value="false">Tạm dừng</option>
										</Form.Select>
									</div>

									<div className="col-md-4 col-lg-2 d-grid">
										<Button onClick={() => openEmployeeModal()}>
											<FaPlus className="me-2" /> Thêm nhân viên
										</Button>
									</div>
								</div>

								<div className="d-flex justify-content-end mt-3">
									<Button
										variant="outline"
										onClick={() => {
											setEmployeeSearch("");
											setEmployeeRoleFilter("all");
											setEmployeeStatusFilter("all");
										}}
									>
										<FaFilter className="me-2" /> Xóa bộ lọc
									</Button>
								</div>
							</Card.Body>
						</Card>

						<Card className="admin-panel border-0">
							<Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
								<h6 className="mb-0 fw-semibold">Danh sách nhân viên</h6>
								<Badge bg="light" text="dark">{employees.length} bản ghi</Badge>
							</Card.Header>
							<Card.Body className="pt-1">
								<EmployeeTable
									employees={employees}
									loading={employeeLoading}
									page={employeePage}
									onEdit={openEmployeeModal}
									onToggleActive={handleToggleEmployeeActive}
									onDelete={setEmployeeDeleteId}
								/>
							</Card.Body>
						</Card>

						<EntityPagination page={employeePage} totalPages={employeeTotalPages} onPageChange={setEmployeePage} />
					</>
				)}

				{activeTab === "schedule" && (
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
										<h3 className="fw-bold mb-0 text-success">{selectedDateCounts.present}</h3>
									</Card.Body>
								</Card>
							</Col>
							<Col md={6} lg={4}>
								<Card className="admin-panel border-0 h-100">
									<Card.Body>
										<small className="text-muted">Vắng theo ngày lọc</small>
										<h3 className="fw-bold mb-0 text-danger">{selectedDateCounts.absent}</h3>
									</Card.Body>
								</Card>
							</Col>
						</Row>

						{scheduleError && (
							<Alert variant="danger" onClose={() => setScheduleError("")} dismissible>
								{scheduleError}
							</Alert>
						)}

						{scheduleSuccess && (
							<Alert variant="success" onClose={() => setScheduleSuccess("")} dismissible>
								{scheduleSuccess}
							</Alert>
						)}

						<Card className="admin-panel border-0 mb-4">
							<Card.Body>
								<div className="row g-3 align-items-end">
									<div className="col-md-4 col-lg-2">
										<label className="form-label">Ngày làm việc</label>
										<Input
											type="date"
											value={scheduleDateFilter}
											onChange={(event) => setScheduleDateFilter(event.target.value)}
										/>
									</div>
									<div className="col-md-4 col-lg-3">
										<label className="form-label">Nhân viên</label>
										<Form.Select
											value={scheduleEmployeeFilter}
											onChange={(event) => setScheduleEmployeeFilter(event.target.value)}
										>
											<option value="">Tất cả nhân viên</option>
											{lookupEmployees.map((employee) => (
												<option key={employee.id} value={employee.id}>
													{employee.fullName || employee.name || employee.username || employee.id}
												</option>
											))}
										</Form.Select>
									</div>
									<div className="col-md-4 col-lg-3">
										<label className="form-label">Ca làm</label>
										<Form.Select value={scheduleShiftFilter} onChange={(event) => setScheduleShiftFilter(event.target.value)}>
											<option value="">Tất cả ca</option>
											{lookupShifts.map((shift) => (
												<option key={shift.id} value={shift.id}>{shift.name}</option>
											))}
										</Form.Select>
									</div>
									<div className="col-md-4 col-lg-2">
										<label className="form-label">Điểm danh</label>
										<Form.Select
											value={scheduleAttendanceFilter}
											onChange={(event) => setScheduleAttendanceFilter(event.target.value)}
										>
											<option value="all">Tất cả</option>
											{ATTENDANCE_OPTIONS.map((status) => (
												<option key={status} value={status}>{status}</option>
											))}
										</Form.Select>
									</div>
									<div className="col-md-4 col-lg-2 d-grid">
										<Button onClick={() => openScheduleModal()}>
											<FaPlus className="me-2" /> Thêm lịch
										</Button>
									</div>
								</div>

								<div className="d-flex justify-content-end mt-3">
									<Button
										variant="outline"
										onClick={() => {
											setScheduleDateFilter("");
											setScheduleEmployeeFilter("");
											setScheduleShiftFilter("");
											setScheduleAttendanceFilter("all");
										}}
									>
										<FaFilter className="me-2" /> Xóa bộ lọc
									</Button>
								</div>
							</Card.Body>
						</Card>

						<Card className="admin-panel border-0">
							<Card.Header className="bg-white border-0 pt-3 px-3 px-md-4 d-flex justify-content-between align-items-center">
								<h6 className="mb-0 fw-semibold">Danh sách lịch làm việc</h6>
								<Badge bg="light" text="dark">{schedules.length} bản ghi</Badge>
							</Card.Header>
							<Card.Body className="pt-1">
								<WorkScheduleTable
									schedules={schedules}
									loading={scheduleLoading}
									page={schedulePage}
									onEdit={openScheduleModal}
									onDelete={setScheduleDeleteId}
									onCheckIn={(id) => handleScheduleAction(() => workScheduleService.checkIn(id), "Check-in thành công")}
									onCheckOut={(id) => handleScheduleAction(() => workScheduleService.checkOut(id), "Check-out thành công")}
									onPresent={(id) => handleScheduleAction(() => workScheduleService.markPresent(id), "Đã đánh dấu đi làm")}
									onAbsent={(id) => handleScheduleAction(() => workScheduleService.markAbsent(id), "Đã đánh dấu vắng")}
								/>
							</Card.Body>
						</Card>

						<EntityPagination page={schedulePage} totalPages={scheduleTotalPages} onPageChange={setSchedulePage} />
					</>
				)}
			</Container>

			<Modal show={showShiftModal} onHide={() => setShowShiftModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc"}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column gap-3">
					<div>
						<label className="form-label">Tên ca</label>
						<Input
							value={shiftForm.name}
							onChange={(event) => setShiftForm((prev) => ({ ...prev, name: event.target.value }))}
							placeholder="Ví dụ: Ca sáng"
						/>
					</div>
					<div className="row g-3">
						<div className="col-md-6">
							<label className="form-label">Giờ bắt đầu</label>
							<Input
								type="time"
								value={shiftForm.startTime}
								onChange={(event) => setShiftForm((prev) => ({ ...prev, startTime: event.target.value }))}
							/>
						</div>
						<div className="col-md-6">
							<label className="form-label">Giờ kết thúc</label>
							<Input
								type="time"
								value={shiftForm.endTime}
								onChange={(event) => setShiftForm((prev) => ({ ...prev, endTime: event.target.value }))}
							/>
						</div>
					</div>
					<Form.Check
						type="switch"
						checked={shiftForm.isActive}
						onChange={(event) => setShiftForm((prev) => ({ ...prev, isActive: event.target.checked }))}
						label="Kích hoạt"
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setShowShiftModal(false)}>Hủy</Button>
					<Button onClick={handleSaveShift}>Lưu</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={showEmployeeModal} onHide={() => setShowEmployeeModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column gap-3">
					<div>
						<label className="form-label">Họ và tên</label>
						<Input
							value={employeeForm.fullName}
							onChange={(event) => setEmployeeForm((prev) => ({ ...prev, fullName: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Tên đăng nhập</label>
						<Input
							value={employeeForm.username}
							onChange={(event) => setEmployeeForm((prev) => ({ ...prev, username: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Email</label>
						<Input
							type="email"
							value={employeeForm.email}
							onChange={(event) => setEmployeeForm((prev) => ({ ...prev, email: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Mật khẩu {editingEmployee ? "(để trống nếu không đổi)" : ""}</label>
						<Input
							type="password"
							value={employeeForm.password}
							onChange={(event) => setEmployeeForm((prev) => ({ ...prev, password: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Vai trò</label>
						<Form.Select
							value={employeeForm.role}
							onChange={(event) => setEmployeeForm((prev) => ({ ...prev, role: event.target.value }))}
						>
							{EMPLOYEE_ROLES.map((role) => (
								<option key={role} value={role}>{role}</option>
							))}
						</Form.Select>
					</div>
					<Form.Check
						type="switch"
						checked={employeeForm.isActive}
						onChange={(event) => setEmployeeForm((prev) => ({ ...prev, isActive: event.target.checked }))}
						label="Kích hoạt"
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setShowEmployeeModal(false)}>Hủy</Button>
					<Button onClick={handleSaveEmployee}>Lưu</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingSchedule ? "Cập nhật lịch làm việc" : "Thêm lịch làm việc"}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column gap-3">
					<div>
						<label className="form-label">Nhân viên</label>
						<Form.Select
							value={scheduleForm.employeeId}
							onChange={(event) => setScheduleForm((prev) => ({ ...prev, employeeId: event.target.value }))}
						>
							<option value="">Chọn nhân viên</option>
							{lookupEmployees.map((employee) => (
								<option key={employee.id} value={employee.id}>
									{employee.fullName || employee.name || employee.username || employee.id}
								</option>
							))}
						</Form.Select>
					</div>
					<div>
						<label className="form-label">Ca làm việc</label>
						<Form.Select
							value={scheduleForm.shiftId}
							onChange={(event) => setScheduleForm((prev) => ({ ...prev, shiftId: event.target.value }))}
						>
							<option value="">Chọn ca làm việc</option>
							{lookupShifts.map((shift) => (
								<option key={shift.id} value={shift.id}>{shift.name}</option>
							))}
						</Form.Select>
					</div>
					<div>
						<label className="form-label">Ngày làm việc</label>
						<Input
							type="date"
							value={scheduleForm.workDate}
							onChange={(event) => setScheduleForm((prev) => ({ ...prev, workDate: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Ghi chú</label>
						<Form.Control
							as="textarea"
							rows={3}
							value={scheduleForm.notes}
							onChange={(event) => setScheduleForm((prev) => ({ ...prev, notes: event.target.value }))}
						/>
					</div>

					{scheduleForm.employeeId && (
						<small className="text-muted">
							{`Số ngày đã phân: ${selectedDateCounts.total} | `}
							{`Số ngày đã đi làm: ${selectedDateCounts.present}`}
						</small>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setShowScheduleModal(false)}>Hủy</Button>
					<Button onClick={handleSaveSchedule}>Lưu</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={Boolean(employeeDeleteId)} onHide={() => setEmployeeDeleteId(null)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Xác nhận xóa nhân viên</Modal.Title>
				</Modal.Header>
				<Modal.Body>Bạn chắc chắn muốn xóa nhân viên này?</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setEmployeeDeleteId(null)}>Hủy</Button>
					<Button variant="destructive" onClick={handleDeleteEmployee}>Xóa</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={Boolean(scheduleDeleteId)} onHide={() => setScheduleDeleteId(null)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Xác nhận xóa lịch làm việc</Modal.Title>
				</Modal.Header>
				<Modal.Body>Bạn chắc chắn muốn xóa lịch làm việc này?</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setScheduleDeleteId(null)}>Hủy</Button>
					<Button variant="destructive" onClick={handleDeleteSchedule}>Xóa</Button>
				</Modal.Footer>
			</Modal>
		</AdminLayout>
	);
}
