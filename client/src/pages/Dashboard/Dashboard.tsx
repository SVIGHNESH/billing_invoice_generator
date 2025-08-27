import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import Loading from '../../components/UI/Loading';
import { useAuth } from '../../context/AuthContext';
import { InvoiceStats, Invoice } from '../../types';
import apiService from '../../services/api';
import { formatCurrency, formatDate, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, invoicesResponse] = await Promise.all([
          apiService.getInvoiceStats(),
          apiService.getInvoices({ limit: 5 })
        ]);
        
        setStats(statsResponse.stats);
        setRecentInvoices(invoicesResponse.invoices);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Loading center size="lg" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="container">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <p className="text-error mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.username}!</h1>
          <p className="page-subtitle">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Total Invoices</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Paid Invoices</p>
                  <p className="text-2xl font-bold text-success">{stats?.paid || 0}</p>
                </div>
                <div className="p-3 bg-success-light rounded-lg">
                  <svg
                    className="w-6 h-6 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats?.pending || 0}</p>
                </div>
                <div className="p-3 bg-warning-light rounded-lg">
                  <svg
                    className="w-6 h-6 text-warning"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(stats?.totalAmount || 0)}
                  </p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="p-4 bg-primary-50 rounded-lg inline-block mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Invoice</h3>
              <p className="text-secondary mb-4">Generate a new invoice for your customers</p>
              <Link to="/invoices/create" className="btn btn-primary">
                Create Invoice
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="p-4 bg-primary-50 rounded-lg inline-block mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Product</h3>
              <p className="text-secondary mb-4">Add new products to your inventory</p>
              <Link to="/products/create" className="btn btn-primary">
                Add Product
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="p-4 bg-primary-50 rounded-lg inline-block mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Shop Settings</h3>
              <p className="text-secondary mb-4">Update your shop information and preferences</p>
              <Link to="/shop" className="btn btn-primary">
                Manage Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Recent Invoices</h2>
              <Link to="/invoices" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body p-0">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-secondary">No invoices yet. Create your first invoice to get started!</p>
                <Link to="/invoices/create" className="btn btn-primary mt-4">
                  Create Invoice
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <Link 
                            to={`/invoices/${invoice.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td>{invoice.customerDetails.name}</td>
                        <td className="font-medium">
                          {formatCurrency(invoice.grandTotal)}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(invoice.status)}>
                            {invoice.status}
                          </span>
                        </td>
                        <td>{formatDate(invoice.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
