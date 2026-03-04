"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  CreditCard,
  Calendar,
  Building,
  Camera,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  X,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfilePictureMutation,
} from "@/auth/profileQueries";

// ─── Schema ───────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  studentId: z.string().optional(),
  batch: z.string().optional(),
  collegeId: z.string().optional(),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Component ────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteProfilePictureMutation = useDeleteProfilePictureMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  // Password form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // Sync form to fetched profile
  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        studentId: profile.studentId ?? "",
        batch: profile.batch ?? "",
        collegeId: profile.collegeId ?? "",
      });
      setPreviewImage(profile.profilePicture ?? null);
    }
  }, [profile, resetProfile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeletePicture = async () => {
    if (!confirm("Delete your profile picture?")) return;
    try {
      await deleteProfilePictureMutation.mutateAsync();
      setPreviewImage(null);
      setSelectedFile(null);
      updateUser({ profilePicture: undefined });
      toast.success("Profile picture removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete picture");
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const payload: Record<string, string | File> = {
        name: data.name,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.studentId ? { studentId: data.studentId } : {}),
        ...(data.batch ? { batch: data.batch } : {}),
        ...(data.collegeId ? { collegeId: data.collegeId } : {}),
      };
      if (selectedFile) payload.profilePicture = selectedFile;

      const response = await updateProfileMutation.mutateAsync(payload as any);
      updateUser({
        name: data.name,
        phoneNumber: data.phoneNumber,
        studentId: data.studentId,
        batch: data.batch,
        collegeId: data.collegeId,
        profilePicture: response?.profilePicture ?? previewImage ?? undefined,
      });
      toast.success("Profile updated successfully! ✨");
      setIsEditing(false);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await updateProfileMutation.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      } as any);
      toast.success("Password changed successfully! 🔐");
      resetPassword();
      setShowPasswordSection(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowPasswordSection(false);
    setSelectedFile(null);
    if (profile) {
      resetProfile({
        name: profile.name ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        studentId: profile.studentId ?? "",
        batch: profile.batch ?? "",
        collegeId: profile.collegeId ?? "",
      });
      setPreviewImage(profile.profilePicture ?? null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-8 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-sm transition-all hover:shadow-md"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* ── Profile Info Form ── */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
        {/* Avatar section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-white shadow-xl ring-2 ring-gray-100">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-all shadow-lg border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Info */}
            <div className="text-center sm:text-left">
              <p className="text-xl font-black text-gray-900">{profile?.name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {profile?.role ?? "student"}
              </span>
              {isEditing && previewImage && (
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  disabled={deleteProfilePictureMutation.isPending}
                  className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors sm:ml-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove photo
                </button>
              )}
            </div>
          </div>
          {isEditing && (
            <p className="mt-4 text-xs text-gray-400 text-center sm:text-left">
              Click the camera icon to upload a new photo. Max 5 MB. PNG, JPG, WEBP accepted.
            </p>
          )}
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" error={profileErrors.name?.message}>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  {...regProfile("name")}
                  disabled={!isEditing}
                  className={fieldCls(!!profileErrors.name, !isEditing)}
                />
              </div>
            </FormField>

            <FormField label="Phone Number" error={profileErrors.phoneNumber?.message}>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  {...regProfile("phoneNumber")}
                  disabled={!isEditing}
                  placeholder="+977 98XXXXXXXX"
                  className={fieldCls(false, !isEditing)}
                />
              </div>
            </FormField>

            <FormField label="Student ID" error={profileErrors.studentId?.message}>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  {...regProfile("studentId")}
                  disabled={!isEditing}
                  placeholder="e.g. 076BEX001"
                  className={fieldCls(false, !isEditing)}
                />
              </div>
            </FormField>

            <FormField label="Batch / Year" error={profileErrors.batch?.message}>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  {...regProfile("batch")}
                  disabled={!isEditing}
                  placeholder="e.g. 2021-2025"
                  className={fieldCls(false, !isEditing)}
                />
              </div>
            </FormField>

            <FormField
              label="College ID"
              error={profileErrors.collegeId?.message}
              className="sm:col-span-2"
            >
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  {...regProfile("collegeId")}
                  disabled={!isEditing}
                  placeholder="e.g. KEC-2076"
                  className={fieldCls(false, !isEditing)}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Action buttons */}
        {isEditing && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={profileSubmitting || updateProfileMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
            >
              {profileSubmitting || updateProfileMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            Change Password
          </h2>
          <button
            type="button"
            onClick={() => setShowPasswordSection((v) => !v)}
            className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-wide transition-colors"
          >
            {showPasswordSection ? "Cancel" : "Update Password"}
          </button>
        </div>

        {showPasswordSection && (
          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4 animate-fade-up"
            noValidate
          >
            <FormField label="Current Password" error={pwErrors.oldPassword?.message}>
              <div className="relative">
                <input
                  type={showOldPw ? "text" : "password"}
                  {...regPassword("oldPassword")}
                  placeholder="••••••••"
                  className={fieldCls(!!pwErrors.oldPassword, false, true)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowOldPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="New Password" error={pwErrors.newPassword?.message}>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    {...regPassword("newPassword")}
                    placeholder="••••••••"
                    className={fieldCls(!!pwErrors.newPassword, false, true)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Confirm Password" error={pwErrors.confirmPassword?.message}>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    {...regPassword("confirmPassword")}
                    placeholder="••••••••"
                    className={fieldCls(!!pwErrors.confirmPassword, false, true)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            <button
              type="submit"
              disabled={pwSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
            >
              {pwSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              ) : (
                <><Lock className="w-4 h-4" /> Update Password</>
              )}
            </button>
          </form>
        )}

        {!showPasswordSection && (
          <p className="text-sm text-gray-400">
            Keep your account secure with a strong, unique password.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────
function FormField({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
}

function fieldCls(hasError: boolean, disabled: boolean, noLeftPad = false) {
  return `w-full ${noLeftPad ? "px-4" : "pl-10 pr-4"} py-3 border ${hasError
      ? "border-red-400"
      : disabled
        ? "border-gray-100 bg-gray-50/70"
        : "border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
    } rounded-xl transition-all outline-none text-sm font-medium ${disabled ? "text-gray-500 bg-gray-50/70 cursor-default" : "text-gray-900 bg-white"
    }`;
}
