import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CircleHelp, LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "@/modules/auth/components/LoginForm";
import { authService } from "@/core/api/authService";
import { ALLOWED_STAFF_ROLES, useAuthStore } from "@/core/store/useAuthStore";
import "@/modules/auth/styles/auth.css";

const ROLE_LANDING_PATH = {
	ADMIN: "/admin",
	STORE_MANAGER: "/admin",
	INVENTORY_STAFF: "/admin/inventory",
	CASHIER: "/orders",
};

export default function LoginPage() {
	const navigate = useNavigate();
	const loginSuccess = useAuthStore((state) => state.loginSuccess);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
	const [isForgotMode, setIsForgotMode] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [forgotMessage, setForgotMessage] = useState("");
	const [forgotUsername, setForgotUsername] = useState("");
	const [forgotEmail, setForgotEmail] = useState("");

	const handleLogin = async (values) => {
		try {
			setIsSubmitting(true);
			setErrorMessage("");

			const authData = await authService.login(values);

			if (!authData.token) {
				setErrorMessage("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
				return;
			}

			if (!ALLOWED_STAFF_ROLES.includes(authData.role)) {
				setErrorMessage("Tài khoản không được cấp quyền truy cập hệ thống bán hàng.");
				return;
			}

			loginSuccess(authData);

			navigate(ROLE_LANDING_PATH[authData.role] || "/admin", {
				replace: true,
			});
		} catch (error) {
			const fallbackError = "Sai thông tin đăng nhập hoặc tài khoản chưa được kích hoạt.";
			setErrorMessage(error?.response?.data?.message || fallbackError);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleForgotPassword = async (event) => {
		event.preventDefault();

		if (!forgotUsername.trim() || !forgotEmail.trim()) {
			setForgotMessage("Vui lòng nhập tên đăng nhập và email công việc.");
			return;
		}

		try {
			setForgotMessage("");
			setIsForgotSubmitting(true);

			const result = await authService.forgotPassword({
				username: forgotUsername.trim(),
				email: forgotEmail.trim(),
			});

			setForgotMessage(result.message);
		} catch (error) {
			setForgotMessage(
				error?.response?.data?.message ||
					"Không gửi được yêu cầu đặt lại mật khẩu. Vui lòng liên hệ admin để được hỗ trợ."
			);
		} finally {
			setIsForgotSubmitting(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-noise" aria-hidden />
			<div className="container py-4 py-md-5">
				<div className="row align-items-center g-4 g-lg-5">
					<div className="col-lg-6">
						<div className="auth-intro-panel">
							<div className="auth-badge">
								<Building2 size={16} />
								<span>GroceryStore Internal Access</span>
							</div>
							<h1>Đăng nhập hệ thống vận hành cửa hàng</h1>
							<p className="mb-4">
								Tài khoản được cấp bởi quản trị viên cửa hàng. Vui lòng liên hệ admin nếu bạn chưa có
								tài khoản hoặc gặp vấn đề khi đăng nhập.
							</p>

							<div className="auth-feature-list">
								<div className="auth-feature-item">
									<ShieldCheck size={18} />
									<span>Hỗ trợ vai trò Admin, Store Manager, Inventory Staff và Cashier</span>
								</div>
								<div className="auth-feature-item">
									<LockKeyhole size={18} />
									<span>Phiên đăng nhập được bảo vệ bằng token xác thực</span>
								</div>
								<div className="auth-feature-item">
									<CircleHelp size={18} />
									<span>Quên mật khẩu? Gửi yêu cầu đặt lại ngay trong trang này</span>
								</div>
							</div>
						</div>
					</div>

					<div className="col-lg-6">
						<div className="auth-card shadow-lg border-0">
							<div className="auth-card-body">
								<div className="d-flex align-items-center justify-content-between mb-3">
									<h2 className="mb-0">Đăng nhập</h2>
									<span className="badge text-bg-success-subtle">Staff Only</span>
								</div>

								<LoginForm
									onSubmit={handleLogin}
									onForgotPassword={() => {
										setIsForgotMode((prev) => !prev);
										setForgotMessage("");
									}}
									isSubmitting={isSubmitting}
									errorMessage={errorMessage}
								/>

								{isForgotMode ? (
									<form className="auth-forgot-panel mt-3" onSubmit={handleForgotPassword}>
										<h6 className="fw-bold mb-2">Yêu cầu đặt lại mật khẩu</h6>
										<p className="text-secondary mb-3">
											Nhập thông tin đã đăng ký với admin. Yêu cầu sẽ được xác nhận trước khi cấp mật
											khẩu mới.
										</p>

										<div className="row g-2">
											<div className="col-12">
												<label htmlFor="forgot-username" className="form-label fw-semibold mb-1">
													Tên đăng nhập
												</label>
												<input
													id="forgot-username"
													className="form-control"
													value={forgotUsername}
													onChange={(event) => setForgotUsername(event.target.value)}
													placeholder="Ví dụ: cashier.nguyen"
												/>
											</div>
											<div className="col-12">
												<label htmlFor="forgot-email" className="form-label fw-semibold mb-1">
													Email công việc
												</label>
												<input
													id="forgot-email"
													type="email"
													className="form-control"
													value={forgotEmail}
													onChange={(event) => setForgotEmail(event.target.value)}
													placeholder="staff@grocerystore.vn"
												/>
											</div>
										</div>

										{forgotMessage ? (
											<div className="alert alert-info py-2 mt-3 mb-0">{forgotMessage}</div>
										) : null}

										<button
											type="submit"
											className="btn btn-outline-dark mt-3 w-100"
											disabled={isForgotSubmitting}
										>
											{isForgotSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lại mật khẩu"}
										</button>
									</form>
								) : null}

								<p className="text-secondary small mb-0 mt-3">
									Tài khoản và mật khẩu được cấp bởi quản trị viên cửa hàng. Vui lòng liên hệ admin nếu
									bạn chưa có tài khoản hoặc gặp vấn đề khi đăng nhập.
								</p>

								<div className="pt-3 mt-3 border-top">
									<Link to="/" className="auth-link text-decoration-none">
										Quay về trang chủ
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
