import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, CircleHelp, LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "@/modules/auth/components/LoginForm";
import { authService } from "@/core/api/authService";
import { ALLOWED_STAFF_ROLES, useAuthStore } from "@/core/store/useAuthStore";
import "@/modules/auth/styles/auth.css";

const ROLE_LANDING_PATH = {
	CASHIER: "/admin",
	INVENTORY_STAFF: "/admin/products",
};

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const loginSuccess = useAuthStore((state) => state.loginSuccess);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
	const [isForgotMode, setIsForgotMode] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [forgotMessage, setForgotMessage] = useState("");
	const [forgotUsername, setForgotUsername] = useState("");
	const [forgotEmail, setForgotEmail] = useState("");

	const fromRoute = location.state?.from?.pathname;

	const handleLogin = async (values) => {
		try {
			setIsSubmitting(true);
			setErrorMessage("");

			const authData = await authService.login(values);

			if (!authData.token) {
				setErrorMessage("Dang nhap khong thanh cong. Vui long thu lai.");
				return;
			}

			if (!ALLOWED_STAFF_ROLES.includes(authData.role)) {
				setErrorMessage("Tai khoan khong duoc cap quyen truy cap he thong ban hang.");
				return;
			}

			loginSuccess(authData);

			navigate(fromRoute || ROLE_LANDING_PATH[authData.role] || "/admin", {
				replace: true,
			});
		} catch (error) {
			const fallbackError = "Sai thong tin dang nhap hoac tai khoan chua duoc kich hoat.";
			setErrorMessage(error?.response?.data?.message || fallbackError);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleForgotPassword = async (event) => {
		event.preventDefault();

		if (!forgotUsername.trim() || !forgotEmail.trim()) {
			setForgotMessage("Vui long nhap ten dang nhap va email cong viec.");
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
					"Khong gui duoc yeu cau dat lai mat khau. Vui long lien he admin de duoc ho tro."
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
							<h1>Dang nhap he thong van hanh cua hang</h1>
							<p className="mb-4">
								Tai khoan duoc cap boi quan tri vien. Nhan vien thu ngan va nhan vien kho su dung
								tai day de xu ly ban hang, ton kho va van hanh theo ca.
							</p>

							<div className="auth-feature-list">
								<div className="auth-feature-item">
									<ShieldCheck size={18} />
									<span>Chi chap nhan vai tro Cashier hoac Inventory Staff</span>
								</div>
								<div className="auth-feature-item">
									<LockKeyhole size={18} />
									<span>Moi phien dang nhap duoc bao ve bang token xac thuc</span>
								</div>
								<div className="auth-feature-item">
									<CircleHelp size={18} />
									<span>Quen mat khau? Gui yeu cau dat lai den admin ngay trong trang nay</span>
								</div>
							</div>
						</div>
					</div>

					<div className="col-lg-6">
						<div className="auth-card shadow-lg border-0">
							<div className="auth-card-body">
								<div className="d-flex align-items-center justify-content-between mb-3">
									<h2 className="mb-0">Dang nhap</h2>
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
										<h6 className="fw-bold mb-2">Yeu cau dat lai mat khau</h6>
										<p className="text-secondary mb-3">
											Nhap thong tin da dang ky voi admin. Yeu cau se duoc xac nhan truoc khi cap
											mat khau moi.
										</p>

										<div className="row g-2">
											<div className="col-12">
												<label htmlFor="forgot-username" className="form-label fw-semibold mb-1">
													Ten dang nhap
												</label>
												<input
													id="forgot-username"
													className="form-control"
													value={forgotUsername}
													onChange={(event) => setForgotUsername(event.target.value)}
													placeholder="Vi du: cashier.nguyen"
												/>
											</div>
											<div className="col-12">
												<label htmlFor="forgot-email" className="form-label fw-semibold mb-1">
													Email cong viec
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
											{isForgotSubmitting ? "Dang gui yeu cau..." : "Gui yeu cau dat lai mat khau"}
										</button>
									</form>
								) : null}

								<p className="text-secondary small mb-0 mt-3">
									Tai khoan moi duoc tao boi quan tri vien. Neu ban chua co tai khoan, vui long lien
									he admin cua cua hang.
								</p>

								<div className="pt-3 mt-3 border-top">
									<Link to="/" className="auth-link text-decoration-none">
										Quay ve trang chu cua cua hang
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
