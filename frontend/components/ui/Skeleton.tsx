// Skeleton utility components for loading states

export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
            aria-hidden="true"
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Image */}
            <Skeleton className="w-full h-56 rounded-none rounded-t-2xl" />
            <div className="p-4 space-y-3">
                {/* Badge row */}
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                {/* Price */}
                <Skeleton className="h-7 w-28" />
                {/* Seller row */}
                <div className="flex items-center gap-3 pt-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image carousel */}
                <Skeleton className="w-full h-[420px] rounded-3xl" />
                {/* Info */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-2/3" />
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <div className="pt-4 space-y-3">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FilterBarSkeleton() {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-28 flex-shrink-0 rounded-xl" />
            ))}
        </div>
    );
}
