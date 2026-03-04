'use client';

import { useState } from 'react';
import { useMyBookings, useInitiateBookingPayment } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/formatters';
import {
    BookOpen,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    CreditCard,
    Loader2,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import EsewaCheckoutForm from '@/components/payment/EsewaCheckoutForm';
import type { EsewaPaymentData } from '@/types/payment';

export default function MyBookingsPage() {
    const { user } = useAuth();
    const [role, setRole] = useState<'student' | 'tutor'>('student');
    const { data: bookingsData, isLoading } = useMyBookings(role);
    const bookings = bookingsData?.data ?? [];

    const { mutateAsync: initPayment, isPending: initiating } = useInitiateBookingPayment();
    const [paymentData, setPaymentData] = useState<EsewaPaymentData | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    async function handlePay(bookingId: string) {
        const toastId = toast.loading('Preparing payment…');
        try {
            setSelectedBookingId(bookingId);
            const res = await initPayment(bookingId);
            setPaymentData(res.data as any);
            toast.dismiss(toastId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to initiate payment', { id: toastId });
            setSelectedBookingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Auto-submit form to eSewa (mounts only after init) */}
            {paymentData && (
                <EsewaCheckoutForm
                    paymentData={paymentData}
                    onTimeout={() => {
                        setPaymentData(null);
                        setSelectedBookingId(null);
                        toast.error('Redirect timed out. Please try again.');
                    }}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage your tutoring sessions and payments.</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setRole('student')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === 'student'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        As Student
                    </button>
                    <button
                        onClick={() => setRole('tutor')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === 'tutor'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        As Tutor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {bookings.length > 0 ? (
                    bookings.map((booking: any) => (
                        <div
                            key={booking._id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 p-6 lg:p-8 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left: Status & Main Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={booking.status} />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            #{booking._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {booking.subject}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {booking.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            {formatDate(booking.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            {booking.hours} hours
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-indigo-500" />
                                            {formatPrice(booking.ratePerHour)}/hr
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Party info & Price */}
                                <div className="lg:w-72 flex flex-col justify-between gap-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                {role === 'student' ? 'Tutor' : 'Student'}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {role === 'student' ? booking.tutorId?.name : booking.studentId?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                                            <p className="text-2xl font-black text-gray-900">{formatPrice(booking.totalAmount)}</p>
                                        </div>

                                        {role === 'student' && booking.status === 'pending' && (
                                            <button
                                                onClick={() => handlePay(booking._id)}
                                                disabled={initiating && selectedBookingId === booking._id}
                                                className="px-6 py-2.5 bg-[#60bb46] hover:bg-[#4ea33a] text-white font-bold rounded-xl transition-all shadow-lg shadow-green-100 flex items-center gap-2 text-sm"
                                            >
                                                {initiating && selectedBookingId === booking._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CreditCard className="w-4 h-4" />
                                                )}
                                                Pay with eSewa
                                            </button>
                                        )}

                                        {booking.status === 'paid' && booking.conversationId && (
                                            <Link
                                                href={`/chat/${booking.conversationId}`}
                                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 text-sm"
                                            >
                                                Chat with {role === 'student' ? 'Tutor' : 'Student'}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">No bookings found</h3>
                            <p className="text-gray-500">You haven&apos;t {role === 'student' ? 'made any bookings' : 'received any bookings'} yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'paid':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                </span>
            );
        case 'pending':
        case 'awaiting_payment':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    {status === 'pending' ? 'Pending' : 'Awaiting Payment'}
                </span>
            );
        case 'cancelled':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                    <XCircle className="w-3.5 h-3.5" />
                    Cancelled
                </span>
            );
        default:
            return <span className="text-xs font-bold text-gray-400 uppercase">{status}</span>;
    }
}
