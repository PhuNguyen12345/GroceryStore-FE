import { useState } from "react";
import { Card, Container } from "react-bootstrap";
import { FaCalendarAlt, FaClock, FaUserCheck } from "react-icons/fa";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import ShiftManagement from "../components/ShiftManagement";
import EmployeeManagement from "../components/EmployeeManagement";
import ScheduleManagement from "../components/ScheduleManagement";

export default function StaffPage() {
	const [activeTab, setActiveTab] = useState("shift");

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
							<Button
								variant={activeTab === "employee" ? "default" : "outline"}
								onClick={() => setActiveTab("employee")}
							>
								<FaUserCheck className="me-2" /> Nhân viên
							</Button>
							<Button
								variant={activeTab === "schedule" ? "default" : "outline"}
								onClick={() => setActiveTab("schedule")}
							>
								<FaCalendarAlt className="me-2" /> Lịch làm việc
							</Button>
						</div>
					</Card.Body>
				</Card>

				{activeTab === "shift" && <ShiftManagement />}
				{activeTab === "employee" && <EmployeeManagement />}
				{activeTab === "schedule" && <ScheduleManagement />}
			</Container>
		</AdminLayout>
	);
}
