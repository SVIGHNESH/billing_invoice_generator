import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Product, 
  Invoice, 
  InvoiceStats, 
  AuthResponse, 
  ProductFilters, 
  InvoiceFilters,
  Shop
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    // Request interceptor to add auth token and handle tunnel requests
    this.api.interceptors.request.use(
      (config) => {
        // Ensure proper headers for tunnel requests
        if (config.baseURL?.includes('devtunnels.ms')) {
          config.headers['X-Forwarded-Proto'] = 'https';
        }
        
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: {
    username: string;
    email: string;
    password: string;
    shop: Omit<Shop, 'id'>;
  }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    const response: AxiosResponse<{ user: User; message: string }> = await this.api.put('/auth/profile', userData);
    return response.data;
  }

  // Product endpoints
  async getProducts(filters?: ProductFilters): Promise<{
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get(`/products?${params.toString()}`);
    return response.data;
  }

  async getProduct(id: string): Promise<{ product: Product }> {
    const response: AxiosResponse<{ product: Product }> = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{
    product: Product;
    message: string;
  }> {
    const response = await this.api.post('/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<{
    product: Product;
    message: string;
  }> {
    const response = await this.api.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  async getCategories(): Promise<{ categories: string[] }> {
    const response: AxiosResponse<{ categories: string[] }> = await this.api.get('/products/categories');
    return response.data;
  }

  // Invoice endpoints
  async getInvoices(filters?: InvoiceFilters): Promise<{
    invoices: Invoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await this.api.get(`/invoices?${params.toString()}`);
    return response.data;
  }

  async getInvoice(id: string): Promise<{ invoice: Invoice }> {
    const response: AxiosResponse<{ invoice: Invoice }> = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'userId' | 'shopDetails' | 'createdAt' | 'updatedAt'>): Promise<{
    invoice: Invoice;
    message: string;
  }> {
    const response = await this.api.post('/invoices', invoiceData);
    return response.data;
  }

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<{
    invoice: Invoice;
    message: string;
  }> {
    const response = await this.api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/invoices/${id}`);
    return response.data;
  }

  async getInvoiceStats(): Promise<{ stats: InvoiceStats }> {
    const response: AxiosResponse<{ stats: InvoiceStats }> = await this.api.get('/invoices/stats');
    return response.data;
  }

  async downloadInvoicePDF(id: string): Promise<Blob> {
    const response = await this.api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Shop endpoints
  async getShop(): Promise<{ shop: Shop }> {
    const response: AxiosResponse<{ shop: Shop }> = await this.api.get('/shop');
    return response.data;
  }

  async updateShop(shopData: Partial<Shop>): Promise<{
    shop: Shop;
    message: string;
  }> {
    const response = await this.api.put('/shop', shopData);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
