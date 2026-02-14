import { useMutation, useQuery } from "@tanstack/react-query";
import axiosApi from "./axios";
import { ENDPOINTS } from "./endpoints";

/* ================= REGISTER ================= */

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    phoneNumber?: string;
    studentId?: string;
    batch?: string;
    collegeId?: string;
    profilePicture?: string;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterPayload): Promise<AuthResponse> => {
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
    mutationFn: async (data: LoginPayload): Promise<AuthResponse> => {
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

/**
 * Admin login - uses the real backend API and verifies admin role
 */
export const useAdminLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginPayload): Promise<AuthResponse> => {
      const res = await axiosApi.post(ENDPOINTS.LOGIN, data);

      // Verification: Check if the user returned has the admin role
      if (res.data.user.role !== 'admin') {
        throw new Error("Access denied: You do not have administrator privileges.");
      }

      return res.data;
    },
    onError: (error: any) => {
      console.error("Admin login failed:", error.response?.data?.message || error.message);
    },
    onSuccess: (data) => {
      console.log("Admin login successful:", data);
    },
  });
};

/* ================= GET USERS ================= */

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<any> => {
      const res = await axiosApi.get(ENDPOINTS.USERS);
      return res.data;
    },
  });
};

