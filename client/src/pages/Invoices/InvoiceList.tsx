import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Invoice, InvoiceFilters } from '../../types';
import { format } from 'date-fns';
import './InvoiceList.css';

interface InvoiceListState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const InvoiceList: React.FC = () => {
  const [state, setState] = useState<InvoiceListState>({
    invoices: [],
    loading: true,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });

  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.getInvoices(filters);
      
      setState(prev => ({
        ...prev,
        invoices: response.invoices,
        pagination: response.pagination,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error?.response?.data?.message || 'Failed to load invoices',
        loading: false
      }));
    }
  };

  const handleFilterChange = (key: keyof InvoiceFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value) || 1) // Reset to page 1 when other filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusClasses = {
      draft: 'badge-secondary',
      sent: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-error'
    };

    return (
      <span className={`badge ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: Invoice['paymentMethod']) => {
    const icons = {
      cash: '💵',
      card: '💳',
      upi: '📱',
      bank_transfer: '🏦',
      check: '📄'
    };
    return icons[method] || '💰';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy');
  };

  const downloadInvoicePDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await apiService.downloadInvoicePDF(invoiceId);
      
      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  if (state.loading && state.invoices.length === 0) {
    return (
      <div className="invoice-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Invoices</h1>
            <p className="page-subtitle">Manage your business invoices</p>
          </div>
          <Link to="/billing" className="btn btn-primary">
            <span className="icon">📄</span>
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="icon">🔍</span>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {(filters.search || filters.status || filters.startDate || filters.endDate) && (
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-content">
            <div className="filter-grid">
              <div className="form-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by invoice number or customer..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-control"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="alert alert-error">
          <span className="icon">⚠️</span>
          {state.error}
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {state.invoices.length} of {state.pagination.total} invoices
          {filters.search && ` for "${filters.search}"`}
          {filters.status && ` with status "${filters.status}"`}
        </p>
      </div>

      {/* Invoices Grid */}
      {state.invoices.length > 0 ? (
        <>
          <div className="invoices-grid">
            {state.invoices.map((invoice) => (
              <div key={invoice.id} className="invoice-card">
                <div className="invoice-header">
                  <div className="invoice-number">
                    <strong>{invoice.invoiceNumber}</strong>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="invoice-date">
                    {formatDate(invoice.createdAt)}
                  </div>
                </div>

                <div className="invoice-customer">
                  <h4>{invoice.customerDetails.name}</h4>
                  {invoice.customerDetails.phone && (
                    <p className="text-secondary">{invoice.customerDetails.phone}</p>
                  )}
                </div>

                <div className="invoice-details">
                  <div className="detail-row">
                    <span>Items:</span>
                    <span>{invoice.items.length}</span>
                  </div>
                  <div className="detail-row">
                    <span>Payment:</span>
                    <span>
                      {getPaymentMethodIcon(invoice.paymentMethod)}
                      {invoice.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row total-amount">
                    <span>Total:</span>
                    <span className="amount">{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                </div>

                <div className="invoice-actions">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </Link>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadInvoicePDF(invoice.id, invoice.invoiceNumber)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {state.pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={state.pagination.page === 1}
                onClick={() => handleFilterChange('page', state.pagination.page - 1)}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {state.pagination.page} of {state.pagination.totalPages}
              </div>
              
              <button
                className="btn btn-outline"
                disabled={state.pagination.page === state.pagination.totalPages}
                onClick={() => handleFilterChange('page', state.pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No invoices found</h3>
          <p>
            {filters.search || filters.status || filters.startDate || filters.endDate
              ? 'Try adjusting your search filters'
              : "You haven't created any invoices yet"}
          </p>
          <Link to="/billing" className="btn btn-primary">
            Create First Invoice
          </Link>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {state.loading && state.invoices.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
