import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api/v1";

const publicApiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
});

export default publicApiClient;
