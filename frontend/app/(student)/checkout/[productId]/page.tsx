'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, CreditCard, AlertCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { useGetProductById } from '@/hooks/useProducts';
import { useInitPayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import EsewaCheckoutForm from '@/components/payment/EsewaCheckoutForm';
import { formatPrice } from '@/lib/formatters';
import type { EsewaPaymentData } from '@/types/payment';
import type { Seller } from '@/types/product';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ productId: string }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage({ params }: PageProps) {
    const { productId } = use(params);
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    // Payment state
    const [paymentData, setPaymentData] = useState<EsewaPaymentData | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    const { data, isLoading, isError } = useGetProductById(productId);
    const product = data?.data;

    const { mutateAsync: initPayment, isPending: initiating } = useInitPayment();

    // ── Guard: auth loading ──────────────────────────────────────────────────
    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    // ── Guard: not authenticated ─────────────────────────────────────────────
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">🔐</span>
                <h2 className="text-2xl font-black text-gray-900">Sign in to continue</h2>
                <p className="text-gray-500 max-w-sm">You need to be logged in to make a purchase.</p>
                <Link
                    href={`/login?redirect=/checkout/${productId}`}
                    className="mt-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    // ── Guard: product error ─────────────────────────────────────────────────
    if (isError || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">🔍</span>
                <h2 className="text-2xl font-black text-gray-900">Product not found</h2>
                <Link href="/products" className="mt-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl">
                    Browse Products
                </Link>
            </div>
        );
    }

    // ── Guard: own product ───────────────────────────────────────────────────
    const seller = typeof product.ownerId === 'object' ? (product.ownerId as Seller) : null;
    const isOwner = user.id === (seller?.id ?? String(product.ownerId));

    if (isOwner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">🙈</span>
                <h2 className="text-2xl font-black text-gray-900">You own this listing</h2>
                <p className="text-gray-500">You cannot purchase your own item.</p>
                <Link href={`/products/${productId}`} className="mt-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl">
                    Back to Listing
                </Link>
            </div>
        );
    }

    // ── Guard: not available ─────────────────────────────────────────────────
    if (product.status !== 'available') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">😔</span>
                <h2 className="text-2xl font-black text-gray-900">
                    This item is {product.status}
                </h2>
                <p className="text-gray-500">Someone else may have snagged it first.</p>
                <Link href="/products" className="mt-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl">
                    Browse More
                </Link>
            </div>
        );
    }

    // ── Handle payment initiation ────────────────────────────────────────────
    async function handlePay() {
        const toastId = toast.loading('Preparing your payment…');
        try {
            const result = await initPayment(productId);
            toast.dismiss(toastId);
            setRedirecting(true);
            setPaymentData(result.data);
            toast.success('Redirecting to eSewa…', { duration: 3000 });
        } catch (err: unknown) {
            const msg =
                (err as any)?.response?.data?.message ??
                (err as any)?.message ??
                'Failed to initialize payment. Please try again.';
            toast.error('Payment init failed', { id: toastId, description: msg });
        }
    }

    // Service charge breakdown
    const itemPrice = product.price;
    const platformFee = 0; // Free for campus marketplace
    const total = itemPrice + platformFee;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* ── Auto-submit form to eSewa (mounts only after init) ─────────── */}
            {paymentData && (
                <EsewaCheckoutForm
                    paymentData={paymentData}
                    onTimeout={() => {
                        setPaymentData(null);
                        setRedirecting(false);
                        toast.error('Redirect timed out. Please try again.');
                    }}
                />
            )}

            {/* ── Redirecting overlay ──────────────────────────────────────────── */}
            {redirecting && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200 animate-pulse">
                        <span className="text-4xl">💳</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-black text-gray-900">Redirecting to eSewa</h2>
                        <p className="text-gray-500 mt-1 text-sm">Please wait, do not close this tab…</p>
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
            )}

            {/* ── Sticky header ────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                <div className="container mx-auto max-w-3xl px-4 h-14 flex items-center gap-4">
                    <Link
                        href={`/products/${productId}`}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors"
                        id="back-to-product-btn"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to listing
                    </Link>

                    <div className="h-4 w-px bg-gray-200" />

                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-black text-gray-900">Secure Checkout</span>
                    </div>

                    {/* eSewa branding */}
                    <div className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-400">
                        <span>Powered by</span>
                        <span className="text-[#60bb46] font-black text-sm">eSewa</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-3xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                    {/* ── Left: Order summary ──────────────────────────────────────── */}
                    <div className="space-y-5">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Order Summary</h1>
                            <p className="text-sm text-gray-500 mt-1">Review your purchase before paying</p>
                        </div>

                        {/* Product card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex gap-5">
                            {/* Image */}
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
                                    {product.title}
                                </h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                        {product.condition.replace('_', ' ')}
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                        📍 {product.campus}
                                    </span>
                                </div>
                                <p className="text-xl font-black text-gray-900 mt-3">
                                    {formatPrice(product.price)}
                                </p>
                                {product.negotiable && (
                                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">Price negotiable</p>
                                )}
                            </div>
                        </div>

                        {/* Seller info */}
                        {seller && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                    {seller.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Selling by</p>
                                    <p className="text-sm font-bold text-gray-900">{seller.name}</p>
                                    {seller.university && (
                                        <p className="text-xs text-gray-500">{seller.university}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Price breakdown */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h3 className="font-bold text-gray-900 text-sm">Price breakdown</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Item price</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(itemPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Platform fee</span>
                                    <span className="font-semibold text-green-600">Free 🎓</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service charge</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                                <div className="h-px bg-gray-100 my-1" />
                                <div className="flex justify-between text-base">
                                    <span className="font-black text-gray-900">Total</span>
                                    <span className="font-black text-gray-900">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Safety warning */}
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-800 leading-relaxed font-medium">
                                <strong>Campus Marketplace Tip:</strong> After payment, meet the seller in a safe,
                                public campus location to collect your item. Always inspect before accepting.
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Payment panel ─────────────────────────────────────── */}
                    <aside className="space-y-4 sticky top-20">
                        {/* Pay button card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center space-y-5">
                            {/* eSewa logo area */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-[#60bb46]/10 border border-[#60bb46]/20 flex items-center justify-center">
                                    <span className="text-3xl font-black text-[#60bb46]">e</span>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">Pay with eSewa</p>
                                    <p className="text-sm text-gray-500 mt-0.5">Nepal&apos;s trusted digital wallet</p>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs text-gray-400 font-medium mb-1">You pay</p>
                                <p className="text-3xl font-black text-gray-900">{formatPrice(total)}</p>
                            </div>

                            {/* Pay button */}
                            <button
                                id="esewa-pay-btn"
                                onClick={handlePay}
                                disabled={initiating || redirecting}
                                className={[
                                    'w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base text-white',
                                    'transition-all duration-200 shadow-lg',
                                    initiating || redirecting
                                        ? 'bg-[#60bb46]/60 cursor-not-allowed shadow-none'
                                        : 'bg-[#60bb46] hover:bg-[#4ea33a] hover:shadow-green-200 hover:shadow-xl active:scale-[0.98]',
                                ].join(' ')}
                            >
                                {initiating || redirecting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Connecting to eSewa…</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        <span>Pay {formatPrice(total)} via eSewa</span>
                                    </>
                                )}
                            </button>

                            {/* Security badges */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>256-bit SSL · Secured by eSewa</span>
                            </div>
                        </div>

                        {/* Test credentials reminder (dev only) */}
                        {process.env.NODE_ENV !== 'production' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                <p className="text-xs font-black text-blue-800 mb-2">🧪 Test Credentials</p>
                                <div className="space-y-1 text-xs font-mono text-blue-700">
                                    <div className="flex justify-between">
                                        <span className="text-blue-500">eSewa ID</span>
                                        <span>9806800001</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-500">Password</span>
                                        <span>Nepal@123</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-500">MPIN</span>
                                        <span>1122</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-500">Token</span>
                                        <span>123456</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancel */}
                        <Link
                            href={`/products/${productId}`}
                            id="cancel-checkout-btn"
                            className="block w-full text-center py-3 text-sm text-gray-400 hover:text-gray-600 font-semibold transition-colors"
                        >
                            Cancel and go back
                        </Link>
                    </aside>
                </div>
            </main>
        </div>
    );
}
