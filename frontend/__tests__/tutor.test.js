import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorPage from '@/app/(student)/tutor/page';

const pushMock = jest.fn();
const createTutorRequestMock = jest.fn();
const getAvailableTutorRequestsMock = jest.fn();
const acceptTutorRequestMock = jest.fn();
const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'student-1', name: 'Student One' },
    isAuthenticated: true,
  })),
}));

jest.mock('@/lib/tutorApi', () => ({
  createTutorRequest: (...args) => createTutorRequestMock(...args),
  getAvailableTutorRequests: (...args) => getAvailableTutorRequestsMock(...args),
  acceptTutorRequest: (...args) => acceptTutorRequestMock(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args) => toastSuccess(...args),
    error: (...args) => toastError(...args),
  },
}));

describe('tutor page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAvailableTutorRequestsMock.mockResolvedValue([
      {
        _id: 'req-1',
        studentId: { _id: 'student-2', name: 'Riya', campus: 'Kirtipur' },
        subject: 'Math',
        topic: 'Calculus',
        description: 'Need help with limits',
        preferredTime: 'Tomorrow 5 PM',
        createdAt: '2025-05-01T00:00:00.000Z',
      },
    ]);
  });

  test('renders tutor dashboard with request form', async () => {
    render(<TutorPage />);

    expect(await screen.findByRole('heading', { level: 1, name: /tutor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  test('submits tutor request successfully', async () => {
    const user = userEvent.setup();
    createTutorRequestMock.mockResolvedValueOnce({ success: true });

    render(<TutorPage />);

    await user.type(screen.getByPlaceholderText(/mathematics, computing/i), 'Physics');
    await user.type(screen.getByPlaceholderText(/linear algebra, react hooks/i), 'Kinematics');
    await user.type(screen.getByPlaceholderText(/this saturday at 5 pm/i), 'Friday 4 PM');
    await user.type(screen.getByPlaceholderText(/briefly describe what you need help with/i), 'Need help with projectile motion');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(createTutorRequestMock).toHaveBeenCalledWith({
        subject: 'Physics',
        topic: 'Kinematics',
        description: 'Need help with projectile motion',
        preferredTime: 'Friday 4 PM',
      });
      expect(toastSuccess).toHaveBeenCalledWith('Tutor request sent successfully!');
    });
  });

  test('handles tutor request submit failure', async () => {
    const user = userEvent.setup();
    createTutorRequestMock.mockRejectedValueOnce(new Error('failed'));

    render(<TutorPage />);

    await user.type(screen.getByPlaceholderText(/mathematics, computing/i), 'Chemistry');
    await user.type(screen.getByPlaceholderText(/linear algebra, react hooks/i), 'Organic');
    await user.type(screen.getByPlaceholderText(/this saturday at 5 pm/i), 'Monday 6 PM');
    await user.type(screen.getByPlaceholderText(/briefly describe what you need help with/i), 'Need notes');
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('Failed to send tutor request');
    });
  });

  test('accepts available request and routes to chat', async () => {
    const user = userEvent.setup();
    acceptTutorRequestMock.mockResolvedValueOnce({ data: { chat: { id: 'chat-99' } } });

    render(<TutorPage />);

    const button = await screen.findByRole('button', { name: /accept request/i });
    await user.click(button);

    await waitFor(() => {
      expect(acceptTutorRequestMock).toHaveBeenCalledWith('req-1');
      expect(pushMock).toHaveBeenCalledWith('/chat/chat-99');
    });
  });

  test.failing('intentional failing demo: allows accepting own request', async () => {
    const { useAuth } = require('@/hooks/useAuth');
    useAuth.mockReturnValue({
      user: { id: 'student-2', name: 'Riya' },
      isAuthenticated: true,
    });

    render(<TutorPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /accept request/i })).toBeEnabled();
    });
  });
});
