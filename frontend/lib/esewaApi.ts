import api from '@/lib/api';
import type {
    PaymentInitResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    TransactionResponse,
} from '@/types/payment';

// ─── eSewa Payment API ────────────────────────────────────────────────────────

export const esewaApi = {
    /**
     * POST /payment/init
     * Creates a transaction record on the backend and returns eSewa form fields
     * including the HMAC-SHA256 signature. The frontend then auto-submits
     * a hidden form directly to eSewa's payment URL.
     */
    init: async (productId: string): Promise<PaymentInitResponse> => {
        const { data } = await api.post<PaymentInitResponse>('/payment/init', {
            productId,
        });
        return data;
    },

    initCart: async (cartItems: any[]): Promise<PaymentInitResponse> => {
        const { data } = await api.post<PaymentInitResponse>('/payment/init-cart', {
            cartItems,
        });
        return data;
    },

    /**
     * POST /payment/verify
     * Sends decoded eSewa success data back to our backend for server-side
     * verification before marking the transaction as complete.
     */
    verify: async (payload: PaymentVerifyRequest): Promise<PaymentVerifyResponse> => {
        const { data } = await api.post<PaymentVerifyResponse>('/payment/verify', payload);
        return data;
    },

    /**
     * GET /payment/transaction/:id
     * Fetch a transaction by its ID (used on success/failure pages).
     */
    getTransaction: async (transactionId: string): Promise<TransactionResponse> => {
        const { data } = await api.get<TransactionResponse>(
            `/payment/transaction/${transactionId}`
        );
        return data;
    },

    getHistory: async (): Promise<{ success: boolean; data: any[] }> => {
        const { data } = await api.get('/payment/history');
        return data;
    },
};

// ─── eSewa Integration Config (frontend public values only) ───────────────────

/**
 * IMPORTANT: Secret key is NEVER handled on the frontend.
 * Signature generation happens server-side.
 */
export const ESEWA_CONFIG = {
    /** Payment gateway URL — use RC for dev, production URL for live */
    paymentUrl:
        process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL ||
        'https://rc-epay.esewa.com.np/api/epay/main/v2/form',

    /** Merchant/product code — safe to expose on frontend */
    merchantCode: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || 'EPAYTEST',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode base64 data from eSewa's success redirect query param.
 * eSewa POSTs to your success_url with a base64-encoded JSON `data` param.
 *
 * @example
 * const payload = decodeEsewaResponse(searchParams.get('data'));
 */
export function decodeEsewaResponse(base64Data: string | null) {
    if (!base64Data) return null;
    try {
        // Query params often decode '+' from base64 into ' ' (space).
        // We must convert it back to '+' for atob to work correctly.
        const normalized = base64Data.replace(/ /g, '+');
        const decoded = atob(normalized);
        return JSON.parse(decoded);
    } catch (err) {
        console.error('[eSewa] Failed to decode response:', err);
        return null;
    }
}

/**
 * Format amount to a clean string without commas (eSewa requirement).
 */
export function formatAmountForEsewa(amount: number): string {
    return amount.toString().replace(/,/g, '');
}
