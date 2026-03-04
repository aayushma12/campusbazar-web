'use client';

import { usePaymentHistory } from '@/hooks/usePayment';
import { useWallet } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/formatters';
import { downloadReceiptPdf } from '@/lib/receipt';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Package, Clock, CheckCircle2, XCircle, Wallet, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function PaymentsHistoryPage() {
    const { user } = useAuth();
    const { data: walletData } = useWallet();
    const wallet = walletData?.data;
    const { data: historyData, isLoading } = usePaymentHistory();
    const transactions = historyData?.data ?? [];

    if (isLoading) {
        return (
            <div className="min-h-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Separate sender (buying) and receiver (selling) payments
    const sentPayments = transactions.filter((t: any) =>
        (t.buyerId?.id === user?.id || t.buyerId === user?.id) &&
        t.status !== 'pending'
    );
    const receivedPayments = transactions.filter((t: any) =>
        (t.sellerId?.id === user?.id || t.sellerId === user?.id) &&
        t.status !== 'pending'
    );

    async function handleDownloadReceipt(transaction: any) {
        const productItems = Array.isArray(transaction.productIds) && transaction.productIds.length > 0
            ? transaction.productIds
            : transaction.productId
                ? [transaction.productId]
                : [];

        const lineItems = (productItems.length > 0 ? productItems : [{ title: 'Marketplace Item', price: transaction.amount }]).map((p: any) => ({
            title: p?.title || 'Marketplace Item',
            quantity: 1,
            unitPrice: Number(p?.price ?? transaction.amount ?? 0),
        }));

        try {
            await downloadReceiptPdf({
                reference: transaction.transactionUUID || transaction._id || transaction.id || 'TXN-UNKNOWN',
                orderId: transaction._id || transaction.id,
                createdAt: transaction.createdAt,
                buyer: {
                    name: transaction.buyerId?.name,
                    email: transaction.buyerId?.email,
                },
                seller: {
                    name: transaction.sellerId?.name,
                    email: transaction.sellerId?.email,
                },
                items: lineItems,
                totalAmount: Number(transaction.amount ?? 0),
                notes: 'Generated from CampusBazar payment history.',
            });
        } catch (error: any) {
            toast.error(error?.message || 'Unable to generate receipt PDF.');
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payment History</h1>
                    <p className="text-gray-500 mt-1">Manage and track all your transactions.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 w-fit">
                    <CreditCard className="w-5 h-5 text-[#60bb46]" />
                    <span className="text-sm font-bold text-gray-700">eSewa Linked</span>
                </div>
            </div>



            {/* Sent Payments (As Buyer) */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-red-500" />
                    Payments Sent <span className="text-sm font-medium text-gray-400">({sentPayments.length})</span>
                </h2>

                <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Recipient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sentPayments.length > 0 ? sentPayments.map((t: any, index: number) => (
                                    <tr key={t._id || t.id || `${t.transactionUUID || 'sent'}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {t.productId?.images?.[0] ? (
                                                        <img src={t.productId.images[0]} className="w-full h-full object-cover" />
                                                    ) : t.productIds?.[0]?.images?.[0] ? (
                                                        <img src={t.productIds[0].images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 line-clamp-1 max-w-37.5">
                                                    {t.productId?.title ||
                                                        (t.productIds?.length ? (t.productIds.length > 1 ? `Cart (${t.productIds.length} items)` : t.productIds[0].title) :
                                                            (t.transactionUUID?.startsWith('BK-') ? 'Tutoring Session' : 'Unknown Product'))}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-medium">{t.sellerId?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(t.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-gray-900">{formatPrice(t.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={t.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDownloadReceipt(t)}
                                                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No outgoing payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Received Payments (As Seller) */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    Payments Received <span className="text-sm font-medium text-gray-400">({receivedPayments.length})</span>
                </h2>

                <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Buyer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {receivedPayments.length > 0 ? receivedPayments.map((t: any, index: number) => (
                                    <tr key={t._id || t.id || `${t.transactionUUID || 'received'}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {t.productId?.images?.[0] ? (
                                                        <img src={t.productId.images[0]} className="w-full h-full object-cover" />
                                                    ) : t.productIds?.[0]?.images?.[0] ? (
                                                        <img src={t.productIds[0].images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 line-clamp-1 max-w-37.5">
                                                    {t.productId?.title ||
                                                        (t.productIds?.length ? (t.productIds.length > 1 ? `Cart (${t.productIds.length} items)` : t.productIds[0].title) :
                                                            (t.transactionUUID?.startsWith('BK-') ? 'Tutoring Session' : 'Unknown Product'))}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-medium">{t.buyerId?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(t.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-gray-900">{formatPrice(t.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={t.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDownloadReceipt(t)}
                                                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No incoming payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'done':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold uppercase tracking-tight">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-tight">
                    <Clock className="w-3 h-3" />
                    Pending
                </span>
            );
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold uppercase tracking-tight">
                    <XCircle className="w-3 h-3" />
                    Failed
                </span>
            );
        default:
            return <span className="text-xs font-bold text-gray-400 uppercase">{status}</span>;
    }
}
