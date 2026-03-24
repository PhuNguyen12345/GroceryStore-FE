import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, KeyRound, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";

const loginSchema = z.object({
	username: z.string().min(3, "Vui lòng nhập tên đăng nhập"),
	password: z.string().min(3, "Mật khẩu phải có ít nhất 3 ký tự"),
});

export default function LoginForm({
	onSubmit,
	onForgotPassword,
	isSubmitting = false,
	errorMessage = "",
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
			{errorMessage ? (
				<div className="alert alert-danger d-flex align-items-start gap-2 py-2 mb-1" role="alert">
					<AlertCircle size={16} className="mt-1 flex-shrink-0" />
					<span>{errorMessage}</span>
				</div>
			) : null}

			<Field>
				<FieldLabel htmlFor="username" className="fw-semibold">
					Tên đăng nhập nhân viên
				</FieldLabel>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<UserRound />
					</InputGroupAddon>
					<InputGroupInput
						id="username"
						autoComplete="username"
						placeholder="Nhập tên đăng nhập"
						aria-invalid={Boolean(errors.username)}
						{...register("username")}
					/>
				</InputGroup>
				{errors.username ? <small className="text-danger">{errors.username.message}</small> : null}
			</Field>

			<Field>
				<FieldLabel htmlFor="password" className="fw-semibold">
					Mật khẩu
				</FieldLabel>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<KeyRound />
					</InputGroupAddon>
					<Input
						id="password"
						type="password"
						className="form-control rounded-3"
						autoComplete="current-password"
						placeholder="Nhập mật khẩu"
						style={{ paddingLeft: "2.25rem" }}
						aria-invalid={Boolean(errors.password)}
						{...register("password")}
					/>
				</InputGroup>
				{errors.password ? <small className="text-danger">{errors.password.message}</small> : null}
			</Field>

			<div className="d-flex justify-content-end">
				<button
					type="button"
					className="btn btn-link p-0 text-decoration-none auth-link"
					onClick={onForgotPassword}
				>
					Quên mật khẩu?
				</button>
			</div>

			<Button type="submit" className="w-100 auth-login-btn" disabled={isSubmitting}>
				{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
			</Button>
		</form>
	);
}
