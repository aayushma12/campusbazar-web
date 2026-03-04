'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, PackageSearch } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useGetProducts } from '@/hooks/useProducts';
import { useWishlist, useToggleWishlist } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
    CONDITION_OPTIONS,
    CAMPUS_OPTIONS,
    SORT_OPTIONS,
    type ProductCondition,
    type ProductFilters,
} from '@/types/product';

function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Read filters from URL ──────────────────────────────────────────────
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [showFilters, setShowFilters] = useState(false);

    const filters: Omit<ProductFilters, 'page'> = useMemo(() => ({
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        campus: searchParams.get('campus') || undefined,
        condition: (searchParams.get('condition') as ProductCondition) || undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        sort: searchParams.get('sort') || 'createdAt:desc',
    }), [searchParams]);

    // ── Helpers to update URL params ───────────────────────────────────────
    const setParam = useCallback(
        (key: string, value: string | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // Reset to page 1 on filter change
            params.delete('page');
            router.push(`/products?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    const clearAllFilters = () => {
        router.push('/products', { scroll: false });
        setSearchInput('');
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.campus) count++;
        if (filters.condition) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

    // ── TanStack Query: infinite products ─────────────────────────────────
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useGetProducts(filters);

    const { data: categoriesData } = useCategories();

    const categoryOptions = useMemo(() => {
        const raw = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
        const map = new Map<string, { id: string; name: string }>();

        for (const item of raw as any[]) {
            const id = item?.id || item?._id;
            if (!id) continue;
            const name = item?.name?.trim?.() || 'General';
            if (!map.has(id)) {
                map.set(id, { id, name });
            }
        }

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [categoriesData]);

    const products = useMemo(
        () => data?.pages.flatMap((p) => p.data) ?? [],
        [data]
    );

    // ── Intersection Observer for infinite scroll ──────────────────────────
    const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ── Wishlist state ─────────────────────────────────────────────────────
    const { isAuthenticated } = useAuth();
    const { data: wishlistData } = useWishlist();
    const { mutate: toggleWishlist } = useToggleWishlist();

    const wishlistedIds = useMemo<Set<string>>(() => {
        const items = wishlistData?.data ?? [];
        return new Set(items.map((w: any) => w.productId?.id ?? w.productId));
    }, [wishlistData]);

    function handleWishlistToggle(productId: string) {
        if (!isAuthenticated) {
            toast.error('Please log in to save items to your wishlist');
            return;
        }
        toggleWishlist(
            { productId, isWishlisted: wishlistedIds.has(productId) },
            {
                onSuccess: () =>
                    toast.success(wishlistedIds.has(productId) ? 'Removed from wishlist' : 'Added to wishlist'),
                onError: () => toast.error('Failed to update wishlist'),
            }
        );
    }

    // ── Price range local state ────────────────────────────────────────────
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice ?? 0,
        filters.maxPrice ?? 50000,
    ]);
    const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handlePriceChange(min: number, max: number) {
        setPriceRange([min, max]);
        if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
        priceDebounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (min > 0) params.set('minPrice', String(min));
            else params.delete('minPrice');
            if (max < 50000) params.set('maxPrice', String(max));
            else params.delete('maxPrice');
            router.push(`/products?${params.toString()}`, { scroll: false });
        }, 500);
    }

    // ── Search debounce ───────────────────────────────────────────────────
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    function handleSearchChange(val: string) {
        setSearchInput(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setParam('search', val || undefined);
        }, 400);
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="bg-linear-to-r from-green-600 to-emerald-700 pt-14 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                <div className="container mx-auto max-w-4xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                        Explore the Marketplace
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        {data?.pages[0]?.pagination.total
                            ? `${data.pages[0].pagination.total.toLocaleString()} items in your campus community`
                            : 'Find great deals from students near you'}
                    </p>

                    {/* Search bar */}
                    <div className="relative bg-white rounded-2xl shadow-xl flex items-center">
                        <Search className="absolute left-5 w-5 h-5 text-gray-400" />
                        <input
                            id="products-search-input"
                            type="text"
                            placeholder="Search for textbooks, electronics, gear…"
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 rounded-2xl text-gray-900 bg-transparent outline-none text-base font-medium placeholder:text-gray-400"
                        />
                        {searchInput && (
                            <button
                                onClick={() => { setSearchInput(''); setParam('search', undefined); }}
                                className="absolute right-5 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 -mt-6 pb-16">
                {/* ── Filter Bar ────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filter toggle */}
                        <button
                            id="toggle-filters-btn"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all ${showFilters || activeFilterCount > 0
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-white text-green-700 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                id="sort-select"
                                value={filters.sort}
                                onChange={(e) => setParam('sort', e.target.value)}
                                className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 outline-none hover:border-green-300 transition-colors appearance-none cursor-pointer"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Condition chips */}
                        <div className="flex gap-2 flex-wrap">
                            {CONDITION_OPTIONS.map((c) => (
                                <button
                                    key={c.value}
                                    id={`condition-chip-${c.value}`}
                                    onClick={() =>
                                        setParam('condition', filters.condition === c.value ? undefined : c.value)
                                    }
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${filters.condition === c.value
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-green-300'
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Clear filters */}
                        {activeFilterCount > 0 && (
                            <button
                                id="clear-filters-btn"
                                onClick={clearAllFilters}
                                className="ml-auto flex items-center gap-1.5 text-sm text-red-500 font-semibold hover:text-red-700 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Expanded filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
                            {/* Category */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                                    Category
                                </label>
                                <select
                                    id="category-select"
                                    value={filters.category || ''}
                                    onChange={(e) => setParam('category', e.target.value || undefined)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-green-400 transition-colors"
                                >
                                    <option value="">All Categories</option>
                                    {categoryOptions.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Campus */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                                    Campus
                                </label>
                                <select
                                    id="campus-select"
                                    value={filters.campus || ''}
                                    onChange={(e) => setParam('campus', e.target.value || undefined)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-green-400 transition-colors"
                                >
                                    <option value="">All Campuses</option>
                                    {CAMPUS_OPTIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Price */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                                    Min Price (Rs.)
                                </label>
                                <input
                                    id="min-price-input"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={priceRange[0] || ''}
                                    onChange={(e) => handlePriceChange(Number(e.target.value) || 0, priceRange[1])}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-green-400 transition-colors"
                                />
                            </div>

                            {/* Max Price */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                                    Max Price (Rs.)
                                </label>
                                <input
                                    id="max-price-input"
                                    type="number"
                                    min={0}
                                    placeholder="50000"
                                    value={priceRange[1] < 50000 ? priceRange[1] : ''}
                                    onChange={(e) => handlePriceChange(priceRange[0], Number(e.target.value) || 50000)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white outline-none focus:border-green-400 transition-colors"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Results Count ─────────────────────────────────────────── */}
                {!isLoading && (
                    <div className="mb-4 text-sm text-gray-500 font-medium">
                        {products.length > 0
                            ? `Showing ${products.length} of ${data?.pages[0]?.pagination.total ?? 0} results`
                            : null}
                    </div>
                )}

                {/* ── Error State ───────────────────────────────────────────── */}
                {isError && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Oops, something went wrong</h3>
                        <p className="text-gray-500 mb-6">We couldn't load the products. Please try again.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Product Grid ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {isLoading
                        ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWishlisted={wishlistedIds.has(product.id)}
                                onWishlistToggle={() => handleWishlistToggle(product.id)}
                            />
                        ))}
                </div>

                {/* ── Empty State ───────────────────────────────────────────── */}
                {!isLoading && products.length === 0 && !isError && (
                    <div className="text-center py-24">
                        <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-5" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">
                            {activeFilterCount > 0
                                ? 'Try adjusting your filters or search query'
                                : 'Be the first to list something on the marketplace!'}
                        </p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── Infinite scroll sentinel ──────────────────────────────── */}
                <div ref={sentinelRef} className="py-6 flex justify-center">
                    {isFetchingNextPage && (
                        <div className="flex items-center gap-3 text-gray-500 font-medium">
                            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                            Loading more…
                        </div>
                    )}
                    {!hasNextPage && products.length > 0 && !isLoading && (
                        <p className="text-gray-400 text-sm font-medium">
                            ✓ You've reached the end
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            }
        >
            <ProductsPageContent />
        </Suspense>
    );
}
