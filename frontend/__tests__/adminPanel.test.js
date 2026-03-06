import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserManagementPage from '@/app/dashboard/admin/users/page';
import AdminDashboardPage from '@/app/dashboard/admin/page';

const pushMock = jest.fn();
const deleteUserMutateMock = jest.fn();

const usersFixture = [
  {
    id: 'u1',
    _id: 'u1',
    name: 'Aarav',
    email: 'aarav@campus.edu',
    role: 'user',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u2',
    _id: 'u2',
    name: 'Bina',
    email: 'bina@campus.edu',
    role: 'user',
    status: 'inactive',
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector) => {
    const state = {
      isAdmin: () => true,
      isAuthenticated: true,
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

jest.mock('@/auth/queries', () => ({
  useUsersQuery: jest.fn(() => ({ data: usersFixture, isLoading: false, isError: false })),
  useDeleteUserMutation: jest.fn(() => ({ mutateAsync: deleteUserMutateMock, isPending: false })),
}));

jest.mock('@/hooks/usePayment', () => ({
  usePaymentHistory: () => ({
    data: {
      data: [
        { id: 't1', status: 'done', amount: 1200, buyerId: { name: 'A' }, sellerId: { name: 'B' } },
        { id: 't2', status: 'failed', amount: 800, buyerId: { name: 'C' }, sellerId: { name: 'D' } },
      ],
    },
    isLoading: false,
  }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    loading: jest.fn(() => 'toast-id'),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('admin panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
    deleteUserMutateMock.mockResolvedValue({ success: true });
  });

  test('renders user management table and user rows', () => {
    render(<UserManagementPage />);

    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText('Aarav')).toBeInTheDocument();
    expect(screen.getByText('Bina')).toBeInTheDocument();
  });

  test('filters users using search input', async () => {
    const user = userEvent.setup();
    render(<UserManagementPage />);

    await user.type(screen.getByPlaceholderText(/search users/i), 'aarav');

    expect(screen.getByText('Aarav')).toBeInTheDocument();
    expect(screen.queryByText('Bina')).not.toBeInTheDocument();
  });

  test('deletes selected non-admin user', async () => {
    const user = userEvent.setup();
    render(<UserManagementPage />);

    await user.click(screen.getByRole('button', { name: /delete aarav/i }));

    await waitFor(() => {
      expect(deleteUserMutateMock).toHaveBeenCalledWith('u1');
    });
  });

  test('admin dashboard renders metrics and quick actions', async () => {
    render(<AdminDashboardPage />);

    expect(await screen.findByText(/admin overview/i)).toBeInTheDocument();
    expect(screen.getByText(/total users/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
  });

  test.failing('intentional failing demo: expects redirect while admin is authorized', async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });
});
// comment-only local commit 1
// comment-only local commit 2
// comment-only local commit 3
// comment-only local commit 4
// comment-only local commit 5
// comment-only local commit 6
// comment-only local commit 7
// comment-only local commit 8
// comment-only local commit 9
// comment-only local commit 10
// comment-only local commit 11
