'use client';

import { useMyPurchases, useCompleteOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/formatters';
import { downloadReceiptPdf } from '@/lib/receipt';
import { History, Package, Clock, CheckCircle2, XCircle, ArrowRight, ShoppingBag, ExternalLink, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderId } from '@/types/order';
import { toast } from 'sonner';

function getOrderTotal(order: any): number {
    const quantity = Number(order?.quantity) > 0 ? Number(order.quantity) : 1;
    const price = Number(order?.price ?? order?.amount ?? 0);
    return Number.isFinite(order?.amount) && Number(order.amount) > 0
        ? Number(order.amount)
        : price * quantity;
}

function isCompletedStatus(status: string): boolean {
    return status === 'completed' || status === 'done' || status === 'paid';
}

export default function OrderHistoryPage() {
    const { user } = useAuth();
    const { data: purchasesData, isLoading } = useMyPurchases();
    const purchases = purchasesData?.data ?? [];
    const completedPurchases = purchases.filter((order: any) => isCompletedStatus(order.status));
    const activePurchases = purchases.filter((order: any) => !isCompletedStatus(order.status));
    const { mutateAsync: completeOrder, isPending: isCompleting } = useCompleteOrder();

    async function handleMarkCompleted(order: any) {
        const orderId = getOrderId(order);
        if (!orderId) {
            toast.error('Order reference is missing.');
            return;
        }

        if (order.status !== 'pending' && order.status !== 'accepted' && order.status !== 'handed_over') {
            toast.error('Only pending, accepted, or handed over orders can be completed.');
            return;
        }

        const loadingId = toast.loading('Marking order as completed…');
        try {
            await completeOrder(orderId);
            toast.success('Order marked as completed. Seller notified.', { id: loadingId });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to complete order.', { id: loadingId });
        }
    }

    async function handleDownloadReceipt(order: any) {
        const orderId = getOrderId(order);
        const productItems = Array.isArray(order.productIds) && order.productIds.length > 0
            ? order.productIds
            : order.productId
                ? [order.productId]
                : [];

        const quantity = Number(order.quantity) > 0 ? Number(order.quantity) : 1;
        const computedTotal = getOrderTotal(order);
        const unitPriceFallback = quantity > 0 ? computedTotal / quantity : computedTotal;
        const lineItems = productItems.map((product: any) => ({
            title: product?.title || 'Marketplace Item',
            quantity,
            unitPrice: Number(product?.price ?? order.price ?? unitPriceFallback ?? 0),
        }));

        if (lineItems.length === 0) {
            lineItems.push({
                title: 'Marketplace Item',
                quantity,
                unitPrice: Number(order.price ?? unitPriceFallback ?? 0),
            });
        }

        try {
            await downloadReceiptPdf({
                reference: orderId || 'ORD-UNKNOWN',
                orderId,
                createdAt: order.createdAt,
                buyer: {
                    name: user?.name,
                    email: user?.email,
                },
                seller: {
                    name: order.sellerId?.name,
                    email: order.sellerId?.email,
                },
                items: lineItems,
                totalAmount: computedTotal,
                notes: 'Generated from CampusBazar order history.',
            });
        } catch (error: any) {
            toast.error(error?.message || 'Unable to generate receipt PDF.');
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse text-sm uppercase tracking-widest">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-8">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider">
                                <History className="w-3 h-3" />
                                Timeline
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order History</h1>
                            <p className="text-gray-500 font-medium max-w-sm">
                                Track all your marketplace purchases and eSewa payments in one place.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Purchases</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">{purchases.length}</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 mt-12">
                {purchases.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                            Looks like you haven't bought anything yet. Start exploring the marketplace to find great deals!
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95"
                        >
                            Start Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {activePurchases.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-black text-gray-900">Pending & Active Orders</h2>
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                                        {activePurchases.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {activePurchases.map((t: any, index: number) => (
                            <div
                                key={t._id || t.id || `order-${index}`}
                                className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Product Image */}
                                    <div className="relative w-full md:w-40 h-40 rounded-4xl overflow-hidden bg-gray-50 shrink-0 shadow-inner flex items-center justify-center">
                                        {t.productId?.images?.[0] ? (
                                            <img
                                                src={t.productId.images[0]}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={t.productId?.title || 'Product'}
                                            />
                                        ) : t.productIds?.[0]?.images?.[0] ? (
                                            <img
                                                src={t.productIds[0].images[0]}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={t.productIds[0]?.title || 'Product'}
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-gray-200" />
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <StatusBadge status={t.status} />
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1 min-w-0 py-2">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-4 flex-1">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                            {t.transactionUUID?.startsWith('BK-') ? 'Tutoring' : 'Marketplace'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            #{t._id?.slice(-8) || t.id?.slice(-8)}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                        {t.productId?.title ||
                                                            (t.productIds?.length ? (t.productIds.length > 1 ? `Cart (${t.productIds.length} items)` : t.productIds[0].title) :
                                                                'Unknown Product')}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full w-fit">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            {formatDate(t.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-left md:text-right shrink-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                                <p className="text-3xl font-black text-gray-800 tracking-tighter">
                                                    {formatPrice(getOrderTotal(t))}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden relative">
                                                    <Image
                                                        src={t.sellerId?.profilePicture || '/placeholder-user.png'}
                                                        fill
                                                        sizes="32px"
                                                        className="object-cover rounded-full"
                                                        alt="Seller"
                                                        unoptimized
                                                    />
                                                </div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Sold by <span className="text-gray-900 font-bold">{t.sellerId?.name || 'Campus Seller'}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {t.productId && (
                                                    <Link
                                                        href={`/products/${t.productId._id || t.productId.id || t.productId}`}
                                                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                    >
                                                        View Product
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Link>
                                                )}
                                                {(t.status === 'pending' || t.status === 'accepted' || t.status === 'handed_over') && (
                                                    <button
                                                        onClick={() => handleMarkCompleted(t)}
                                                        disabled={isCompleting}
                                                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-60"
                                                    >
                                                        {isCompleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        Mark as Completed
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownloadReceipt(t)}
                                                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                                                >
                                                    Download Receipt
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Highlight */}
                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-gray-900">Completed Orders</h2>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                    {completedPurchases.length}
                                </span>
                            </div>

                            {completedPurchases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                                    No completed orders yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {completedPurchases.map((t: any, index: number) => (
                                        <div
                                            key={t._id || t.id || `completed-order-${index}`}
                                            className="group bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 relative overflow-hidden"
                                        >
                                            <div className="flex flex-col md:flex-row items-center gap-8">
                                                <div className="relative w-full md:w-40 h-40 rounded-4xl overflow-hidden bg-gray-50 shrink-0 shadow-inner flex items-center justify-center">
                                                    {t.productId?.images?.[0] ? (
                                                        <img
                                                            src={t.productId.images[0]}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            alt={t.productId?.title || 'Product'}
                                                        />
                                                    ) : t.productIds?.[0]?.images?.[0] ? (
                                                        <img
                                                            src={t.productIds[0].images[0]}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            alt={t.productIds[0]?.title || 'Product'}
                                                        />
                                                    ) : (
                                                        <Package className="w-10 h-10 text-gray-200" />
                                                    )}
                                                    <div className="absolute top-3 left-3">
                                                        <StatusBadge status={t.status} />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 py-2">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                        <div className="space-y-4 flex-1">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                        {t.transactionUUID?.startsWith('BK-') ? 'Tutoring' : 'Marketplace'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                        #{t._id?.slice(-8) || t.id?.slice(-8)}
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                                    {t.productId?.title ||
                                                                        (t.productIds?.length ? (t.productIds.length > 1 ? `Cart (${t.productIds.length} items)` : t.productIds[0].title) :
                                                                            'Unknown Product')}
                                                                </h3>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full w-fit">
                                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                        {formatDate(t.createdAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-left md:text-right shrink-0">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                                            <p className="text-3xl font-black text-gray-800 tracking-tighter">
                                                                {formatPrice(getOrderTotal(t))}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden relative">
                                                                <Image
                                                                    src={t.sellerId?.profilePicture || '/placeholder-user.png'}
                                                                    fill
                                                                    sizes="32px"
                                                                    className="object-cover rounded-full"
                                                                    alt="Seller"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <p className="text-xs font-medium text-gray-500">
                                                                Sold by <span className="text-gray-900 font-bold">{t.sellerId?.name || 'Campus Seller'}</span>
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {t.productId && (
                                                                <Link
                                                                    href={`/products/${t.productId._id || t.productId.id || t.productId}`}
                                                                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                                >
                                                                    View Product
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                </Link>
                                                            )}
                                                            <button
                                                                onClick={() => handleDownloadReceipt(t)}
                                                                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                                                            >
                                                                Download Receipt
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'completed':
        case 'done':
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-green-600 text-[10px] font-black uppercase tracking-wider shadow-sm border border-green-50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                </span>
            );
        case 'handed_over':
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase tracking-wider shadow-sm border border-blue-50">
                    <Truck className="w-3.5 h-3.5" />
                    Handed Over
                </span>
            );
        case 'accepted':
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-indigo-600 text-[10px] font-black uppercase tracking-wider shadow-sm border border-indigo-50">
                    <Clock className="w-3.5 h-3.5" />
                    Accepted
                </span>
            );
        case 'pending':
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-yellow-600 text-[10px] font-black uppercase tracking-wider shadow-sm border border-yellow-50">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                </span>
            );
        case 'cancelled':
        case 'failed':
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-red-600 text-[10px] font-black uppercase tracking-wider shadow-sm border border-red-50">
                    <XCircle className="w-3.5 h-3.5" />
                    {status}
                </span>
            );
        default:
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-gray-500 text-[10px] font-black uppercase tracking-wider shadow-sm border border-gray-50">
                    {status}
                </span>
            );
    }
}
