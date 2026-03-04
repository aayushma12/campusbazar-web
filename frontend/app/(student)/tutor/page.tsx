"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Clock, FileText, Send, User, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createTutorRequest, getAvailableTutorRequests, acceptTutorRequest, TutorRequest } from "@/lib/tutorApi";
import { useAuth } from "@/hooks/useAuth";

export default function TutorPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [availableRequests, setAvailableRequests] = useState<TutorRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        subject: "",
        topic: "",
        description: "",
        preferredTime: "",
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchRequests();
        }
    }, [isAuthenticated]);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const data = await getAvailableTutorRequests();
            setAvailableRequests(data);
        } catch (error) {
            console.error("Failed to fetch tutor requests:", error);
            toast.error("Failed to load available requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to request a tutor");
            return;
        }

        try {
            setIsSubmitting(true);
            await createTutorRequest(formData);
            toast.success("Tutor request sent successfully!");
            setFormData({
                subject: "",
                topic: "",
                description: "",
                preferredTime: "",
            });
            fetchRequests(); // Refresh available requests (though your own shouldn't show up)
        } catch (error) {
            toast.error("Failed to send tutor request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        const target = availableRequests.find((r) => r._id === requestId);
        const isOwnRequest = Boolean(target?.studentId?._id && user?.id && target.studentId._id === user.id);

        if (isOwnRequest) {
            toast.error('You cannot accept your own tutor request');
            return;
        }

        try {
            const response = await acceptTutorRequest(requestId);
            toast.success("Request accepted! You are now the tutor.");
            const conversationId = response?.data?.chat?.id || response?.data?.chat?._id;
            const query = conversationId
                ? `/chat/${conversationId}`
                : `/chat?requestId=${requestId}`;
            router.push(query);
            fetchRequests(); // Refresh the list
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to accept request");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <GraduationCap className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 max-w-md">Please sign in to access the Tutor Dashboard and connect with fellow students.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Tutor <span className="text-green-600">Dashboard</span>
                </h1>
                <p className="text-gray-500 mt-2">Connect with peers for peer-to-peer learning and support.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Column A: Request a Tutor Form */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                                <Send className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Request a Tutor</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Mathematics, Computing"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topic</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="topic"
                                        required
                                        value={formData.topic}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Linear Algebra, React Hooks"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="preferredTime"
                                        required
                                        value={formData.preferredTime}
                                        onChange={handleInputChange}
                                        placeholder="e.g. This Saturday at 5 PM"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Briefly describe what you need help with..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Submit Request
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Column B: Available Requests */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 min-h-150">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Available Requests</h2>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                {availableRequests.length} Open
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : availableRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-100 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500">No available tutor requests at the moment.</p>
                                <p className="text-sm text-gray-400 mt-1">Be the first to request help!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {availableRequests.map((request) => (
                                    (() => {
                                        const isOwnRequest = Boolean(request?.studentId?._id && user?.id && request.studentId._id === user.id);
                                        return (
                                    <div
                                        key={request._id}
                                        className="group p-5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-green-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden border-2 border-white shadow-sm">
                                                    {request.studentId.profilePicture ? (
                                                        <img src={request.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        request.studentId.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900">{request.studentId.name}</h3>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                                                        {request.studentId.campus || "Main Campus"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">
                                                    {request.subject}
                                                </span>
                                                <h4 className="text-base font-bold text-gray-900">{request.topic}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-medium">{request.preferredTime}</span>
                                            </div>
                                            <button
                                                onClick={() => handleAcceptRequest(request._id)}
                                                disabled={isOwnRequest}
                                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                            >
                                                {isOwnRequest ? 'Your Request' : 'Accept Request'}
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                        );
                                    })()
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
