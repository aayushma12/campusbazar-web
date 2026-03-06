import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/register/page';
import toast from 'react-hot-toast';

const mockPush = jest.fn();
const mockRegisterMutate = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    loading: jest.fn(() => 'register-toast'),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/auth/queries', () => ({
  useRegisterMutation: () => ({
    mutateAsync: mockRegisterMutate,
    isPending: false,
  }),
}));

describe('register page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form fields', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@campus.edu/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create free account/i })).toBeInTheDocument();
  });

  test('shows password mismatch validation error', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/john doe/i), 'Test User');
    await user.type(screen.getByPlaceholderText(/you@campus.edu/i), 'test@campus.edu');
    await user.selectOptions(screen.getByRole('combobox'), 'Tribhuvan University');
    await user.type(screen.getByPlaceholderText(/kirtipur/i), 'Kirtipur');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], '123456');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], '654321');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('submits valid registration and navigates to login', async () => {
    const user = userEvent.setup();
    mockRegisterMutate.mockResolvedValueOnce({ success: true });

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/john doe/i), 'Campus User');
    await user.type(screen.getByPlaceholderText(/you@campus.edu/i), 'user@campus.edu');
    await user.selectOptions(screen.getByRole('combobox'), 'Kathmandu University');
    await user.type(screen.getByPlaceholderText(/kirtipur/i), 'Dhulikhel');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'abc12345');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'abc12345');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(mockRegisterMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Campus User',
          email: 'user@campus.edu',
          university: 'Kathmandu University',
          campus: 'Dhulikhel',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(toast.success).toHaveBeenCalled();
  });

  test('shows API error toast when registration fails', async () => {
    const user = userEvent.setup();
    mockRegisterMutate.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } });

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/john doe/i), 'Campus User');
    await user.type(screen.getByPlaceholderText(/you@campus.edu/i), 'user@campus.edu');
    await user.selectOptions(screen.getByRole('combobox'), 'Pokhara University');
    await user.type(screen.getByPlaceholderText(/kirtipur/i), 'Pokhara');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'abc12345');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'abc12345');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists', { id: 'register-toast' });
    });
  });

  test.failing('intentional failing demo: expects success toast on failed API', async () => {
    const user = userEvent.setup();
    mockRegisterMutate.mockRejectedValueOnce(new Error('Server error'));

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/john doe/i), 'Fail User');
    await user.type(screen.getByPlaceholderText(/you@campus.edu/i), 'fail@campus.edu');
    await user.selectOptions(screen.getByRole('combobox'), 'Other');
    await user.type(screen.getByPlaceholderText(/kirtipur/i), 'Any');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], 'abc12345');
    await user.type(screen.getAllByPlaceholderText('••••••••')[1], 'abc12345');
    await user.click(screen.getByRole('button', { name: /create free account/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
