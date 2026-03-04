import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Axios instance with auth token injected automatically.
 */
const api = axios.create({ baseURL: BASE_URL });

function getTokenFromPersistedAuth(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem('auth-storage');
        if (!raw) return null;

        const parsed = JSON.parse(raw) as {
            state?: { accessToken?: string | null };
        };

        return parsed?.state?.accessToken ?? null;
    } catch {
        return null;
    }
}

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = useAuthStore.getState().accessToken ?? getTokenFromPersistedAuth();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401 && typeof window !== 'undefined') {
            const { logout } = useAuthStore.getState();
            logout();

            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                const next = encodeURIComponent(currentPath + window.location.search);
                window.location.href = `/login?next=${next}`;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
