import api from './api';

export interface CartItem {
    id: string;
    productId: {
        id: string;
        title: string;
        price: number;
        images: string[];
        campus: string;
        ownerId: string;
        quantity?: number;
        status?: string;
    };
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export const cartApi = {
    get: async (): Promise<{ success: boolean; data: CartItem[] }> => {
        const { data } = await api.get('/cart');
        return data;
    },
    add: async (productId: string, quantity: number = 1): Promise<{ success: boolean; data: CartItem }> => {
        const { data } = await api.post('/cart', { productId, quantity });
        return data;
    },
    updateQuantity: async (id: string, quantity: number): Promise<{ success: boolean; data: CartItem }> => {
        const { data } = await api.patch(`/cart/${id}`, { quantity });
        return data;
    },
    remove: async (id: string): Promise<{ success: boolean; message: string }> => {
        const { data } = await api.delete(`/cart/${id}`);
        return data;
    },
    clear: async (): Promise<{ success: boolean; message: string }> => {
        const { data } = await api.delete('/cart');
        return data;
    }
};
