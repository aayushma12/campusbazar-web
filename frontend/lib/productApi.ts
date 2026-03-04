import api from '@/lib/api';
import type {
    ProductFilters,
    ProductsResponse,
    ProductResponse,
} from '@/types/product';
import { normalizeProduct } from '@/types/product';

function buildEmptyProductsResponse(page = 1, limit = 12): ProductsResponse {
    return {
        success: true,
        data: [],
        pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
        },
    };
}

async function getWithFallback<T>(paths: string[]): Promise<T> {
    let lastError: unknown;

    for (const path of paths) {
        try {
            const response = await api.get<T>(path);
            return response.data;
        } catch (error: any) {
            const status = error?.response?.status;
            const shouldTryNext = status === 404 || status === 405;

            if (!shouldTryNext) {
                throw error;
            }

            lastError = error;
        }
    }

    throw lastError ?? new Error('No matching endpoint found');
}

// ─── Products API ───────────────────────────────────────────────────────────

export const productApi = {
    /**
     * GET /products — paginated + filtered list
     */
    getAll: async (filters: ProductFilters): Promise<ProductsResponse> => {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.campus) params.set('campus', filters.campus);
        if (filters.condition) params.set('condition', filters.condition);
        if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.page) params.set('page', String(filters.page));
        if (filters.limit) params.set('limit', String(filters.limit));

        const query = params.toString();
        const productsPath = `/products${query ? `?${query}` : ''}`;

        let data: ProductsResponse;
        try {
            data = await getWithFallback<ProductsResponse>([
                productsPath,
                `/products/all${query ? `?${query}` : ''}`,
                `/products/public${query ? `?${query}` : ''}`,
            ]);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 404 || status === 405) {
                return buildEmptyProductsResponse(filters.page ?? 1, filters.limit ?? 12);
            }
            throw error;
        }

        return {
            ...data,
            data: Array.isArray(data?.data)
                ? data.data
                    .map((item) => normalizeProduct(item))
                    .filter((item): item is NonNullable<typeof item> => item !== null)
                : [],
        };
    },

    /**
     * GET /products/:id — single product with populated owner & category
     */
    getById: async (id: string): Promise<ProductResponse> => {
        try {
            const { data } = await api.get<ProductResponse>(`/products/${id}`);
            return {
                success: Boolean(data?.success),
                data: normalizeProduct(data?.data),
            };
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to fetch product details';
            throw new Error(message);
        }
    },

    /**
     * POST /products — create a new listing (multipart/form-data)
     */
    create: async (formData: FormData): Promise<ProductResponse> => {
        const { data } = await api.post<ProductResponse>('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /**
     * PATCH /products/:id — update an existing listing
     */
    update: async (id: string, formData: FormData): Promise<ProductResponse> => {
        const { data } = await api.patch<ProductResponse>(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /**
     * GET /products/my-listings
     */
    getMyListings: async (page = 1, limit = 12): Promise<ProductsResponse> => {
        const { data } = await api.get<ProductsResponse>(
            `/products/my-listings?page=${page}&limit=${limit}`
        );
        return {
            ...data,
            data: Array.isArray(data?.data)
                ? data.data
                    .map((item) => normalizeProduct(item))
                    .filter((item): item is NonNullable<typeof item> => item !== null)
                : [],
        };
    },

    /**
     * PATCH /products/:id/status — update listing availability status
     */
    updateStatus: async (id: string, status: 'available' | 'reserved' | 'sold'): Promise<ProductResponse> => {
        const { data } = await api.patch<ProductResponse>(`/products/${id}/status`, { status });
        return {
            ...data,
            data: normalizeProduct(data?.data),
        };
    },

    /**
     * DELETE /products/:id — remove a listing
     */
    delete: async (id: string): Promise<{ success: boolean }> => {
        const { data } = await api.delete<{ success: boolean }>(`/products/${id}`);
        return data;
    },
};

// ─── Wishlist API ───────────────────────────────────────────────────────────

export const wishlistApi = {
    get: async () => {
        const { data } = await api.get('/wishlist');
        return data;
    },

    add: async (productId: string) => {
        const { data } = await api.post(`/wishlist/${productId}`);
        return data;
    },

    remove: async (productId: string) => {
        const { data } = await api.delete(`/wishlist/${productId}`);
        return data;
    },
};

// ─── Categories API ─────────────────────────────────────────────────────────

export const categoryApi = {
    getAll: async () => {
        const paths = ['/categories', '/products/categories', '/product-categories'];

        let lastError: unknown;
        for (const path of paths) {
            try {
                const { data } = await api.get(path);
                return data;
            } catch (error: any) {
                const status = error?.response?.status;
                const shouldTryNext = status === 404 || status === 405;
                if (!shouldTryNext) throw error;
                lastError = error;
            }
        }

        // Graceful fallback: backend may not expose public categories endpoint yet.
        return { success: true, data: [], message: 'Categories endpoint not available' };
    },
    create: async (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Category name is required');
        }

        const routes = ['/categories', '/products/categories', '/product-categories'];
        const payloads = [{ name: trimmedName }, { title: trimmedName }, { categoryName: trimmedName }];

        let lastError: any;

        for (const route of routes) {
            for (const payload of payloads) {
                try {
                    const { data } = await api.post(route, payload);
                    return data;
                } catch (error: any) {
                    const status = error?.response?.status;
                    const shouldTryNext = status === 404 || status === 405 || status === 400;

                    if (!shouldTryNext) {
                        throw error;
                    }

                    lastError = error;
                }
            }
        }

        const backendMessage =
            lastError?.response?.status === 404 || lastError?.response?.status === 405
                ? 'Category creation endpoint is not available on the backend. Please use an existing category or ask backend to enable category creation.'
                : lastError?.response?.data?.message ||
                  lastError?.message ||
                  'Category creation is not available on the current backend.';

        throw new Error(backendMessage);
    },
};
