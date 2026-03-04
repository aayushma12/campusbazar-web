'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, ShoppingBag, MessageCircle, Loader2 } from 'lucide-react';

// ─── Page ─────────────────────────────────────────────────────────────────────

function PaymentFailurePageContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const bookingId = searchParams.get('bookingId');

    // eSewa sends failure reason in some versions — try to read it
    const reason = searchParams.get('reason') ?? searchParams.get('message') ?? null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white">
            <div className="container mx-auto max-w-lg px-4 py-20">
                {/* Icon */}
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-2xl shadow-red-200">
                        <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Payment Failed</h1>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                            {reason
                                ? reason
                                : 'Your payment was not completed. No money has been deducted from your account.'}
                        </p>
                    </div>
                </div>

                {/* Reasons card */}
                <div className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
                    <h2 className="font-black text-gray-900 text-sm">Why might this happen?</h2>
                    <ul className="space-y-2 text-sm text-gray-500 font-medium">
                        {[
                            'Insufficient eSewa balance',
                            'Incorrect MPIN or OTP entered',
                            'Payment session timed out',
                            'You cancelled the payment',
                            'Network issue during payment',
                        ].map((r) => (
                            <li key={r} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-8">
                    {/* Try again - go back to product since direct checkout is removed */}
                    {productId && (
                        <Link
                            href={`/products/${productId}`}
                            id="retry-payment-btn"
                            className="flex items-center justify-center gap-2.5 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Return to Listing
                        </Link>
                    )}

                    {bookingId && (
                        <Link
                            href="/dashboard/bookings"
                            id="retry-booking-btn"
                            className="flex items-center justify-center gap-2.5 py-4 bg-[#60bb46] hover:bg-[#4ea33a] text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200 hover:shadow-green-300"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Return to Bookings
                        </Link>
                    )}

                    {/* Back to product */}
                    {productId && (
                        <Link
                            href={`/products/${productId}`}
                            id="back-to-product-btn"
                            className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-2xl transition-colors"
                        >
                            Back to Listing
                        </Link>
                    )}

                    {/* Browse */}
                    <Link
                        href="/products"
                        id="browse-products-btn"
                        className="flex items-center justify-center gap-2 py-3.5 text-gray-400 hover:text-gray-600 font-semibold transition-colors text-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Browse other products
                    </Link>
                </div>

                {/* Help */}
                <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 font-medium leading-relaxed">
                        If money was deducted but payment still failed, please contact{' '}
                        <a href="mailto:support@campusbazar.com" className="font-bold hover:underline">
                            support@campusbazar.com
                        </a>{' '}
                        or eSewa helpline{' '}
                        <a href="tel:01-5970182" className="font-bold hover:underline">
                            01-5970182
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                </div>
            }
        >
            <PaymentFailurePageContent />
        </Suspense>
    );
}
