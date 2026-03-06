import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyProductsPage from '@/app/dashboard/my-products/page';

const pushMock = jest.fn();
const deleteMutateMock = jest.fn();
const statusMutateMock = jest.fn();
const updateMock = jest.fn();
const toastLoading = jest.fn(() => 'toast-id');
const toastSuccess = jest.fn();
const toastError = jest.fn();
const invalidateMock = jest.fn();

const listingsPayload = {
  data: [
    {
      id: 'prod-1',
      title: 'Physics Guide',
      description: 'Semester prep book',
      status: 'available',
      price: 800,
      quantity: 2,
      images: [],
      categoryId: { name: 'Books' },
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  pagination: { page: 1, totalPages: 1 },
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector) => selector({ isAuthenticated: true }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: invalidateMock }),
}));

jest.mock('@/hooks/useProducts', () => ({
  PRODUCT_KEYS: {
    detail: (id) => ['products', 'detail', id],
    lists: () => ['products', 'list'],
    myListings: () => ['products', 'my-listings'],
  },
  useGetMyListings: () => ({ data: listingsPayload, isLoading: false, isError: false }),
  useDeleteProduct: () => ({ mutateAsync: deleteMutateMock, isPending: false }),
  useChangeProductStatus: () => ({ mutateAsync: statusMutateMock, isPending: false }),
}));

jest.mock('@/lib/productApi', () => ({
  productApi: {
    update: (...args) => updateMock(...args),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    loading: (...args) => toastLoading(...args),
    success: (...args) => toastSuccess(...args),
    error: (...args) => toastError(...args),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img alt={props.alt} src={props.src} />,
}));

describe('my products page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test('renders listing cards with stock and actions', () => {
    render(<MyProductsPage />);

    expect(screen.getByText(/my products/i)).toBeInTheDocument();
    expect(screen.getByText(/physics guide/i)).toBeInTheDocument();
    expect(screen.getByText(/stock:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('filters listings using search input', async () => {
    const user = userEvent.setup();
    render(<MyProductsPage />);

    const search = screen.getByPlaceholderText(/search your products/i);
    await user.type(search, 'physics');

    expect(screen.getByText(/physics guide/i)).toBeInTheDocument();
  });

  test('deletes product after confirmation', async () => {
    const user = userEvent.setup();
    deleteMutateMock.mockResolvedValueOnce({ success: true });

    render(<MyProductsPage />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(deleteMutateMock).toHaveBeenCalledWith('prod-1');
      expect(toastSuccess).toHaveBeenCalled();
    });
  });

  test('updates stock quantity with save action', async () => {
    const user = userEvent.setup();
    updateMock.mockResolvedValueOnce({ success: true });

    render(<MyProductsPage />);

    const stockInput = screen.getByDisplayValue('2');
    await user.clear(stockInput);
    await user.type(stockInput, '7');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith('prod-1', expect.any(FormData));
      expect(toastSuccess).toHaveBeenCalledWith('Stock updated', { id: 'toast-id' });
    });
  });

  test('changes availability status from dropdown', async () => {
    const user = userEvent.setup();
    statusMutateMock.mockResolvedValueOnce({ success: true });

    render(<MyProductsPage />);

    await user.selectOptions(screen.getByDisplayValue(/available/i), 'sold');

    await waitFor(() => {
      expect(statusMutateMock).toHaveBeenCalledWith({ id: 'prod-1', status: 'sold' });
    });
  });
});
