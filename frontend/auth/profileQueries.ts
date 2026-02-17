import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosApi from "@/auth/axios";

export interface Profile {
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
      return res.data;
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
