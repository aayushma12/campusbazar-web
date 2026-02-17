import { useMutation } from "@tanstack/react-query";
import axiosApi from "./axios";
import { ENDPOINTS } from "./endpoints";

/* ================= REGISTER ================= */
export interface RegisterPayload {
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
export interface LoginPayload {
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

/* ================= FORGOT PASSWORD ================= */
export interface ForgotPasswordPayload {
  email: string;
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordPayload) => {
      const res = await axiosApi.post(ENDPOINTS.FORGOT_PASSWORD, data);
      return res.data;
    },
    onError: (error: any) => {
      console.error("Forgot password failed:", error.response?.data?.message || error.message);
    },
    onSuccess: (data) => {
      console.log("Reset link sent successfully:", data);
    },
  });
};

/* ================= RESET PASSWORD ================= */
export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const res = await axiosApi.post(ENDPOINTS.RESET_PASSWORD, data);
      return res.data;
    },
    onError: (error: any) => {
      console.error("Reset password failed:", error.response?.data?.message || error.message);
    },
    onSuccess: (data) => {
      console.log("Password reset successfully:", data);
    },
  });
};
