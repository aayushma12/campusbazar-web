'use client';

import { useCart, useRemoveFromCart, useUpdateCartQuantity, useClearCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { esewaApi } from '@/lib/esewaApi';
import EsewaCheckoutForm from '@/components/payment/EsewaCheckoutForm';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { EsewaPaymentData } from '@/types/payment';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
    const { user } = useAuth();
    const { data: cartData, isLoading } = useCart();
    const { mutate: removeItem } = useRemoveFromCart();
    const { mutate: updateQuantity } = useUpdateCartQuantity();
    const { mutate: clearCart } = useClearCart();

    const cartItems = cartData?.data ?? [];
    const [esewaData, setEsewaData] = useState<EsewaPaymentData | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const subtotal = cartItems.reduce((acc: number, item: any) => {
        return acc + (item.productId?.price ?? 0) * item.quantity;
    }, 0);

    const hasOwnProductInCart = cartItems.some((item: any) => {
        const ownerId =
            typeof item?.productId?.ownerId === 'string'
                ? item.productId.ownerId
                : item?.productId?.ownerId?._id || item?.productId?.ownerId?.id;
        return Boolean(user?.id && ownerId && user.id === ownerId);
    });

    const handleCheckout = async () => {
        if (hasOwnProductInCart) {
            toast.error('Remove your own listings from cart before checkout');
            return;
        }

        try {
            setIsCheckingOut(true);
            const response = await esewaApi.initCart(cartItems);
            if (response.success) {
                setRedirecting(true);
                setEsewaData(response.data);
            } else {
                toast.error('Failed to initialize payment');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Checkout failed');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Looks like you haven't added anything to your cart yet. Explore our marketplace for amazing student deals!
                </p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200"
                >
                    Start Shopping
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Redirecting overlay */}
            {redirecting && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200 animate-pulse">
                        <span className="text-4xl">💳</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-black text-gray-900">Redirecting to eSewa</h2>
                        <p className="text-gray-500 mt-1 text-sm">Please wait, do not close this tab…</p>
                    </div>
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            Your <span className="text-green-600">Cart</span>
                            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </h1>
                        <button
                            onClick={() => clearCart()}
                            className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-6">
                        {cartItems.map((item) => (
                            (() => {
                                const availableStock = Math.max(0, Number(item.productId?.quantity ?? 0));
                                const canIncrease = item.quantity < availableStock;
                                const isOutOfStock = availableStock <= 0;

                                return (
                            <div
                                key={item.id}
                                className="group flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-4xl border border-gray-100 shadow-sm transition-all hover:shadow-xl"
                            >
                                {/* Product Image */}
                                <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                                    {item.productId?.images?.[0] ? (
                                        <Image
                                            src={item.productId.images[0]}
                                            alt={item.productId.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            unoptimized
                                        />
                                    ) : (
                                        <Package className="w-10 h-10 text-gray-300 m-auto mt-14" />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <Link
                                                href={`/products/${item.productId?.id}`}
                                                className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2"
                                            >
                                                {item.productId?.title}
                                            </Link>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium mb-4 flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4" />
                                            Sold by <span className="text-gray-900">User {item.productId?.ownerId?.toString().slice(-4)}</span>
                                        </p>
                                        <p className={`text-xs font-semibold mb-3 ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                                            {isOutOfStock ? 'Out of Stock' : `Available: ${availableStock} in stock`}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-900 shadow-sm disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-black text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                                                disabled={!canIncrease}
                                                className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-gray-900 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 tracking-tight">
                                            {formatPrice(item.productId?.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                                );
                            })()
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:w-100">
                    <div className="sticky top-24 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Platform Fee</span>
                                <span className="text-gray-900 font-bold">{formatPrice(0)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total</p>
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{formatPrice(subtotal)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut || cartItems.length === 0 || hasOwnProductInCart}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 active:scale-95 group disabled:opacity-50"
                        >
                            {isCheckingOut ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Checkout Now
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>

                        {hasOwnProductInCart && (
                            <p className="mt-3 text-xs font-semibold text-red-500 text-center">
                                You cannot checkout with your own product in the cart.
                            </p>
                        )}

                        {/* eSewa Form — auto-submits using EsewaCheckoutForm */}
                        {esewaData && (
                            <EsewaCheckoutForm
                                paymentData={esewaData}
                                onTimeout={() => {
                                    setEsewaData(null);
                                    setRedirecting(false);
                                    toast.error('Redirect timed out. Please try again.');
                                }}
                            />
                        )}

                        <p className="mt-6 text-center text-xs text-gray-400 font-medium leading-relaxed">
                            By proceeding to checkout, you agree to CampusBazar's
                            <Link href="/terms" className="text-green-600 px-1 hover:underline">Terms of Service</Link>
                            and
                            <Link href="/privacy" className="text-green-600 px-1 hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
