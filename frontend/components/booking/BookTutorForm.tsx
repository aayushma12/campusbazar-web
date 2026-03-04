'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBooking } from '@/hooks/useBooking';
import { Loader2, BookOpen, Clock, Monitor, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookTutorFormProps {
    tutorId: string;
    tutorName: string;
    /** Suggested rate — tutor or page can pass this in */
    defaultRate?: number;
}

export default function BookTutorForm({ tutorId, tutorName, defaultRate = 500 }: BookTutorFormProps) {
    const router = useRouter();
    const { mutateAsync: createBooking, isPending } = useCreateBooking();

    const [form, setForm] = useState({
        subject: '',
        description: '',
        sessionType: 'online' as 'online' | 'in-person',
        hours: 1,
        ratePerHour: defaultRate,
    });

    const totalAmount = Math.round(form.hours * form.ratePerHour);
    const platformFee = Math.round(totalAmount * 0.10);
    const tutorEarns = totalAmount - platformFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.subject.trim()) { toast.error('Please enter a subject'); return; }
        if (form.hours < 0.5) { toast.error('Minimum 0.5 hours'); return; }
        if (form.ratePerHour < 1) { toast.error('Rate must be at least 1'); return; }

        try {
            const res = await createBooking({ tutorId, ...form });
            if (res.success) {
                toast.success('Booking created! Proceed to payment.');
                router.push('/dashboard/bookings');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create booking');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Topic</label>
                <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="e.g. Calculus, Python, English Grammar"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details <span className="text-gray-400">(optional)</span></label>
                <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                    placeholder="Describe what you need help with..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
            </div>

            {/* Session Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <div className="flex gap-3">
                    {(['online', 'in-person'] as const).map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, sessionType: type }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.sessionType === type
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {type === 'online' ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            {type === 'online' ? 'Online' : 'In-Person'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hours + Rate */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            value={form.hours}
                            onChange={e => setForm(f => ({ ...f, hours: parseFloat(e.target.value) || 0.5 }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate / Hour (NPR)</label>
                    <input
                        type="number"
                        min={1}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        value={form.ratePerHour}
                        onChange={e => setForm(f => ({ ...f, ratePerHour: parseInt(e.target.value) || 1 }))}
                    />
                </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>{form.hours}h × NPR {form.ratePerHour}</span>
                    <span>NPR {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Platform fee (10%)</span>
                    <span>NPR {platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>{tutorName} earns</span>
                    <span>NPR {tutorEarns.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-800">
                    <span>You pay</span>
                    <span className="text-emerald-600">NPR {totalAmount.toLocaleString()}</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
                {isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Booking…</>
                    : <><BookOpen className="w-4 h-4" /> Book {tutorName} <ChevronRight className="w-4 h-4" /></>
                }
            </button>
        </form>
    );
}
