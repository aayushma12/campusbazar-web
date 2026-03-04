import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'awaiting_payment' | 'paid' | 'cancelled' | 'completed';

export interface Booking {
    _id: string;
    id: string;
    studentId: { _id: string; name: string; email: string; profilePicture?: string; university?: string };
    tutorId: { _id: string; name: string; email: string; profilePicture?: string; university?: string; bio?: string };
    subject: string;
    description?: string;
    sessionType: 'online' | 'in-person';
    hours: number;
    ratePerHour: number;
    totalAmount: number;
    netToTutor: number;
    platformFee: number;
    status: BookingStatus;
    conversationId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingDto {
    tutorId: string;
    subject: string;
    description?: string;
    sessionType: 'online' | 'in-person';
    hours: number;
    ratePerHour: number;
}

export interface EsewaBookingPaymentData {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    product_service_charge: string;
    product_delivery_charge: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export interface Wallet {
    userId: string;
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const bookingApi = {
    create: async (dto: CreateBookingDto) => {
        const { data } = await api.post('/bookings', dto);
        return data as { success: boolean; data: Booking };
    },

    getMyBookings: async (role: 'student' | 'tutor' = 'student') => {
        const { data } = await api.get(`/bookings/mine?role=${role}`);
        return data as { success: boolean; data: Booking[] };
    },

    getById: async (id: string) => {
        const { data } = await api.get(`/bookings/${id}`);
        return data as { success: boolean; data: Booking };
    },

    initiatePayment: async (bookingId: string) => {
        const { data } = await api.get(`/bookings/${bookingId}/initiate-payment`);
        return data as { success: boolean; data: EsewaBookingPaymentData };
    },

    confirmPayment: async (bookingId: string, payload: {
        transactionCode: string;
        transactionUUID: string;
        amount: string;
    }) => {
        const { data } = await api.post(`/bookings/${bookingId}/confirm-payment`, payload);
        return data as { success: boolean; data: any };
    },

    cancel: async (bookingId: string) => {
        const { data } = await api.delete(`/bookings/${bookingId}`);
        return data as { success: boolean; data: Booking };
    },

    getWallet: async () => {
        const { data } = await api.get('/bookings/wallet');
        return data as { success: boolean; data: Wallet };
    },
};
