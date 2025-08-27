import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import Loading from '../UI/Loading';
import './ProductForm.css';

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  sku: string;
  description: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [isEdit, id]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getProduct(productId);
      const product = response.product;
      
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        sku: product.sku || '',
        description: product.description || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.category.trim() || !formData.price || !formData.stock) {
      alert('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }

    try {
      setSubmitLoading(true);
      
      const submitData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        sku: formData.sku.trim() || undefined,
        description: formData.description.trim() || undefined
      };

      if (isEdit && id) {
        await apiService.updateProduct(id, submitData);
        alert('Product updated successfully!');
      } else {
        await apiService.createProduct(submitData);
        alert('Product created successfully!');
      }
      
      navigate('/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="product-form">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update product information' : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="product-form-content">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label required">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                list="categories"
                required
              />
              <datalist id="categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label required">
                Price (₹)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label required">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                className="form-input"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku" className="form-label">
                SKU (Optional)
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                className="form-input"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Enter SKU"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/products')}
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <i className="icon-loading spin"></i>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={isEdit ? 'icon-save' : 'icon-plus'}></i>
                  {isEdit ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
