import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '@/components/layout/NotificationBell';

const markReadMock = jest.fn();
const markAllReadMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(() => ({
    data: {
      data: {
        notifications: [
          {
            id: 'n1',
            title: 'Order Update',
            message: 'Your order has been confirmed.',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    },
    isLoading: false,
  })),
  useUnreadNotificationCount: jest.fn(() => ({ data: { data: { unreadCount: 1 } } })),
  useMarkNotificationRead: jest.fn(() => ({ mutateAsync: markReadMock, isPending: false })),
  useMarkAllNotificationsRead: jest.fn(() => ({ mutateAsync: markAllReadMock, isPending: false })),
  useNotificationRealtime: jest.fn(),
}));

describe('notifications bell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    markReadMock.mockResolvedValue({ success: true });
    markAllReadMock.mockResolvedValue({ success: true });
  });

  test('renders notification bell with unread badge', () => {
    render(<NotificationBell />);

    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('opens dropdown and displays notification content', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText(/notifications/i));

    expect(await screen.findByText(/order update/i)).toBeInTheDocument();
    expect(screen.getByText(/your order has been confirmed/i)).toBeInTheDocument();
  });

  test('marks single notification as read on click', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText(/notifications/i));
    await user.click(await screen.findByText(/order update/i));

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledWith('n1');
    });
  });

  test('marks all notifications as read', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText(/notifications/i));
    await user.click(screen.getByRole('button', { name: /mark all read/i }));

    await waitFor(() => {
      expect(markAllReadMock).toHaveBeenCalled();
    });
  });

  test.failing('intentional failing demo: shows bell for unauthenticated user', () => {
    const { useAuth } = require('@/hooks/useAuth');
    useAuth.mockReturnValueOnce({ isAuthenticated: false });

    render(<NotificationBell />);
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
  });
});
