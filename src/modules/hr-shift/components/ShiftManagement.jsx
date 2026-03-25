import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Modal, Row, Spinner, Table } from "react-bootstrap";
import { FaCheck, FaFilter, FaPlus, FaSearch, FaTimes, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "react-bootstrap/Form";
import { shiftService } from "@/core/api/shiftService";
import { PAGE_SIZE, getErrorMessage, normalizePageResult, normalizeTime } from "../utils/staffUtils";
import EntityPagination from "./EntityPagination";
import ShiftTable from "./ShiftTable";

export default function ShiftManagement() {
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [shifts, setShifts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [startTimeFilter, setStartTimeFilter] = useState("");
	const [endTimeFilter, setEndTimeFilter] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [editingShift, setEditingShift] = useState(null);
	const [form, setForm] = useState({ name: "", startTime: "", endTime: "", isActive: true });
	const [activeCount, setActiveCount] = useState(0);
	const [inactiveCount, setInactiveCount] = useState(0);

	const clearToastAfter = (setter) => setTimeout(() => setter(""), 2500);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(0);
	}, [debouncedSearch, statusFilter, startTimeFilter, endTimeFilter]);

	const loadCounts = useCallback(async () => {
		try {
			const [activeCount, inactiveCount] = await Promise.all([
				shiftService.countByIsActive(true),
				shiftService.countByIsActive(false),
			]);
			setActiveCount(Number(activeCount || 0));
			setInactiveCount(Number(inactiveCount || 0));
		} catch {
			setActiveCount(0);
			setInactiveCount(0);
		}
	}, []);

	const loadShifts = useCallback(async () => {
		try {
			setLoading(true);
			setError("");

			let result;
			if (debouncedSearch) {
				result = await shiftService.findByNameContainingIgnoreCase(debouncedSearch, page, PAGE_SIZE);
			} else if (statusFilter !== "all") {
				result = await shiftService.findByIsActive(statusFilter === "true", page, PAGE_SIZE);
			} else if (startTimeFilter && endTimeFilter) {
				result = await shiftService.findOverlaping(startTimeFilter, endTimeFilter, page, PAGE_SIZE);
			} else if (startTimeFilter) {
				result = await shiftService.findByStartTimeGreaterThanEqual(startTimeFilter, page, PAGE_SIZE);
			} else if (endTimeFilter) {
				result = await shiftService.findByEndTimeLessThanEqual(endTimeFilter, page, PAGE_SIZE);
			} else {
				result = await shiftService.getAllShifts(page, PAGE_SIZE);
			}

			const normalized = normalizePageResult(result);

			const filtered = normalized.content.filter((item) => {
				if (statusFilter === "true" && !item.isActive) return false;
				if (statusFilter === "false" && item.isActive) return false;
				if (debouncedSearch && !String(item.name || "").toLowerCase().includes(debouncedSearch.toLowerCase())) {
					return false;
				}
				if (startTimeFilter && String(item.startTime || "") < startTimeFilter) return false;
				if (endTimeFilter && String(item.endTime || "") > endTimeFilter) return false;
				return true;
			});

			setShifts(filtered);
			setTotalPages(normalized.totalPages || 1);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể tải danh sách ca làm việc"));
		} finally {
			setLoading(false);
		}
	}, [debouncedSearch, page, statusFilter, startTimeFilter, endTimeFilter]);

	useEffect(() => {
		loadCounts();
	}, [loadCounts]);

	useEffect(() => {
		loadShifts();
	}, [loadShifts]);

	useEffect(() => {
		loadCounts();
	}, [loadCounts, shifts]);

	const openModal = (shift = null) => {
		setEditingShift(shift);
		setForm({
			name: shift?.name || "",
			startTime: shift?.startTime || "",
			endTime: shift?.endTime || "",
			isActive: shift?.isActive ?? true,
		});
		setShowModal(true);
	};

	const handleSave = async () => {
		try {
			if (!form.name.trim()) {
				setError("Tên ca làm việc không được để trống");
				return;
			}

			if (!form.startTime || !form.endTime) {
				setError("Vui lòng chọn giờ bắt đầu và giờ kết thúc");
				return;
			}

			const payload = {
				name: form.name.trim(),
				startTime: normalizeTime(form.startTime),
				endTime: normalizeTime(form.endTime),
				isActive: form.isActive,
			};

			if (!editingShift) {
				try {
					const exists = await shiftService.existByName(payload.name);
					if (exists === true) {
						setError("Tên ca làm việc đã tồn tại");
						return;
					}
				} catch {
					// Allow continue if endpoint does not exist.
				}

				await shiftService.createShift(payload);
				setSuccess("Tạo ca làm việc thành công");
			} else {
				await shiftService.updateShift(editingShift.id, payload);
				setSuccess("Cập nhật ca làm việc thành công");
			}

			setShowModal(false);
			setEditingShift(null);
			await loadShifts();
			await loadCounts();
			clearToastAfter(setSuccess);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể lưu ca làm việc"));
		}
	};

	const handleToggleActive = async (shift) => {
		try {
			if (shift.isActive) {
				await shiftService.deactivateShift(shift.id);
				setSuccess("Đã tạm dừng ca làm việc");
			} else {
				await shiftService.activateShift(shift.id);
				setSuccess("Đã kích hoạt ca làm việc");
			}

			await loadShifts();
			await loadCounts();
			clearToastAfter(setSuccess);
		} catch (err) {
			setError(getErrorMessage(err, "Không thể thay đổi trạng thái ca làm việc"));
		}
	};

	return (
		<>
			<Row className="g-3 mb-4">
				<Col md={6} lg={4}>
					<Card className="admin-panel border-0 h-100">
						<Card.Body>
							<small className="text-muted">Ca đang hoạt động</small>
							<h3 className="fw-bold mb-0">{activeCount}</h3>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6} lg={4}>
					<Card className="admin-panel border-0 h-100">
						<Card.Body>
							<small className="text-muted">Ca tạm dừng</small>
							<h3 className="fw-bold mb-0">{inactiveCount}</h3>
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
							<label className="form-label">Tìm theo tên ca</label>
							<div className="position-relative">
								<FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
								<Input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Nhập tên ca làm việc..."
									className="ps-5"
								/>
							</div>
						</div>
						<div className="col-md-4 col-lg-2">
							<label className="form-label">Trạng thái</label>
							<Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
								<option value="all">Tất cả</option>
								<option value="true">Kích hoạt</option>
								<option value="false">Tạm dừng</option>
							</Form.Select>
						</div>
						<div className="col-md-4 col-lg-2">
							<label className="form-label">Giờ bắt đầu từ</label>
							<Input type="time" value={startTimeFilter} onChange={(event) => setStartTimeFilter(event.target.value)} />
						</div>
						<div className="col-md-4 col-lg-2">
							<label className="form-label">Giờ kết thúc đến</label>
							<Input type="time" value={endTimeFilter} onChange={(event) => setEndTimeFilter(event.target.value)} />
						</div>
						<div className="col-md-4 col-lg-2 d-grid">
							<Button onClick={() => openModal()}>
								<FaPlus className="me-2" /> Thêm ca
							</Button>
						</div>
					</div>

					<div className="d-flex justify-content-end mt-3">
						<Button
							variant="outline"
							onClick={() => {
								setSearch("");
								setStatusFilter("all");
								setStartTimeFilter("");
								setEndTimeFilter("");
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
					<ShiftTable shifts={shifts} loading={loading} page={page} onEdit={openModal} onToggleActive={handleToggleActive} />
				</Card.Body>
			</Card>

			<EntityPagination page={page} totalPages={totalPages} onPageChange={setPage} />

			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc"}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="d-flex flex-column gap-3">
					<div>
						<label className="form-label">Tên ca</label>
						<Input
							value={form.name}
							onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
							placeholder="Ví dụ: Ca sáng"
						/>
					</div>
					<div className="row g-3">
						<div className="col-md-6">
							<label className="form-label">Giờ bắt đầu</label>
							<Input
								type="time"
								value={form.startTime}
								onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
							/>
						</div>
						<div className="col-md-6">
							<label className="form-label">Giờ kết thúc</label>
							<Input
								type="time"
								value={form.endTime}
								onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
							/>
						</div>
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
		</>
	);
}
