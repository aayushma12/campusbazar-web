'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types/product';
import { CONDITION_LABELS, CONDITION_COLORS, getProductId, normalizeProductImages } from '@/types/product';
import { formatPrice } from '@/lib/formatters';
import { useAddToCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    onWishlistToggle?: (e: React.MouseEvent) => void;
}

function getSellerInfo(product: Product) {
    if (product.seller && typeof product.seller === 'object') {
        return product.seller;
    }
    if (typeof product.ownerId === 'object' && product.ownerId !== null) {
        return product.ownerId;
    }
    return null;
}

function getCategoryName(product: Product): string {
    if (typeof product.category === 'object' && product.category !== null) {
        return (product.category as any).name || 'General';
    }
    if (typeof product.categoryId === 'object' && product.categoryId !== null) {
        return (product.categoryId as any).name || 'General';
    }
    return 'General';
}

export default function ProductCard({
    product,
    isWishlisted = false,
    onWishlistToggle,
}: ProductCardProps) {
    const { isAuthenticated, user } = useAuth();
    const { mutate: addToCart } = useAddToCart();
    const productId = getProductId(product);
    const seller = getSellerInfo(product);
    const ownerId = seller?._id || seller?.id || (typeof product.ownerId === 'string' ? product.ownerId : '');
    const isOwner = Boolean(user?.id && ownerId && user.id === ownerId);
    const availableStock = Math.max(0, Number(product.quantity ?? 0));
    const isOutOfStock = availableStock <= 0 || (product.status ?? 'available') !== 'available';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please log in to add items to cart');
            return;
        }

        if (isOwner) {
            toast.error('You cannot buy your own product');
            return;
        }

        if (isOutOfStock) {
            toast.error('Out of stock');
            return;
        }

        addToCart({ productId });
    };

    const thumbnailUrl = normalizeProductImages(product.images)?.[0] || '/placeholder-product.jpg';
    const conditionLabel = CONDITION_LABELS[product.condition];
    const conditionColor = CONDITION_COLORS[product.condition];
    const categoryName = getCategoryName(product);

    return (
        <Link
            href={`/products/${productId}`}
            className="group relative flex flex-col bg-white rounded-4xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            aria-label={`View ${product.title}`}
        >
            {/* Thumbnail Container */}
            <div className="relative w-full h-56 overflow-hidden bg-gray-50">
                <Image
                    src={thumbnailUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                />

                {/* Glassmorphism Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.negotiable && (
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            Negotiable
                        </span>
                    )}
                    <span
                        className="backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider"
                        style={{ backgroundColor: `${conditionColor}E6` }} // E6 is roughly 90% opacity for hex
                    >
                        {conditionLabel}
                    </span>
                </div>

                {/* Wishlist Button - Hover animated */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onWishlistToggle?.(e);
                    }}
                    className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 transform group-hover:translate-x-0 sm:translate-x-12 group-hover:opacity-100 sm:opacity-0 ${isWishlisted
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/95 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:scale-110'
                        }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    id={`wishlist-btn-${productId}`}
                >
                    <Heart
                        className="w-5 h-5"
                        fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                </button>

                {/* Status overlay */}
                {product.status && product.status !== 'available' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                        <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 font-black text-xs px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl">
                            {product.status}
                        </span>
                    </div>
                )}

                {/* View Details Overlay Tooltip-like */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-2xl">
                        Click to view details
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {categoryName}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-tight">
                        <MapPin className="w-3 h-3 text-green-500" />
                        <span className="truncate max-w-20">{product.campus || 'N/A'}</span>
                    </div>
                </div>

                <div className="text-[11px] font-semibold text-gray-500">
                    {isOwner
                        ? 'Your listing'
                        : (isOutOfStock ? 'Out of Stock' : `Available: ${availableStock} in stock`)
                    }
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2 group-hover:text-green-600 transition-colors duration-300 min-h-10">
                    {product.title}
                </h3>

                {/* Price + Action */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter -mb-1">Price</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isOwner}
                        className="w-11 h-11 flex items-center justify-center bg-gray-900 hover:bg-green-600 text-white rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-200 active:scale-90 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        title={isOwner ? 'You cannot buy your own product' : (isOutOfStock ? 'Out of stock' : 'Add to cart')}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>

                {/* Simple seller tagline */}
                {seller && (
                    <div className="flex items-center gap-2 pt-1">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                            {seller.profilePicture ? (
                                <img src={seller.profilePicture} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[8px] font-bold text-gray-400">{seller.name?.charAt(0)}</span>
                            )}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 truncate">
                            Sold by <span className="text-gray-600 font-bold">{seller.name}</span>
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
}
