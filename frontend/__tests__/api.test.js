import { productApi } from '@/lib/productApi';
import { chatApi } from '@/lib/chatApi';
import { createTutorRequest, acceptTutorRequest } from '@/lib/tutorApi';
import { esewaApi } from '@/lib/esewaApi';
import { notificationApi } from '@/lib/notificationApi';
import api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('api module tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('productApi.getAll builds query and returns normalized products', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'p1',
            title: 'Notebook',
            price: 50,
            quantity: 5,
            campus: 'Kirtipur',
            condition: 'good',
            status: 'available',
            images: [],
            ownerId: { id: 'u1', name: 'Seller', role: 'user' },
          },
        ],
        pagination: { total: 1, page: 1, limit: 12, totalPages: 1 },
      },
    });

    const result = await productApi.getAll({ search: 'note', page: 1, limit: 12 });

    expect(api.get).toHaveBeenCalledWith('/products?search=note&page=1&limit=12');
    expect(result.data[0].id).toBe('p1');
  });

  test('chatApi.getMessages uses fallback endpoint on 404', async () => {
    api.get
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              _id: 'm1',
              conversationId: 'c1',
              senderId: 'u1',
              text: 'hello',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      });

    const result = await chatApi.getMessages('c1');

    expect(api.get).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenLastCalledWith('/chat/messages/c1?page=1');
    expect(result.data[0]._id).toBe('m1');
  });

  test('chatApi.sendMessage retries alternative contract after 400', async () => {
    api.post
      .mockRejectedValueOnce({ response: { status: 400 } })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            _id: 'm2',
            conversationId: 'c1',
            senderId: 'u1',
            text: 'Hi there',
            read: false,
            createdAt: new Date().toISOString(),
          },
        },
      });

    const result = await chatApi.sendMessage('c1', 'Hi there');

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(result.data.text).toBe('Hi there');
  });

  test('tutor and payment APIs call expected endpoints', async () => {
    api.post
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } });

    await createTutorRequest({
      subject: 'Math',
      topic: 'Algebra',
      description: 'Need help',
      preferredTime: 'Today',
    });
    await acceptTutorRequest('req-22');
    await esewaApi.init('prod-9');

    expect(api.post).toHaveBeenNthCalledWith(1, '/tutor/request', expect.any(Object));
    expect(api.post).toHaveBeenNthCalledWith(2, '/tutor/accept/req-22');
    expect(api.post).toHaveBeenNthCalledWith(3, '/payment/init', { productId: 'prod-9' });
  });

  test('notificationApi.list normalizes unread count and records', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          unreadCount: 3,
          notifications: [
            {
              _id: 'n-1',
              userId: 'u1',
              title: 'New message',
              message: 'You got one',
              type: 'new_message',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        },
      },
    });

    const result = await notificationApi.list();

    expect(api.get).toHaveBeenCalledWith('/notifications', { params: { page: 1, limit: 20 } });
    expect(result.data.unreadCount).toBe(3);
    expect(result.data.notifications[0].id).toBe('n-1');
  });
});
