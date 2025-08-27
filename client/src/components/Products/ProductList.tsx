import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import Loading from '../UI/Loading';
import './ProductList.css';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  description?: string;
  createdAt: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({
        search: searchTerm,
        category: categoryFilter,
        limit: 50
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="product-list">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <span className="icon">➕</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-outline" onClick={handleSearch}>
            <span className="icon">🔍</span>
          </button>
        </div>

        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setTimeout(fetchProducts, 100);
          }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <span className="icon">📦</span>
          </div>
          <h3>No products found</h3>
          <p>Get started by adding your first product</p>
          <Link to="/products/new" className="btn btn-primary">Add Product</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-actions">
                  <Link 
                    to={`/products/${product.id}/edit`} 
                    className="btn btn-sm btn-outline"
                    title="Edit Product"
                  >
                    <span className="icon">✏️</span>
                    <span className="btn-text">Edit</span>
                  </Link>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(product.id)}
                    title="Delete Product"
                  >
                    <span className="icon">🗑️</span>
                    <span className="btn-text">Delete</span>
                  </button>
                </div>
              </div>

              <div className="product-info">
                <div className="product-category">
                  <span className="badge badge-secondary">{product.category}</span>
                </div>
                
                {product.sku && (
                  <div className="product-sku">
                    <small>SKU: {product.sku}</small>
                  </div>
                )}

                <div className="product-price">
                  <span className="price">{formatCurrency(product.price)}</span>
                </div>

                <div className="product-stock">
                  <span className={`stock ${product.stock <= 10 ? 'low' : 'good'}`}>
                    Stock: {product.stock}
                  </span>
                </div>

                {product.description && (
                  <div className="product-description">
                    <p>{product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
