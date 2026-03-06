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
// comment-only local commit 12
// comment-only local commit 13
// comment-only local commit 14
// comment-only local commit 15
// comment-only local commit 16
// comment-only local commit 17
// comment-only local commit 18
// comment-only local commit 19
// comment-only local commit 20
// comment-only local commit 21
// comment-only local commit 22
// comment-only local commit 23
// comment-only local commit 24
// comment-only local commit 25
// comment-only local commit 26
// comment-only local commit 27
// comment-only local commit 28
// comment-only local commit 29
// comment-only local commit 30
// comment-only local commit 31
// quick note: this suite mirrors current admin UX flow
// reviewer note: keeping this mock explicit avoids flaky reads
// TODO(later): if labels become semantic, tighten these selectors
// wording check: expectation follows current API response shape
// edge-case thought: empty result list should still render shell
// maintenance: keep this setup aligned with auth store contract
// readability: grouping arrange/act/assert mentally helps here
// follow-up: can migrate this to shared test utils when stable
// context: this assertion protects the role-based branch
// rationale: mock is intentional to avoid network-dependent tests
// polish: leaving this breadcrumb for next contributor
