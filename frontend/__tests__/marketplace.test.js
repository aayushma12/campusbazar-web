import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from '@/app/(public)/products/page';
import toast from 'react-hot-toast';

const pushMock = jest.fn();
const toggleWishlistMock = jest.fn();

const productSample = {
  id: 'p1',
  title: 'Linear Algebra Book',
  price: 1000,
  quantity: 3,
  status: 'available',
  condition: 'used',
  category: { name: 'Books' },
  campus: 'Kirtipur',
  images: [],
  negotiable: false,
  ownerId: 'owner-2',
  seller: { id: 'owner-2', name: 'Seller User' },
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: jest.fn(() => null), toString: () => '' }),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false }),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/products/ProductCard', () => ({
  __esModule: true,
  default: ({ product }) => <div>{product.title}</div>,
}));

jest.mock('@/components/ui/Skeleton', () => ({
  ProductCardSkeleton: () => <div data-testid="product-skeleton">loading</div>,
}));

jest.mock('@/hooks/useProducts', () => ({
  useGetProducts: jest.fn(() => ({
    data: { pages: [{ data: [productSample], pagination: { total: 1, totalPages: 1, page: 1 } }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
  })),
  useWishlist: jest.fn(() => ({ data: { data: [] } })),
  useToggleWishlist: jest.fn(() => ({ mutate: toggleWishlistMock })),
  useCategories: jest.fn(() => ({ data: { data: [] } })),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: { id: 'user-1' } })),
}));

describe('marketplace and product card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders product results from marketplace data', () => {
    render(<ProductsPage />);
    expect(screen.getByText(/linear algebra book/i)).toBeInTheDocument();
    expect(screen.getByText(/showing 1 of 1 results/i)).toBeInTheDocument();
  });

  test('shows loading skeleton state', () => {
    const { useGetProducts } = require('@/hooks/useProducts');
    useGetProducts.mockReturnValueOnce({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
      isError: false,
    });

    render(<ProductsPage />);
    expect(screen.getAllByTestId('product-skeleton').length).toBeGreaterThan(0);
  });

  test('shows empty state when no products exist', () => {
    const { useGetProducts } = require('@/hooks/useProducts');
    useGetProducts.mockReturnValueOnce({
      data: { pages: [{ data: [], pagination: { total: 0, totalPages: 1, page: 1 } }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
    });

    render(<ProductsPage />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  test('search input interaction updates typed value', async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);

    const input = screen.getByPlaceholderText(/search for textbooks/i);
    await user.type(input, 'book');
    expect(input).toHaveValue('book');
  });

  test.failing('intentional failing demo: expects wishlist auth error while authenticated', async () => {
    const { useAuth } = require('@/hooks/useAuth');
    useAuth.mockReturnValueOnce({ isAuthenticated: true, user: { id: 'user-1' } });

    render(<ProductsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/please log in/i));
    });
  });
});
