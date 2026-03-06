import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import { toast } from 'sonner';

const pushMock = jest.fn();
const replaceMock = jest.fn();
const markAsReadMock = jest.fn();
const sendMessageMock = jest.fn();

const baseConversations = [
  {
    id: 'conv-1',
    chatType: 'product',
    productId: { id: 'p1', title: 'Laptop', images: [], price: 55000 },
    participants: [
      { id: 'u1', name: 'Buyer' },
      { id: 'u2', name: 'Seller' },
    ],
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
    lastMessage: { text: 'hi', createdAt: new Date().toISOString(), senderId: 'u2' },
  },
];

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: jest.fn(() => null) }),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'u1', name: 'Buyer' } }),
}));

jest.mock('@/hooks/useChat', () => ({
  useGetConversations: jest.fn(() => ({
    data: { data: baseConversations },
    isLoading: false,
  })),
  useStartConversation: jest.fn(() => ({ mutateAsync: jest.fn() })),
  useStartTutorConversation: jest.fn(() => ({ mutateAsync: jest.fn() })),
  useGetMessages: jest.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
  useSendMessage: jest.fn(() => ({ mutateAsync: sendMessageMock, isPending: false })),
  useMarkRead: jest.fn(() => ({ mutateAsync: markAsReadMock })),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('chat workspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendMessageMock.mockResolvedValue({
      data: {
        _id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'u1',
        text: 'hello',
        read: false,
        createdAt: new Date().toISOString(),
      },
    });
    markAsReadMock.mockResolvedValue({ success: true });
  });

  test('shows loading spinner when conversations are loading', () => {
    const { useGetConversations } = require('@/hooks/useChat');
    useGetConversations
      .mockReturnValueOnce({ data: { data: [] }, isLoading: true })
      .mockReturnValueOnce({ data: { data: [] }, isLoading: true });

    render(<ChatWorkspace />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('shows empty chat hint when no active conversation selected', () => {
    render(<ChatWorkspace />);
    expect(screen.getByText(/select a chat/i)).toBeInTheDocument();
  });

  test('opens selected conversation and sends a message', async () => {
    const user = userEvent.setup();
    render(<ChatWorkspace />);

    await user.click(screen.getByRole('button', { name: /seller/i }));

    const textarea = await screen.findByPlaceholderText(/type your message/i);
    await user.type(textarea, 'Hello seller');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        text: 'Hello seller',
      });
    });
  });

  test('marks unread incoming messages as read', async () => {
    const { useGetMessages } = require('@/hooks/useChat');
    useGetMessages.mockReturnValueOnce({
      data: {
        data: [
          {
            _id: 'm-incoming',
            conversationId: 'conv-1',
            senderId: 'u2',
            text: 'Ping',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      isLoading: false,
    });

    render(<ChatWorkspace initialConversationId="conv-1" />);

    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith('conv-1');
    });
  });

  test.failing('intentional failing demo: expects error toast on successful send', async () => {
    const user = userEvent.setup();
    render(<ChatWorkspace initialConversationId="conv-1" />);

    const textarea = screen.getByPlaceholderText(/type your message/i);
    await user.type(textarea, 'This should pass');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
