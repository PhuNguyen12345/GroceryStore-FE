// Constants
export const PAGE_SIZE = 10;
export const EMPLOYEE_ROLES = ["ADMIN", "INVENTORY_STAFF", "CASHIER"];
export const ATTENDANCE_OPTIONS = ["PENDING", "PRESENT", "ABSENT"];

// Pagination helpers
export function getPageItems(total, current) {
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

// Normalization helpers
export function normalizePageResult(result) {
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

// Error handling
export function getErrorMessage(err, fallback) {
	const data = err?.response?.data;
	if (typeof data === "string" && data.trim()) return data;
	if (data?.message) return data.message;
	return fallback || err?.message || "Đã có lỗi xảy ra";
}

// Date/Time formatting
export function formatDate(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("vi-VN");
}

export function formatDateTime(dateValue) {
	if (!dateValue) return "-";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString("vi-VN");
}

export function normalizeTime(time = "") {
	const value = String(time || "").trim();
	if (!value) return "";
	return value.length === 5 ? `${value}:00` : value;
}

// Boolean filtering
export function toBooleanFilter(value) {
	if (value === "all") return undefined;
	return value === "true";
}

// Attendance status calculation
export function calculateAttendanceStatus(schedule) {
	// If shift has no start time, use original attendance status
	const shiftStartTimeStr = schedule.shift?.startTime || schedule.shiftStartTime;
	const checkInTimeStr = schedule.checkInTime || schedule.checkIn;
	const isPresent = schedule?.isPresent;

	if (!checkInTimeStr) {
		if (isPresent === true) {
			return { status: "Điểm danh bù", variant: "primary", label: "Makeup" };
		}
		return { status: "Vắng", variant: "danger", label: "Vắng" };
	}

	if (!shiftStartTimeStr) {
		// No shift time to compare, use original status
		const originalStatus = schedule.isPresent || schedule.status || "PENDING";
		return {
			status: originalStatus === true ? "Đi làm" : originalStatus === false ? "Vắng" : "Chưa xác định",
			variant: originalStatus === true ? "success" : originalStatus === false ? "danger" : "warning",
			label: originalStatus,
		};
	}

	try {
		// Parse times
		const checkInDate = new Date(checkInTimeStr);
		if (Number.isNaN(checkInDate.getTime())) {
			return { status: "Vắng", variant: "danger", label: "Vắng" };
		}

		// Extract time part from shift start time (e.g., "08:00:00" or "08:00")
		const shiftTimeMatch = String(shiftStartTimeStr).match(/(\d{1,2}):(\d{2})/);
		if (!shiftTimeMatch) {
			return { status: "Vắng", variant: "danger", label: "Vắng" };
		}

		const [, shiftHour, shiftMinute] = shiftTimeMatch;
		const shiftStartMinutes = parseInt(shiftHour) * 60 + parseInt(shiftMinute);

		// Calculate check-in time as minutes from midnight
		const checkInHours = checkInDate.getHours();
		const checkInMinutes = checkInDate.getMinutes();
		const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;

		// Calculate difference (negative = early, positive = late)
		const minutesDifference = checkInTotalMinutes - shiftStartMinutes;

		// On time if: early up to 10 min OR late up to 5 min
		if (minutesDifference >= -10 && minutesDifference <= 5) {
			return { status: "Đúng giờ", variant: "success", label: "On Time" };
		}

		// Late if more than 5 minutes
		if (minutesDifference > 5) {
			return { status: "Muộn", variant: "warning", label: "Late" };
		}

		// Very early (more than 10 minutes)
		if (minutesDifference < -10) {
			return { status: "Sớm", variant: "info", label: "Early" };
		}

		return { status: "Vắng", variant: "danger", label: "Absent" };
	} catch {
		return { status: "Vắng", variant: "danger", label: "Absent" };
	}
}
