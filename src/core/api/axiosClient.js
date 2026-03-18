import axios from "axios";
import { useAuthStore } from "@/core/store/useAuthStore";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api/v1";

const axiosClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token;

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export default axiosClient;
