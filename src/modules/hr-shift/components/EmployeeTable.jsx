import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import { FaCheck, FaTimes, FaTrash, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "../utils/staffUtils";

export default function EmployeeTable({ employees, loading, page, onEdit, onToggleActive, onDelete }) {
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
