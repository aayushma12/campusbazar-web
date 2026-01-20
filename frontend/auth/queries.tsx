import { useMutation } from "@tanstack/react-query";
import axiosApi from "./axios";
import { ENDPOINTS } from "./endpoints";

/* ================= REGISTER ================= */

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await axiosApi.post(ENDPOINTS.REGISTER, data);
      return res.data;
    },
    onError: (error: any) => {
      console.error("Registration failed:", error.response?.data?.message || error.message);
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
  });
};

/* ================= LOGIN ================= */

interface LoginPayload {
  email: string;
  password: string;
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosApi.post(ENDPOINTS.LOGIN, data);
      return res.data;
    },
    onError: (error: any) => {
      console.error("Login failed:", error.response?.data?.message || error.message);
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
    },
  });
};
