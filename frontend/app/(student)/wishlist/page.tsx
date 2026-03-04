'use client';

import { useState } from 'react';
import { useWishlist, useToggleWishlist } from '@/hooks/useProducts';
import { useCart, useAddToCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';
import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowRight,
    Package,
    ShoppingBag,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function WishlistPage() {
    const { data: wishlistData, isLoading } = useWishlist();
    const { mutate: toggleWishlist, mutateAsync: toggleWishlistAsync } = useToggleWishlist();
    const { mutate: addToCart, isPending: addingToCart } = useAddToCart();
    const [isClearing, setIsClearing] = useState(false);

    const wishlistItems = wishlistData?.data ?? [];

    const handleRemove = (productId: string) => {
        toggleWishlist({ productId, isWishlisted: true }, {
            onSuccess: () => toast.success('Removed from wishlist'),
            onError: () => toast.error('Failed to remove item'),
        });
    };

    const handleAddToCart = (productId: string) => {
        addToCart({ productId }, {
            onSuccess: () => toast.success('Added to cart!'),
            onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to add to cart'),
        });
    };

    const handleClearWishlist = async () => {
        if (wishlistItems.length === 0) return;

        const confirmed = window.confirm(
            `Remove all ${wishlistItems.length} items from your wishlist?`
        );
        if (!confirmed) return;

        setIsClearing(true);
        try {
            const productIds = wishlistItems
                .map((wish: any) => wish?.productId?.id || wish?.productId?._id)
                .filter(Boolean);

            const results = await Promise.allSettled(
                productIds.map((productId: string) =>
                    toggleWishlistAsync({ productId, isWishlisted: true })
                )
            );

            const failed = results.filter((r) => r.status === 'rejected').length;
            if (failed === 0) {
                toast.success('Wishlist cleared successfully');
            } else {
                toast.error(`${failed} item(s) could not be removed. Please try again.`);
            }
        } finally {
            setIsClearing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-32 h-32 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Heart className="w-14 h-14 text-red-300" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your wishlist is empty</h1>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                    Save items you love and they'll show up here. Start exploring our campus marketplace!
                </p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 hover:bg-black text-white font-bold rounded-3xl transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                    Start Exploring
                    <ArrowRight className="w-6 h-6" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        My <span className="text-red-500">Wishlist</span>
                        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full uppercase tracking-widest">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-3 text-lg font-medium">Items you've saved for later.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClearWishlist}
                        disabled={isClearing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove all items from wishlist"
                    >
                        {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {isClearing ? 'Clearing...' : 'Clear Wishlist'}
                    </button>

                    <Link
                        href="/cart"
                        className="flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        View My Cart <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlistItems.map((wish: any) => {
                    const product = wish.productId;
                    if (!product) return null;

                    return (
                        <div
                            key={wish.id}
                            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                                )}

                                {/* Quick actions on hover */}
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-linear-to-t from-black/60 to-transparent">
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className="w-full py-3 bg-white hover:bg-green-50 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
                                    >
                                        <ShoppingCart className="w-4 h-4 text-green-600" />
                                        Add to Cart
                                    </button>
                                </div>

                                {/* Status Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${product.status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                        }`}>
                                        {product.status}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleRemove(product.id || product._id)}
                                    className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Details */}
                            <div className="p-6 flex-1 flex flex-col">
                                <Link
                                    href={`/products/${product.id}`}
                                    className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-1 mb-1"
                                >
                                    {product.title}
                                </Link>
                                <p className="text-xs text-gray-400 font-medium mb-4 flex items-center gap-1">
                                    📍 {product.campus}
                                </p>

                                <div className="mt-auto flex items-center justify-between">
                                    <p className="text-2xl font-black text-gray-900">
                                        {formatPrice(product.price)}
                                    </p>
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
