"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import {
    useProfileQuery,
    useUpdateProfileMutation,
    useDeleteProfilePictureMutation,
} from "@/auth/profileQueries";
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Calendar,
    Building,
    Camera,
    Trash2,
    Save,
    Loader2,
    Eye,
    EyeOff,
    Lock,
} from "lucide-react";

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const { data: profile, isLoading: profileLoading } = useProfileQuery();
    const updateProfileMutation = useUpdateProfileMutation();
    const deleteProfilePictureMutation = useDeleteProfilePictureMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        studentId: "",
        batch: "",
        collegeId: "",
        oldPassword: "",
        newPassword: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phoneNumber: profile.phoneNumber || "",
                studentId: profile.studentId || "",
                batch: profile.batch || "",
                collegeId: profile.collegeId || "",
                oldPassword: "",
                newPassword: "",
            });
            setPreviewImage(profile.profilePicture || null);
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!confirm("Are you sure you want to delete your profile picture?")) {
            return;
        }

        try {
            await deleteProfilePictureMutation.mutateAsync();
            setPreviewImage(null);
            setSelectedFile(null);
            updateUser({ profilePicture: undefined });
            setSuccessMessage("Profile picture deleted successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message || "Failed to delete profile picture"
            );
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const updateData: any = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                studentId: formData.studentId,
                batch: formData.batch,
                collegeId: formData.collegeId,
            };

            // Add password fields if changing password
            if (showPasswordSection && formData.oldPassword && formData.newPassword) {
                updateData.oldPassword = formData.oldPassword;
                updateData.newPassword = formData.newPassword;
            }

            // Add file if selected
            if (selectedFile) {
                updateData.profilePicture = selectedFile;
            }

            const response = await updateProfileMutation.mutateAsync(updateData);

            // Update local user state
            updateUser({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                studentId: formData.studentId,
                batch: formData.batch,
                collegeId: formData.collegeId,
                profilePicture: response.profilePicture || previewImage || undefined,
            });

            setSuccessMessage("Profile updated successfully!");
            setIsEditing(false);
            setShowPasswordSection(false);
            setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
            setSelectedFile(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message || "Failed to update profile"
            );
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your account information and preferences.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {errorMessage}
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-gray-100"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-4xl font-bold border-4 border-white shadow-xl ring-1 ring-gray-100">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg border-2 border-white"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {formData.name || "User"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
                            {isEditing && (
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-indigo-600 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
                                    >
                                        Change Avatar
                                    </button>
                                    {previewImage && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteProfilePicture}
                                            disabled={deleteProfilePictureMutation.isPending}
                                            className="text-xs font-semibold text-red-600 px-3 py-1.5 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            {deleteProfilePictureMutation.isPending ? "Removing..." : "Remove"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-gray-50/50 disabled:text-gray-500 text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 text-opacity-50">
                                Email Address (Locked)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-400 cursor-not-allowed text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-gray-50/50 disabled:text-gray-500 text-sm font-medium"
                                    placeholder="+977 9800000000"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Student ID
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-gray-50/50 disabled:text-gray-500 text-sm font-medium"
                                    placeholder="STU123456"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Batch
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-gray-50/50 disabled:text-gray-500 text-sm font-medium"
                                    placeholder="2024"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                College ID
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="collegeId"
                                    value={formData.collegeId}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-gray-50/50 disabled:text-gray-500 text-sm font-medium"
                                    placeholder="COLL123"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                {isEditing && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-indigo-600" />
                                Change Password
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowPasswordSection(!showPasswordSection)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                            >
                                {showPasswordSection ? "Cancel" : "Modify Password"}
                            </button>
                        </div>

                        {showPasswordSection && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 text-sm"
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Update Profile
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setShowPasswordSection(false);
                                setFormData({
                                    name: profile?.name || "",
                                    phoneNumber: profile?.phoneNumber || "",
                                    studentId: profile?.studentId || "",
                                    batch: profile?.batch || "",
                                    collegeId: profile?.collegeId || "",
                                    oldPassword: "",
                                    newPassword: "",
                                });
                                setPreviewImage(profile?.profilePicture || null);
                                setSelectedFile(null);
                            }}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
