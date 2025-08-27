export interface User {
  id: string;
  username: string;
  email: string;
  shop: Shop;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  gst?: string;
  logo?: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface CustomerDetails {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  shopDetails: Shop;
  customerDetails: CustomerDetails;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'check';
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  draft: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  category?: string;
}

export interface InvoiceFilters extends PaginationParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FormErrors {
  [key: string]: string;
}

export interface LoadingState {
  [key: string]: boolean;
}
