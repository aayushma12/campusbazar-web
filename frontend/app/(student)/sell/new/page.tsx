'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ShoppingBag,
    Camera,
    FileCheck2,
    BadgeDollarSign,
    LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

import ProductForm, { type ProductFormData } from '@/components/products/ProductForm';
import { useCreateProduct } from '@/hooks/useProducts';
import type { UploadedFile } from '@/components/products/ImageUploader';

// ─── Listing tips ──────────────────────────────────────────────────────────────

const TIPS = [
    { icon: Camera, text: 'Use bright, clear photos — 5+ images get 4× more clicks' },
    { icon: FileCheck2, text: 'Be honest about the condition — builds buyer trust' },
    { icon: BadgeDollarSign, text: 'Research similar listings to price competitively' },
    { icon: LayoutGrid, text: 'Pick the right category so buyers can find you faster' },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewListingPage() {
    const router = useRouter();
    const { mutateAsync: createProduct, isPending } = useCreateProduct();

    async function handleSubmit(data: ProductFormData, images: UploadedFile[]) {
        const toastId = toast.loading('Publishing your listing…');

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

            images.forEach((img) => {
                if (img.file && !img.isExisting) {
                    formData.append('images', img.file);
                }
            });

            const response = await createProduct(formData);

            toast.success('🎉 Your listing is live!', {
                id: toastId,
                description: 'Buyers can now find your item.',
                duration: 5000,
            });

            // Redirect to Buy section (Products gallery)
            router.push('/products');
        } catch (err: unknown) {
            const message =
                (err as any)?.response?.data?.message ??
                (err as any)?.message ??
                'Failed to create listing. Please try again.';
            toast.error('Could not publish listing', {
                id: toastId,
                description: message,
                duration: 6000,
            });
            // Re-throw so ProductForm can catch and set submitError
            throw err;
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
            {/* ── Sticky header ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        id="back-to-dashboard-btn"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>

                    <div className="h-4 w-px bg-gray-200" />

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black text-gray-900 leading-none">Create New Listing</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
                        </div>
                    </div>

                    {/* Progress breadcrumb — decorative */}
                    <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span className="text-green-600 font-bold">① Details</span>
                        <span>→</span>
                        <span>② Preview</span>
                        <span>→</span>
                        <span>③ Live</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                    {/* ── Form ────────────────────────────────────────────────────── */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <ProductForm
                            onSubmit={handleSubmit}
                            isSubmitting={isPending}
                        />
                    </div>

                    {/* ── Sidebar: Tips ────────────────────────────────────────────── */}
                    <aside className="space-y-5 sticky top-20">
                        {/* Tips card */}
                        <div className="bg-linear-to-br from-green-600 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
                            <h2 className="font-black text-base mb-4 flex items-center gap-2">
                                <span>💡</span> Tips for a great listing
                            </h2>
                            <ul className="space-y-3">
                                {TIPS.map(({ icon: Icon, text }) => (
                                    <li key={text} className="flex items-start gap-3 text-sm font-medium text-green-50">
                                        <Icon className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Safety card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                            <h3 className="font-black text-sm text-blue-900 mb-2">🔒 Safety Reminder</h3>
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                Always meet buyers in a public campus location. Never share personal financial details online.
                            </p>
                        </div>

                        {/* Draft note */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                            <h3 className="font-bold text-sm text-gray-700 mb-1">📝 About drafts</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Your form isn&apos;t saved automatically. Submit to make it live. You can edit or delete it from your dashboard at any time.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
