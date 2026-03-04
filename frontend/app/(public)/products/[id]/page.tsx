'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Heart,
    MessageCircle,
    Flag,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Eye,
    Shield,
    Tag,
    CheckCircle,
    Share2,
    ArrowLeft,
    ShoppingCart,
} from 'lucide-react';

import { useGetProductById, useGetProducts, useWishlist, useToggleWishlist } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/products/ProductCard';
import { CONDITION_LABELS, CONDITION_COLORS, getCategoryId, getProductId } from '@/types/product';
import { formatPrice, timeAgo } from '@/lib/formatters';
import toast from 'react-hot-toast';
import type { Seller } from '@/types/product';

// ── Image Carousel ──────────────────────────────────────────────────────────

function ImageCarousel({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

    if (!images.length) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-3xl flex items-center justify-center">
                <span className="text-gray-400 text-5xl">📦</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative w-full h-100 lg:h-120 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                <Image
                    src={images[current]}
                    alt={`Product image ${current + 1}`}
                    fill
                    className="object-contain transition-opacity duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                    priority
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Previous image"
                            id="carousel-prev-btn"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Next image"
                            id="carousel-next-btn"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-green-500 w-5' : 'bg-white/70'
                                        }`}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Counter badge */}
                {images.length > 1 && (
                    <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {current + 1} / {images.length}
                    </span>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current
                                ? 'border-green-500 shadow-md'
                                : 'border-gray-100 opacity-60 hover:opacity-100'
                                }`}
                            id={`thumbnail-btn-${i}`}
                            aria-label={`Show image ${i + 1}`}
                        >
                            <Image src={src} alt={`Thumb ${i + 1}`} fill className="object-cover" unoptimized />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    const { data, isLoading, isError, error } = useGetProductById(id);
    const product = data?.data;

    // Cart & Wishlist
    const { data: wishlistData } = useWishlist();
    const { mutate: toggleWishlist, isPending: wishlistPending } = useToggleWishlist();
    const { mutate: addToCart, isPending: addToCartPending } = useAddToCart();

    const wishlistedIds = new Set<string>(
        (wishlistData?.data ?? []).map((w: any) => w.productId?._id ?? w.productId?.id ?? w.productId)
    );

    /**
     * Toggles the wishlist state for any product.
     * Used both for the current product and for related products.
     */
    function handleWishlistToggle(productId: string) {
        if (!isAuthenticated) {
            toast.error('Log in to save to wishlist');
            return;
        }
        const isInWishlist = wishlistedIds.has(productId);
        toggleWishlist(
            { productId, isWishlisted: isInWishlist },
            {
                onSuccess: () =>
                    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist! ❤️'),
                onError: () => toast.error('Failed to update wishlist'),
            }
        );
    }

    // Related products — same category, different product
    const categoryId = getCategoryId(product?.category ?? product?.categoryId);

    const { data: relatedData } = useGetProducts(
        categoryId ? { category: categoryId } : {}
    );
    const relatedProducts =
        relatedData?.pages
            .flatMap((p) => p.data)
            .filter((p) => getProductId(p) !== id)
            .slice(0, 4) ?? [];

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) return <ProductDetailSkeleton />;

    // ── Error state ────────────────────────────────────────────────────────
    if (isError || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Product not found</h2>
                <p className="text-gray-500 mb-6">
                    {error?.message || 'This listing may have been removed or doesn\'t exist.'}
                </p>
                <Link
                    href="/products"
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    const productId = getProductId(product);
    const seller =
        product.seller ??
        (typeof product.ownerId === 'object' && product.ownerId !== null
            ? (product.ownerId as Seller)
            : null);
    const category = typeof product.category === 'object' && product.category !== null
        ? product.category
        : typeof product.categoryId === 'object' && product.categoryId !== null
            ? product.categoryId
            : null;
    const conditionLabel = CONDITION_LABELS[product.condition];
    const conditionColor = CONDITION_COLORS[product.condition];
    const isOwner = Boolean(user?.id && seller?._id && user.id === seller._id);
    const isWishlisted = wishlistedIds.has(productId || id);
    const availableStock = Math.max(0, Number(product.quantity ?? 0));
    const isOutOfStock = availableStock <= 0;

    function handleShare() {
        const shareTitle = product?.title ?? 'Product';
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: shareTitle, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* ── Breadcrumb ─────────────────────────────────────────────── */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-green-600 font-medium transition-colors"
                        id="back-btn"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span>/</span>
                    <Link href="/products" className="hover:text-green-600 transition-colors">
                        Products
                    </Link>
                    {category && (
                        <>
                            <span>/</span>
                            <Link
                                href={`/products?category=${getCategoryId(category)}`}
                                className="hover:text-green-600 transition-colors"
                            >
                                {(category as any).name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-700 font-medium line-clamp-1 max-w-50">
                        {product.title}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* ── Left: Images ─────────────────────────────────────────── */}
                    <div>
                        <ImageCarousel images={product.images ?? []} />
                    </div>

                    {/* ── Right: Info ──────────────────────────────────────────── */}
                    <div className="flex flex-col gap-5">
                        {/* Status + badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                            {product.status && product.status !== 'available' && (
                                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {product.status}
                                </span>
                            )}
                            <span
                                className="text-xs font-bold px-3 py-1 rounded-full text-white"
                                style={{ backgroundColor: conditionColor }}
                            >
                                {conditionLabel}
                            </span>
                            {Boolean(product.negotiable) && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                                    Negotiable
                                </span>
                            )}
                            {category && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                    {(category as any).name}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                            {product.title}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-gray-900">
                                {formatPrice(product.price)}
                            </span>
                            {Boolean(product.negotiable) && (
                                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                    Price negotiable
                                </span>
                            )}
                        </div>

                        {/* Meta info pills */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                                <MapPin className="w-4 h-4 text-green-600" />
                                {product.campus || 'Campus not specified'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                                <Eye className="w-4 h-4 text-blue-500" />
                                {product.views ?? 0} views
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                                <Tag className="w-4 h-4 text-gray-400" />
                                Condition: {conditionLabel}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                {isOutOfStock ? 'Out of Stock' : `Available: ${availableStock} in stock`}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                                Description
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                                {product.description}
                            </p>
                        </div>

                        {/* Posted date */}
                        {product.createdAt && (
                            <p className="text-xs text-gray-400 font-medium">
                                Posted {timeAgo(product.createdAt)}
                            </p>
                        )}

                        {/* CTA buttons */}
                        {!isOwner ? (
                            (product.status ?? 'available') === 'available' && !isOutOfStock ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                toast.error('Please log in to add items to cart');
                                                return;
                                            }
                                            addToCart({ productId: productId || id });
                                        }}
                                        disabled={addToCartPending}
                                        className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {addToCartPending ? 'Adding...' : 'Add to Cart'}
                                    </button>
                                    <div className="flex gap-3">
                                        <Link
                                            href={
                                                isAuthenticated
                                                    ? `/chat?productId=${productId || id}`
                                                    : '/login'
                                            }
                                            id="message-seller-btn"
                                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-green-200 hover:shadow-green-300"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Message Seller
                                        </Link>
                                        <button
                                            id="wishlist-toggle-btn"
                                            onClick={() => handleWishlistToggle(productId || id)}
                                            disabled={wishlistPending}
                                            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold border-2 transition-all ${isWishlisted
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart
                                                className="w-5 h-5"
                                                fill={isWishlisted ? 'currentColor' : 'none'}
                                            />
                                            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl text-center">
                                    {isOutOfStock ? 'Out of Stock' : 'This item is no longer available'}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="bg-green-50 border border-green-200 text-green-700 font-bold py-3 px-4 rounded-xl flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    This is your listing
                                </div>
                                <Link
                                    href={`/sell/${productId || id}/edit`}
                                    id="edit-listing-btn"
                                    className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-colors"
                                >
                                    Edit Listing
                                </Link>
                            </div>
                        )}

                        {/* Share + Report */}
                        <div className="flex gap-3 pt-1">
                            <button
                                id="share-btn"
                                onClick={handleShare}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            {!isOwner && (
                                <button
                                    id="report-btn"
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 font-semibold transition-colors ml-auto"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report
                                </button>
                            )}
                        </div>

                        {/* Safety notice */}
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-2">
                            <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                <strong>Stay safe!</strong> Always meet in a public place on campus. Never
                                transfer money before seeing the item in person.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Seller Info Card ──────────────────────────────────────────── */}
                {seller && (
                    <div className="mt-10 bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            About the Seller
                        </h2>
                        <div className="flex items-center gap-5">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-linear-to-br from-green-400 to-emerald-600 shrink-0">
                                {seller.profilePicture ? (
                                    <Image
                                        src={seller.profilePicture}
                                        alt={seller.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-black">
                                        {seller.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
                                {seller.university && (
                                    <p className="text-sm text-gray-500 mt-0.5">{seller.university}</p>
                                )}
                                {seller.campus && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {seller.campus}
                                    </div>
                                )}
                            </div>
                            {!isOwner && (
                                <Link
                                    href={isAuthenticated ? `/chat?productId=${productId || id}` : '/login'}
                                    id="seller-message-btn"
                                    className="ml-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    Message
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Related Products ─────────────────────────────────────────── */}
                {relatedProducts.length > 0 && (
                    <section className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Related Products</h2>
                            <Link
                                href={categoryId ? `/products?category=${categoryId}` : '/products'}
                                className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={getProductId(p)}
                                    product={p}
                                    isWishlisted={wishlistedIds.has(getProductId(p))}
                                    onWishlistToggle={() => handleWishlistToggle(getProductId(p))}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
