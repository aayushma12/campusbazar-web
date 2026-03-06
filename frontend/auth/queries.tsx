// queries.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApi from "./axios";
import { normalizeUser, type User } from "@/types/user";

/**
 * ============================
 * Interfaces / Types
 * ============================
 */

// Payloads
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  university: string;
  campus: string;
  role?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
  token: string;
}

/**
 * ============================
 * LOGIN MUTATION
 * ============================
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await axiosApi.post("/auth/login", payload); // ✅ no /api/v1 prefix
      return res.data;
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
 * FORGOT PASSWORD MUTATION
 * ============================
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const res = await axiosApi.post("/auth/forgot-password", payload);
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
    mutationFn: async ({ password, token }: ResetPasswordPayload) => {
      console.log("Reset password called with token:", token);
      const res = await axiosApi.post(`/auth/reset-password/${token}`, { password });
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
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const res = await axiosApi.get("/auth/users");
      const payload = res.data;
      const rawUsers = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.users)
            ? payload.users
            : Array.isArray(payload)
              ? payload
              : [];

      return rawUsers
        .map((raw: unknown) => normalizeUser(raw))
        .filter((user: User | null): user is User => user !== null);
    },
    staleTime: 1000 * 60,
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
      if (!userId) {
        throw new Error("Missing user id for delete operation.");
      }

      const attempts: Array<{
        method: "delete" | "post";
        path: string;
        body?: Record<string, unknown>;
      }> = [
          { method: "delete", path: `/auth/users/${userId}` },
          { method: "delete", path: `/users/${userId}` },
          { method: "delete", path: `/auth/user/${userId}` },
          { method: "delete", path: `/admin/users/${userId}` },
          { method: "delete", path: `/auth/users/delete/${userId}` },
          { method: "delete", path: `/users/delete/${userId}` },
          { method: "post", path: `/auth/users/${userId}/delete`, body: {} },
          { method: "post", path: `/auth/users/delete`, body: { userId } },
          { method: "post", path: `/users/delete`, body: { userId } },
        ];

      let lastError: unknown;
      const failedRoutes: string[] = [];

      for (const attempt of attempts) {
        try {
          const res =
            attempt.method === "delete"
              ? await axiosApi.delete(attempt.path)
              : await axiosApi.post(attempt.path, attempt.body ?? {});
          return res.data;
        } catch (error: unknown) {
          const status =
            error && typeof error === "object" && "response" in error
              ? (error as { response?: { status?: number } }).response?.status
              : undefined;
          const shouldTryNext = status === 404 || status === 405;

          failedRoutes.push(`${attempt.method.toUpperCase()} ${attempt.path} (${status ?? "ERR"})`);

          if (!shouldTryNext) {
            throw error;
          }

          lastError = error;
        }
      }

      if (lastError) {
        const routeSummary = failedRoutes.join(", ");
        throw new Error(
          `Delete user endpoint not found. Tried: ${routeSummary}`
        );
      }

      throw lastError;
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
      const res = await axiosApi.patch(`/auth/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};