import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApi from "@/auth/axios";
import { normalizeUser, type User } from "@/types/user";

export type Profile = User;

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  studentId?: string;
  batch?: string;
  collegeId?: string;
  oldPassword?: string;
  newPassword?: string;
  profilePicture?: File;
}

const ENDPOINTS = {
  PROFILE: "/profile",
  UPDATE_PROFILE: "/profile",
  DELETE_PROFILE_PICTURE: "/profile/picture",
};

export const useProfileQuery = () => {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosApi.get(ENDPOINTS.PROFILE);

      const payload = res.data;
      const profile = normalizeUser(payload?.data ?? payload);

      if (!profile) {
        throw new Error("Invalid profile response from server");
      }

      return profile;
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const res = await axiosApi.patch(ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useDeleteProfilePictureMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axiosApi.delete(ENDPOINTS.DELETE_PROFILE_PICTURE);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
