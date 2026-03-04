'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit3, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import ProductForm, { type ProductFormData } from '@/components/products/ProductForm';
import { useGetProductById, useUpdateProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import type { UploadedFile } from '@/components/products/ImageUploader';
import type { Seller, Category } from '@/types/product';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditListingPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    // Fetch existing product
    const { data, isLoading, isError } = useGetProductById(id);
    const product = data?.data;

    const { mutateAsync: updateProduct, isPending } = useUpdateProduct(id);

    // Owner guard
    const seller = typeof product?.ownerId === 'object' ? (product.ownerId as Seller) : null;
    const isOwner =
        !!user &&
        !!product &&
        user.id === (seller?.id ?? String(product.ownerId));

    // ── Submit handler ────────────────────────────────────────────────────
    async function handleSubmit(data: ProductFormData, images: UploadedFile[]) {
        const toastId = toast.loading('Saving changes…');

        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('price', String(data.price ?? 0));
            formData.append('quantity', String(data.quantity ?? 0));
            formData.append('negotiable', String(data.negotiable));
            formData.append('condition', data.condition);
            formData.append('categoryId', data.categoryId);
            formData.append('campus', data.campus);

            // Only send NEW files; existing server images stay unchanged
            images.forEach((img) => {
                if (img.file && !img.isExisting) {
                    formData.append('images', img.file);
                }
            });

            // Track which existing images the user kept (send their URLs so backend
            // can prune removed ones — adjust to match your backend contract)
            const keptExisting = images
                .filter((img) => img.isExisting)
                .map((img) => img.preview);
            keptExisting.forEach((url) => formData.append('existingImages', url));

            await updateProduct(formData);

            toast.success('✅ Listing updated!', {
                id: toastId,
                description: 'Your changes are now live.',
                duration: 5000,
                action: {
                    label: 'View listing',
                    onClick: () => router.push(`/products/${id}`),
                },
            });

            router.push(`/products/${id}`);
        } catch (err: unknown) {
            const message =
                (err as any)?.response?.data?.message ??
                (err as any)?.message ??
                'Failed to save changes. Please try again.';
            toast.error('Update failed', {
                id: toastId,
                description: message,
                duration: 6000,
            });
            throw err;
        }
    }

    // ── Loading ───────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
                <div className="h-14 bg-white border-b border-gray-100" />
                <div className="container mx-auto max-w-4xl px-4 py-8">
                    <ProductDetailSkeleton />
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────
    if (isError || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">🔍</span>
                <h2 className="text-2xl font-black text-gray-900">Product not found</h2>
                <p className="text-gray-500 max-w-sm">
                    This listing may have been removed or the URL is incorrect.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // ── Not owner ─────────────────────────────────────────────────────────
    if (!isOwner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="text-6xl">🚫</span>
                <h2 className="text-2xl font-black text-gray-900">Access Denied</h2>
                <p className="text-gray-500 max-w-sm">You can only edit your own listings.</p>
                <Link
                    href="/dashboard"
                    className="mt-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // ── Build form defaults ────────────────────────────────────────────────
    const categoryId =
        typeof product.categoryId === 'object'
            ? (product.categoryId as Category).id
            : product.categoryId;

    const defaultValues: Partial<ProductFormData & { images?: string[] }> = {
        title: product.title,
        description: product.description,
        price: product.price,
        quantity: product.quantity ?? 0,
        negotiable: product.negotiable,
        condition: product.condition,
        categoryId,
        campus: product.campus,
        images: product.images,
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
            {/* ── Sticky header ─────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center gap-4">
                    <Link
                        href={`/products/${id}`}
                        id="back-to-product-btn"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to listing</span>
                    </Link>

                    <div className="h-4 w-px bg-gray-200" />

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black text-gray-900 leading-none">Edit Listing</h1>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-45">
                                {product.title}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-8">
                {/* Status warnings */}
                {product.status === 'sold' && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-800">This item is marked as Sold</p>
                            <p className="text-xs text-red-600 mt-0.5">
                                Editing will not change its status. Use the status controls in your dashboard to make it available again.
                            </p>
                        </div>
                    </div>
                )}
                {product.status === 'reserved' && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 font-medium">
                            This listing is currently <strong>reserved</strong>. You can still edit the details.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start">
                    {/* ── Form ──────────────────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <ProductForm
                            defaultValues={defaultValues}
                            onSubmit={handleSubmit}
                            isEditing
                            isSubmitting={isPending}
                        />
                    </div>

                    {/* ── Sidebar ────────────────────────────────────────────────── */}
                    <aside className="space-y-4 sticky top-20">
                        {/* Edit tips */}
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                            <h2 className="font-black text-sm text-amber-900 mb-3">✏️ Editing tips</h2>
                            <ul className="space-y-2 text-xs text-amber-800 font-medium">
                                <li className="flex items-start gap-1.5">
                                    <span className="mt-0.5">•</span>
                                    Tap two images to swap their order
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="mt-0.5">•</span>
                                    Remove an image then upload a new one to replace it
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="mt-0.5">•</span>
                                    Changes go live immediately after saving
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="mt-0.5">•</span>
                                    Update your price to boost visibility
                                </li>
                            </ul>
                        </div>

                        {/* Quick info */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 text-xs font-medium text-gray-600">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Product ID</span>
                                <span className="font-mono text-gray-600">{product.id.slice(-8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span
                                    className={`font-bold capitalize ${product.status === 'available'
                                            ? 'text-green-600'
                                            : product.status === 'sold'
                                                ? 'text-red-600'
                                                : 'text-amber-600'
                                        }`}
                                >
                                    {product.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Views</span>
                                <span>{product.views}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
