import axios from 'axios';

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
axiosApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.accessToken) {
            config.headers.Authorization = `Bearer ${state.accessToken}`;
          }
        } catch (error) {
          console.error('Error parsing auth storage:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh if refresh token exists
        if (typeof window !== 'undefined') {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const { state } = JSON.parse(authStorage);
            if (state?.refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                { refreshToken: state.refreshToken }
              );

              if (response.data?.accessToken) {
                // Update token in storage
                state.accessToken = response.data.accessToken;
                localStorage.setItem('auth-storage', JSON.stringify({ state }));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axiosApi(originalRequest);
              }
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosApi;
