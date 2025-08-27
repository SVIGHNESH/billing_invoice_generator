import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import Loading from '../UI/Loading';
import './Dashboard.css';

interface DashboardStats {
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
}

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerDetails: {
    name: string;
  };
  grandTotal: number;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, invoicesRes, statsRes] = await Promise.all([
        apiService.getProducts({ limit: 1 }),
        apiService.getInvoices({ limit: 5 }),
        apiService.getInvoiceStats()
      ]);

      setStats({
        totalProducts: productsRes.pagination.total,
        totalInvoices: statsRes.stats.total,
        totalRevenue: statsRes.stats.paidAmount,
        pendingInvoices: statsRes.stats.pending
      });

      setRecentInvoices(invoicesRes.invoices);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'warning';
      case 'draft': return 'secondary';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-package"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-file-text"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalInvoices}</h3>
            <p>Total Invoices</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="icon-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingInvoices}</h3>
            <p>Pending Invoices</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="recent-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Invoices</h2>
            <a href="/invoices" className="btn btn-outline btn-sm">View All</a>
          </div>
          <div className="card-body">
            {recentInvoices.length === 0 ? (
              <div className="empty-state">
                <p>No invoices found. <a href="/billing">Create your first invoice</a></p>
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
                        <td className="font-medium">{invoice.invoiceNumber}</td>
                        <td>{invoice.customerDetails.name}</td>
                        <td className="font-medium">{formatCurrency(invoice.grandTotal)}</td>
                        <td>
                          <span className={`badge badge-${getStatusColor(invoice.status)}`}>
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

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="action-grid">
              <a href="/billing" className="action-card">
                <i className="icon-plus"></i>
                <span>Create Invoice</span>
              </a>
              <a href="/products/new" className="action-card">
                <i className="icon-package"></i>
                <span>Add Product</span>
              </a>
              <a href="/invoices" className="action-card">
                <i className="icon-file-text"></i>
                <span>View Invoices</span>
              </a>
              <a href="/products" className="action-card">
                <i className="icon-list"></i>
                <span>Manage Products</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
