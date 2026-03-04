'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle2,
    Loader2,
    AlertCircle,
    ArrowRight,
    Copy,
    ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

import { useVerifyPayment } from '@/hooks/usePayment';
import { useConfirmBookingPayment } from '@/hooks/useBooking';
import { decodeEsewaResponse } from '@/lib/esewaApi';
import { formatPrice } from '@/lib/formatters';
import { useClearCart } from '@/hooks/useCart';
import type { EsewaSuccessPayload } from '@/types/payment';
import type { Transaction } from '@/types/payment';

// ─── Page ─────────────────────────────────────────────────────────────────────

function PaymentSuccessPageContent() {
    const searchParams = useSearchParams();
    const { mutateAsync: verifyPayment } = useVerifyPayment();
    const { mutateAsync: confirmBookingPayment } = useConfirmBookingPayment();
    const { mutate: clearCart } = useClearCart();

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [esewaData, setEsewaData] = useState<EsewaSuccessPayload | null>(null);

    // Track if verification already ran (StrictMode double-effect guard)
    const verified = useRef(false);

    useEffect(() => {
        if (verified.current) return;
        verified.current = true;

        const rawData = searchParams.get('data');
        const transactionUuid = searchParams.get('transactionUuid');
        const bookingId = searchParams.get('bookingId');

        if (!rawData) {
            setStatus('error');
            setErrorMsg('Missing payment data from eSewa. If you were redirecting here, the code may be missing.');
            return;
        }

        const decoded = decodeEsewaResponse(rawData) as EsewaSuccessPayload | null;

        if (!decoded) {
            setStatus('error');
            setErrorMsg('The payment data received from eSewa is invalid or corrupted. Please contact support.');
            return;
        }

        setEsewaData(decoded);

        // Verify with backend
        const verificationPayload = {
            transactionCode: decoded.transaction_code,
            transactionUUID: decoded.transaction_uuid || (transactionUuid as string),
            amount: decoded.total_amount,
        };

        const isBooking = !!bookingId || decoded.transaction_uuid?.startsWith('BK-');

        const verifyPromise = isBooking
            ? confirmBookingPayment({
                bookingId: bookingId || '', // Backend now handles missing ID via UUID lookup
                payload: verificationPayload
            })
            : verifyPayment(verificationPayload);

        verifyPromise
            .then((res) => {
                // Determine the correct object to show as "transaction"
                // Product verification returns { success, data: Transaction }
                // Booking confirmation returns { success, data: { booking, conversation } }
                const resultData = res.data;

                if (bookingId) {
                    // It's a booking response
                    const bookingObj = resultData.booking || resultData; // Fallback if structure varies
                    setTransaction(bookingObj);
                } else {
                    // It's a product transaction response
                    setTransaction(resultData);
                }

                setStatus('success');
                // Clear cart after successful payment
                clearCart();
            })
            .catch((err) => {
                const msg =
                    err?.response?.data?.message ??
                    err?.message ??
                    'Verification failed. Please contact support.';
                setErrorMsg(msg);
                setStatus('error');
            });
    }, [searchParams, verifyPayment, confirmBookingPayment]);

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    }

    // ── Verifying ────────────────────────────────────────────────────────────
    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center gap-6 px-4">
                <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900">Verifying Payment</h1>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        Confirming your transaction with eSewa. Please don&apos;t close this tab…
                    </p>
                </div>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                <div>
                    <h1 className="text-2xl font-black text-gray-900">Verification Failed</h1>
                    <p className="text-gray-500 mt-2 max-w-sm leading-relaxed">{errorMsg}</p>
                </div>

                {esewaData && (
                    <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl p-4 text-left space-y-2 text-xs font-mono text-gray-600 shadow-sm">
                        <p className="font-sans font-bold text-gray-900 text-sm mb-3">eSewa Reference</p>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Transaction Code</span>
                            <span>{esewaData.transaction_code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Amount</span>
                            <span>Rs. {esewaData.total_amount}</span>
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-500">
                    If money was deducted, please contact{' '}
                    <a href="mailto:support@campusbazar.com" className="text-green-600 font-semibold hover:underline">
                        support@campusbazar.com
                    </a>{' '}
                    with your eSewa transaction code.
                </p>

                <Link
                    href="/products"
                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────
    // Display amount can come from multiple places
    const paidAmount = (transaction as any)?.amount ?? (transaction as any)?.totalAmount ?? (esewaData ? parseFloat(esewaData.total_amount) : 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            <div className="container mx-auto max-w-lg px-4 py-16">
                {/* Success animation */}
                <div className="flex flex-col items-center gap-6 text-center mb-10">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-200 animate-[bounce_0.6s_ease-out]">
                            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
                        </div>
                        {/* Confetti dots */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 animate-ping" style={{ animationDuration: '1.5s' }} />
                        <div className="absolute -bottom-1 -right-3 w-3 h-3 rounded-full bg-green-300 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute top-4 -right-4 w-3 h-3 rounded-full bg-blue-400 animate-ping" style={{ animationDuration: '1.8s' }} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Payment Successful!</h1>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                            Your payment has been confirmed. The seller has been notified.
                        </p>
                    </div>

                    <div className="bg-green-600 text-white px-8 py-3 rounded-2xl">
                        <p className="text-sm font-medium text-green-200">Amount Paid</p>
                        <p className="text-3xl font-black">{formatPrice(paidAmount)}</p>
                    </div>
                </div>

                {/* Transaction details card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="font-black text-gray-900 text-sm uppercase tracking-wide">
                        Transaction Details
                    </h2>

                    <div className="space-y-3 text-sm">
                        {transaction && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">Order ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-gray-700 text-xs">
                                        {transaction._id.slice(-12).toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(transaction._id)}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="Copy order ID"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {esewaData && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-medium">eSewa Transaction</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-700 text-xs">
                                            {esewaData.transaction_code}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(esewaData.transaction_code)}
                                            className="text-gray-400 hover:text-gray-600"
                                            aria-label="Copy transaction code"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400 font-medium">Status</span>
                                    <span className="text-green-600 font-bold bg-green-50 px-2.5 py-0.5 rounded-full text-xs">
                                        {esewaData.status}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">Date</span>
                            <span className="font-semibold text-gray-700 text-xs">
                                {new Date().toLocaleDateString('en-NP', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-400 font-medium">Payment method</span>
                            <span className="font-bold text-[#60bb46]">eSewa</span>
                        </div>
                    </div>
                </div>

                {/* Next steps */}
                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <h3 className="font-black text-blue-900 text-sm mb-3">📋 What happens next?</h3>
                    <ol className="space-y-2 text-xs text-blue-800 font-medium">
                        <li className="flex items-start gap-2">
                            <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">1.</span>
                            Message the seller to coordinate pickup on campus
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">2.</span>
                            Meet in a safe, public campus location to receive your item
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-black text-blue-600 flex-shrink-0 mt-0.5">3.</span>
                            Inspect the item thoroughly before confirming receipt
                        </li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Link
                        href="/products"
                        id="continue-shopping-btn"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                    <Link
                        href="/dashboard"
                        id="go-to-dashboard-btn"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors"
                    >
                        My Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            }
        >
            <PaymentSuccessPageContent />
        </Suspense>
    );
}
