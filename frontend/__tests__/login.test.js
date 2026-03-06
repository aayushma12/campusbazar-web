import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import toast from 'react-hot-toast';

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockSetAuth = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: jest.fn(() => null) }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    loading: jest.fn(() => 'toast-id'),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ setAuth: mockSetAuth }),
}));

jest.mock('@/auth/queries', () => ({
  useLoginMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ADMIN_USER_IDS = 'admin-1';
  });

  test('renders login form fields and action button', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation errors for invalid email and short password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'bad-email');
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('submits successfully and routes student user to dashboard', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      user: { id: 'u-1', name: 'Alex', role: 'user' },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'alex@campus.edu');
    await user.type(screen.getByLabelText(/password/i), '123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u-1' }),
        'token-1',
        'refresh-1'
      );
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
      expect(mockRefresh).toHaveBeenCalled();
    });

    expect(toast.success).toHaveBeenCalled();
  });

  test('shows toast error when API call fails', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new Error('Network down'));

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'alex@campus.edu');
    await user.type(screen.getByLabelText(/password/i), '123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/network down/i), { id: 'toast-id' });
    });
  });

  test.failing('intentional failing demo: expects student to be redirected to admin route', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      accessToken: 'token-1',
      refreshToken: 'refresh-1',
      user: { id: 'u-2', name: 'Mina', role: 'user' },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), 'mina@campus.edu');
    await user.type(screen.getByLabelText(/password/i), '123456');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/admin');
    });
  });
});
