import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import { FaCalendarAlt, FaCheck, FaClock, FaTimes, FaTrash, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE, formatDate, formatDateTime, calculateAttendanceStatus } from "../utils/staffUtils";

export default function WorkScheduleTable({
	schedules,
	loading,
	page,
	onEdit,
	onDelete,
}) {
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
						return (
							<tr key={schedule.id}>
								<td>{page * PAGE_SIZE + index + 1}</td>
								<td>{formatDate(schedule.workDate || schedule.date)}</td>
								<td>{schedule.employeeFullName || schedule.employee?.fullName || "-"}</td>
								<td>{schedule.shiftName || schedule.shift?.name || "-"}</td>
								<td>{formatDateTime(schedule.checkInTime)}</td>
								<td>{formatDateTime(schedule.checkOutTime)}</td>
								<td>
									{(() => {
										const attendanceInfo = calculateAttendanceStatus(schedule);
										return (
											<Badge bg={attendanceInfo.variant}>
												{attendanceInfo.status}
											</Badge>
										);
									})()}
								</td>
								<td>
									<div className="d-flex justify-content-end gap-2 flex-wrap">
										<Button variant="outline" size="icon-sm" title="Sửa" onClick={() => onEdit(schedule)}>
											<FaUserTie />
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
