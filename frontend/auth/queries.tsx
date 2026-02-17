import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApi from "./axios";

/**
 * ============================
 * Interfaces / Types
 * ============================
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  studentId?: string;
  batch?: string;
  collegeId?: string;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ResetPasswordPayload {
  email: string;
}

/**
 * ============================
 * LOGIN MUTATION
 * ============================
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await axiosApi.post("/auth/login", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(); // refetch queries after login if needed
      console.log("Login successful:", data);
    },
    onError: (error: any) => {
      console.error("Login failed:", error.response?.data?.message || error.message);
    },
  });
};

/**
 * ============================
 * REGISTER MUTATION
 * ============================
 */
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await axiosApi.post("/auth/register", payload);
      return res.data;
    },
  });
};

/**
 * ============================
 * RESET PASSWORD MUTATION
 * ============================
 */
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const res = await axiosApi.post("/auth/reset-password", payload);
      return res.data;
    },
  });
};

/**
 * ============================
 * GET ALL USERS (ADMIN)
 * ============================
 */
export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosApi.get("/admin/users");
      return res.data;
    },
    staleTime: 1000 * 60, // cache 1 minute
  });
};

/**
 * ============================
 * DELETE USER (ADMIN)
 * ============================
 */
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await axiosApi.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

/**
 * ============================
 * UPDATE USER ROLE (ADMIN)
 * ============================
 */
export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await axiosApi.patch(`/admin/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
