import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Invoice } from '../../types';
import { format } from 'date-fns';
import './InvoiceDetail.css';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInvoice(invoiceId);
      setInvoice(response.invoice);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoicePDF = async () => {
    if (!invoice) return;
    
    try {
      const response = await apiService.downloadInvoicePDF(invoice.id);
      
      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const printInvoice = () => {
    window.print();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy');
  };

  if (loading) {
    return (
      <div className="invoice-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-detail">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Invoice</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
              Back to Invoices
            </button>
            {id && (
              <button className="btn btn-outline" onClick={() => loadInvoice(id)}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-detail">
        <div className="error-container">
          <div className="error-icon">📄</div>
          <h3>Invoice Not Found</h3>
          <p>The requested invoice could not be found.</p>
          <Link to="/invoices" className="btn btn-primary">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail">
      {/* Header Actions */}
      <div className="detail-header no-print">
        <div className="header-left">
          <Link to="/invoices" className="btn btn-outline">
            <span className="icon">←</span>
            Back to Invoices
          </Link>
        </div>
        <div className="header-right">
          <button className="btn btn-outline" onClick={printInvoice}>
            <span className="icon">🖨️</span>
            Print
          </button>
          <button className="btn btn-primary" onClick={downloadInvoicePDF}>
            <span className="icon">📄</span>
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-container">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="shop-info">
            {invoice.shopDetails.logo && (
              <img 
                src={invoice.shopDetails.logo} 
                alt={invoice.shopDetails.name}
                className="shop-logo"
              />
            )}
            <div className="shop-details">
              <h1 className="shop-name">{invoice.shopDetails.name}</h1>
              <p className="shop-address">{invoice.shopDetails.address}</p>
              <p className="shop-contact">📞 {invoice.shopDetails.phone}</p>
              {invoice.shopDetails.email && (
                <p className="shop-contact">✉️ {invoice.shopDetails.email}</p>
              )}
              {invoice.shopDetails.gst && (
                <p className="shop-gst">GST: {invoice.shopDetails.gst}</p>
              )}
            </div>
          </div>

          <div className="invoice-meta">
            <h2 className="invoice-title">INVOICE</h2>
            <div className="invoice-number">{invoice.invoiceNumber}</div>
            {getStatusBadge(invoice.status)}
            <div className="invoice-date">
              <strong>Date:</strong> {formatDate(invoice.createdAt)}
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="bill-to-section">
          <h3>Bill To:</h3>
          <div className="customer-details">
            <h4>{invoice.customerDetails.name}</h4>
            {invoice.customerDetails.address && (
              <p>{invoice.customerDetails.address}</p>
            )}
            {invoice.customerDetails.phone && (
              <p>📞 {invoice.customerDetails.phone}</p>
            )}
            {invoice.customerDetails.email && (
              <p>✉️ {invoice.customerDetails.email}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="item-name">{item.name}</td>
                  <td className="item-qty">{item.quantity}</td>
                  <td className="item-price">{formatCurrency(item.price)}</td>
                  <td className="item-discount">
                    {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                  </td>
                  <td className="item-total">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            
            {invoice.discount > 0 && (
              <div className="summary-row">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Tax ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            
            <div className="summary-row total-row">
              <span>Total Amount:</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="payment-section">
          <div className="payment-info">
            <h4>Payment Information</h4>
            <p>
              <strong>Method:</strong> {invoice.paymentMethod.replace('_', ' ').toUpperCase()}
            </p>
            <p>
              <strong>Status:</strong> {getStatusBadge(invoice.status)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="notes-section">
            <h4>Notes:</h4>
            <p>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          <p className="thank-you">Thank you for your business!</p>
          <p className="footer-note">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
