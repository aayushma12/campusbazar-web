import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

/**
 * useAuth — returns the current user and authentication state.
 * isLoading is true until the Zustand store has rehydrated from localStorage.
 */
export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isAdminFn = useAuthStore((s) => s.isAdmin);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait one tick for Zustand persist to rehydrate
        const t = setTimeout(() => setIsLoading(false), 0);
        return () => clearTimeout(t);
    }, []);

    return {
        user,
        isAuthenticated,
        isAdmin: isAdminFn(),
        isLoading,
    };
}
