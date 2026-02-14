import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosApi from "./axios";
import { ENDPOINTS } from "./endpoints";

/* ================= PROFILE QUERIES ================= */

export interface ProfileData {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    phoneNumber?: string;
    studentId?: string;
    batch?: string;
    collegeId?: string;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Fetch user profile
 */
export const useProfileQuery = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async (): Promise<ProfileData> => {
            const res = await axiosApi.get(ENDPOINTS.PROFILE);
            return res.data;
        },
        retry: 1,
    });
};

/* ================= PROFILE MUTATIONS ================= */

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

/**
 * Update user profile
 */
export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateProfilePayload) => {
            const formData = new FormData();

            // Append text fields
            if (data.name) formData.append("name", data.name);
            if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
            if (data.studentId) formData.append("studentId", data.studentId);
            if (data.batch) formData.append("batch", data.batch);
            if (data.collegeId) formData.append("collegeId", data.collegeId);
            if (data.oldPassword) formData.append("oldPassword", data.oldPassword);
            if (data.newPassword) formData.append("newPassword", data.newPassword);

            // Append file if present
            if (data.profilePicture) {
                formData.append("profilePicture", data.profilePicture);
            }

            const res = await axiosApi.patch(ENDPOINTS.PROFILE, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return res.data;
        },
        onSuccess: () => {
            // Invalidate and refetch profile
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (error: any) => {
            console.error(
                "Profile update failed:",
                error.response?.data?.message || error.message
            );
        },
    });
};

/**
 * Delete profile picture
 */
export const useDeleteProfilePictureMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await axiosApi.delete(ENDPOINTS.PROFILE_PICTURE);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (error: any) => {
            console.error(
                "Delete profile picture failed:",
                error.response?.data?.message || error.message
            );
        },
    });
};
