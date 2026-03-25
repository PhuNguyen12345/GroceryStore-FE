import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Modal, Row } from "react-bootstrap";
import { FaFilter, FaPlus, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "react-bootstrap/Form";
import { employeeService } from "@/core/api/employeeService";
import {
	EMPLOYEE_ROLES,
	PAGE_SIZE,
	getErrorMessage,
	normalizePageResult,
	toBooleanFilter,
} from "../utils/staffUtils";
import EntityPagination from "./EntityPagination";
import EmployeeTable from "./EmployeeTable";

export default function EmployeeManagement() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [form, setForm] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
		role: "CASHIER",
		isActive: true,
	});
	const [activeCount, setActiveCount] = useState(0);
	const [roleCount, setRoleCount] = useState(0);

	const clearToastAfter = (setter) => setTimeout(() => setter(""), 2500);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(0);
	}, [debouncedSearch, roleFilter, statusFilter]);

	const loadCounts = useCallback(async () => {
		try {
			const activeCount = await employeeService.countActive();
			setActiveCount(Number(activeCount || 0));
		} catch {
			setActiveCount(0);
		}

		if (roleFilter === "all") {
			setRoleCount(0);
			return;
		}

		try {
			const count = await employeeService.countByRole(roleFilter);
			setRoleCount(Number(count || 0));
		} catch {
			setRoleCount(0);
		}
	}, [roleFilter]);

	const loadEmployees = useCallback(async () => {
		try {
			setLoading(true);
			setError("");

			let result;
			const hasFilter = Boolean(debouncedSearch) || roleFilter !== "all" || statusFilter !== "all";

			if (hasFilter) {
				result = await employeeService.searchEmployees({
					keyword: debouncedSearch,
					role: roleFilter === "all" ? "" : roleFilter,
					isActive: toBooleanFilter(statusFilter),
					page: page,
					size: PAGE_SIZE,
				});
			} else {
				result = await employeeService.getAllEmployees(page, PAGE_SIZE);
			}

			const normalized = normalizePageResult(result);
			const filtered = normalized.content.filter((item) => {
				if (roleFilter !== "all" && item.role !== roleFilter) return false;
				if (statusFilter === "true" && !item.isActive) return false;
				if (statusFilter === "false" && item.isActive) return false;

				if (debouncedSearch) {
					const text = `${item.fullName || item.name || ""} ${item.username || ""} ${item.email || ""}`
						.toLowerCase();

					if (!text.includes(debouncedSearch.toLowerCase())) return false;
				}

				return true;
			});

			setEmployees(filtered);
			setTotalPages(normalized.totalPages || 1);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể tải danh sách nhân viên"));
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, roleFilter, statusFilter, page]);

	useEffect(() => {
		loadCounts();
	}, [loadCounts]);

	useEffect(() => {
		loadEmployees();
	}, [loadEmployees]);

	useEffect(() => {
		loadCounts();
	}, [loadCounts, employees]);

	const openModal = (employee = null) => {
		setEditingEmployee(employee);
		setForm({
			fullName: employee?.fullName || employee?.name || "",
			username: employee?.username || "",
			email: employee?.email || "",
			password: "",
			role: employee?.role || "CASHIER",
			isActive: employee?.isActive ?? true,
		});
		setShowModal(true);
	};

	const handleSave = async () => {
		try {
			if (!form.fullName.trim() || !form.username.trim()) {
				setError("Vui lòng nhập họ tên và tên đăng nhập");
				return;
			}

			if (!editingEmployee && !form.password.trim()) {
				setError("Vui lòng nhập mật khẩu khi tạo nhân viên");
				return;
			}

			const payload = {
				fullName: form.fullName.trim(),
				username: form.username.trim(),
				email: form.email.trim(),
				role: form.role,
				isActive: form.isActive,
			};

			if (form.password.trim()) {
				payload.password = form.password.trim();
			}

			if (editingEmployee) {
				await employeeService.updateEmployee(editingEmployee.id, payload);
				setSuccess("Cập nhật nhân viên thành công");
			} else {
				await employeeService.createEmployee(payload);
				setSuccess("Tạo nhân viên thành công");
			}

			setShowModal(false);
			setEditingEmployee(null);
			await loadEmployees();
			await loadCounts();
			clearToastAfter(setSuccess);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể lưu nhân viên"));
		}
	};

	const handleToggleActive = async (employee) => {
		try {
			if (employee.isActive) {
				await employeeService.deactivateEmployee(employee.id);
				setSuccess("Đã tạm dừng nhân viên");
			} else {
				await employeeService.activateEmployee(employee.id);
				setSuccess("Đã kích hoạt nhân viên");
			}

			await loadEmployees();
			await loadCounts();
			clearToastAfter(setSuccess);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể đổi trạng thái nhân viên"));
		}
	};

	const handleDelete = async () => {
		if (!deleteId) return;

		try {
			await employeeService.deleteEmployee(deleteId);
			setSuccess("Xóa nhân viên thành công");
			setDeleteId(null);
			await loadEmployees();
			await loadCounts();
			clearToastAfter(setSuccess);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể xóa nhân viên"));
		}
	};

	return (
		<>
			<Row className="g-3 mb-4">
				<Col md={6} lg={4}>
					<Card className="admin-panel border-0 h-100">
						<Card.Body>
							<small className="text-muted">Nhân viên đang hoạt động</small>
							<h3 className="fw-bold mb-0">{activeCount}</h3>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6} lg={4}>
					<Card className="admin-panel border-0 h-100">
						<Card.Body>
							<small className="text-muted">Số lượng theo vai trò đang lọc</small>
							<h3 className="fw-bold mb-0">{roleCount}</h3>
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
						<div className="col-lg-4">
							<label className="form-label">Tìm nhân viên</label>
							<div className="position-relative">
								<FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
								<Input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Theo tên, username, email..."
									className="ps-5"
								/>
							</div>
						</div>

						<div className="col-md-4 col-lg-2">
							<label className="form-label">Vai trò</label>
							<Form.Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
								<option value="all">Tất cả vai trò</option>
								{EMPLOYEE_ROLES.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</Form.Select>
						</div>

						<div className="col-md-4 col-lg-2">
							<label className="form-label">Trạng thái</label>
							<Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
								<option value="all">Tất cả</option>
								<option value="true">Kích hoạt</option>
								<option value="false">Tạm dừng</option>
							</Form.Select>
						</div>

						<div className="col-md-4 col-lg-2 d-grid">
							<Button onClick={() => openModal()}>
								<FaPlus className="me-2" /> Thêm nhân viên
							</Button>
						</div>
					</div>

					<div className="d-flex justify-content-end mt-3">
						<Button
							variant="outline"
							onClick={() => {
								setSearch("");
								setRoleFilter("all");
								setStatusFilter("all");
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
					<Badge bg="light" text="dark">
						{employees.length} bản ghi
					</Badge>
				</Card.Header>
				<Card.Body className="pt-1">
					<EmployeeTable
						employees={employees}
						loading={loading}
						page={page}
						onEdit={openModal}
						onToggleActive={handleToggleActive}
						onDelete={setDeleteId}
					/>
				</Card.Body>
			</Card>

			<EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />

			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column gap-3">
					<div>
						<label className="form-label">Họ và tên</label>
						<Input
							value={form.fullName}
							onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Tên đăng nhập</label>
						<Input
							value={form.username}
							onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Email</label>
						<Input
							type="email"
							value={form.email}
							onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Mật khẩu {editingEmployee ? "(để trống nếu không đổi)" : ""}</label>
						<Input
							type="password"
							value={form.password}
							onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
						/>
					</div>
					<div>
						<label className="form-label">Vai trò</label>
						<Form.Select
							value={form.role}
							onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
						>
							{EMPLOYEE_ROLES.map((role) => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</Form.Select>
					</div>
					<Form.Check
						type="switch"
						checked={form.isActive}
						onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
						label="Kích hoạt"
					/>
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
					<Modal.Title>Xác nhận xóa nhân viên</Modal.Title>
				</Modal.Header>
				<Modal.Body>Bạn chắc chắn muốn xóa nhân viên này?</Modal.Body>
				<Modal.Footer>
					<Button variant="outline" onClick={() => setDeleteId(null)}>
						Hủy
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						Xóa
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
