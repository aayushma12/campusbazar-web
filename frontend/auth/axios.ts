import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

axiosApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    // Correct way: use AxiosHeaders methods to set header
    if (config.headers) {
      config.headers = new axios.AxiosHeaders(config.headers);
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = new axios.AxiosHeaders({ Authorization: `Bearer ${token}` });
    }
  }

  return config;
});

export default axiosApi;
