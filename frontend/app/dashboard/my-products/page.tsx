'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useGetMyListings, useDeleteProduct, useChangeProductStatus, PRODUCT_KEYS } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/formatters';
import { productApi } from '@/lib/productApi';

export default function MyProductsPage() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const router = useRouter();
    const qc = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');

    const { data, isLoading, isError, error } = useGetMyListings(page, 12);
    const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();
    const { mutateAsync: changeStatus, isPending: isChangingStatus } = useChangeProductStatus();
    const [updatingQuantityById, setUpdatingQuantityById] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const listings = data?.data ?? [];
    const pagination = data?.pagination;

    const filteredListings = useMemo(() => {
        const q = search.trim().toLowerCase();
        return listings.filter((item: any) => {
            const matchesSearch =
                !q ||
                item?.title?.toLowerCase().includes(q) ||
                item?.description?.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all' || item?.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [listings, search, statusFilter]);

    const handleDelete = async (id: string, title: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete \"${title}\"?`);
        if (!confirmed) return;

        const toastId = toast.loading('Deleting product...');
        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully', { id: toastId });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to delete product', { id: toastId });
        }
    };

    const handleStatusChange = async (id: string, status: 'available' | 'reserved' | 'sold') => {
        const toastId = toast.loading('Updating status...');
        try {
            await changeStatus({ id, status });
            toast.success('Product status updated', { id: toastId });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to update status', { id: toastId });
        }
    };

    const handleQuantityChange = async (id: string, quantity: number) => {
        const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
        setUpdatingQuantityById((prev) => ({ ...prev, [id]: true }));
        const toastId = toast.loading('Updating stock...');

        try {
            const formData = new FormData();
            formData.append('quantity', String(safeQuantity));
            await productApi.update(id, formData);

            await Promise.all([
                qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) }),
                qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() }),
                qc.invalidateQueries({ queryKey: PRODUCT_KEYS.myListings() }),
            ]);

            toast.success('Stock updated', { id: toastId });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to update stock', { id: toastId });
        } finally {
            setUpdatingQuantityById((prev) => ({ ...prev, [id]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your listings: edit, update status, or delete.</p>
                </div>
                <Link
                    href="/sell/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                >
                    <Package className="w-4 h-4" /> Add New Product
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search your products..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg appearance-none bg-white min-w-37.5"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="reserved">Hidden/Reserved</option>
                            <option value="sold">Sold</option>
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Failed to load your products: {(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-800">No products found</h2>
                    <p className="text-sm text-gray-500 mt-1">Try a different search/filter or create a new listing.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredListings.map((product: any) => {
                        const id = product?.id || product?._id;
                        const image = product?.images?.[0];
                        const quantity = Math.max(0, Number(product?.quantity ?? 0));
                        const categoryName = typeof product?.categoryId === 'object'
                            ? product?.categoryId?.name
                            : (typeof product?.category === 'object' ? product?.category?.name : 'General');

                        return (
                            <article key={id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="relative aspect-4/3 bg-gray-100">
                                    {image ? (
                                        <Image src={image} alt={product?.title || 'Product'} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                    )}
                                </div>

                                <div className="p-4 space-y-3">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{product?.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black text-gray-900">{formatPrice(product?.price || 0)}</p>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                            product?.status === 'available' ? 'bg-green-100 text-green-700' :
                                                product?.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {product?.status || 'available'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">Category: <span className="font-medium text-gray-700">{categoryName || 'General'}</span></p>
                                    <p className="text-sm text-gray-500">Stock: <span className="font-semibold text-gray-800">{quantity}</span></p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Posted {product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Link
                                            href={`/sell/${id}/edit`}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-bold"
                                        >
                                            <Pencil className="w-4 h-4" /> Edit
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(id, product?.title || 'this product')}
                                            disabled={isDeleting}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-bold disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>

                                    <div className="pt-1">
                                        <label className="text-xs font-semibold text-gray-500 block mb-1">Availability status</label>
                                        <select
                                            value={product?.status || 'available'}
                                            onChange={(e) => handleStatusChange(id, e.target.value as 'available' | 'reserved' | 'sold')}
                                            disabled={isChangingStatus}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-60"
                                        >
                                            <option value="available">Available</option>
                                            <option value="reserved">Hidden/Reserved</option>
                                            <option value="sold">Sold</option>
                                        </select>
                                    </div>

                                    <div className="pt-1">
                                        <label className="text-xs font-semibold text-gray-500 block mb-1">Stock quantity</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                defaultValue={quantity}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                                                id={`stock-input-${id}`}
                                            />
                                            <button
                                                type="button"
                                                disabled={Boolean(updatingQuantityById[id])}
                                                onClick={() => {
                                                    const input = document.getElementById(`stock-input-${id}`) as HTMLInputElement | null;
                                                    const nextValue = Number(input?.value ?? quantity);
                                                    handleQuantityChange(id, nextValue);
                                                }}
                                                className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
