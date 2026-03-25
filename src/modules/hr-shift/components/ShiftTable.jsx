import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import { FaCheck, FaTimes, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "../utils/staffUtils";

export default function ShiftTable({ shifts, loading, page, onEdit, onToggleActive }) {
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
