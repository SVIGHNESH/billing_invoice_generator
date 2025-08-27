import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import Loading from '../UI/Loading';
import './ShopSettings.css';

interface ShopFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  logo: string;
}

const ShopSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    gst: '',
    logo: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    const loadShopDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.getShop();
        const shop = response.shop;
        
        setFormData({
          name: shop.name || '',
          address: shop.address || '',
          phone: shop.phone || '',
          email: shop.email || '',
          gst: shop.gst || '',
          logo: shop.logo || ''
        });
        
        if (shop.logo) {
          setLogoPreview(shop.logo);
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
        // If shop doesn't exist, use user's shop data as fallback
        if (user?.shop) {
          const shop = user.shop;
          setFormData({
            name: shop.name || '',
            address: shop.address || '',
            phone: shop.phone || '',
            email: shop.email || '',
            gst: shop.gst || '',
            logo: shop.logo || ''
          });
          if (shop.logo) {
            setLogoPreview(shop.logo);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadShopDetails();
  }, [user]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShop();
      const shop = response.shop;
      
      setFormData({
        name: shop.name || '',
        address: shop.address || '',
        phone: shop.phone || '',
        email: shop.email || '',
        gst: shop.gst || '',
        logo: shop.logo || ''
      });
      
      if (shop.logo) {
        setLogoPreview(shop.logo);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      // If shop doesn't exist, use user's shop data as fallback
      if (user?.shop) {
        const shop = user.shop;
        setFormData({
          name: shop.name || '',
          address: shop.address || '',
          phone: shop.phone || '',
          email: shop.email || '',
          gst: shop.gst || '',
          logo: shop.logo || ''
        });
        if (shop.logo) {
          setLogoPreview(shop.logo);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size should be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          logo: base64String
        }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: ''
    }));
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Shop name is required');
      return;
    }

    if (!formData.address.trim()) {
      alert('Shop address is required');
      return;
    }

    if (!formData.phone.trim()) {
      alert('Phone number is required');
      return;
    }

    try {
      setSubmitLoading(true);
      
      const submitData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        gst: formData.gst.trim() || undefined,
        logo: formData.logo || undefined
      };

      const response = await apiService.updateShop(submitData);
      
      // Update user context with new shop data
      if (user) {
        await updateUser({
          ...user,
          shop: response.shop
        });
      }
      
      alert('Shop details updated successfully!');
    } catch (error: any) {
      console.error('Error updating shop details:', error);
      alert(error.response?.data?.message || 'Failed to update shop details');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="shop-settings">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shop Settings</h1>
          <p className="page-subtitle">Manage your shop information and branding</p>
        </div>
      </div>

      <div className="settings-container">
        <form onSubmit={handleSubmit} className="shop-form">
          {/* Logo Section */}
          <div className="form-section">
            <h2 className="section-title">Shop Logo</h2>
            <div className="logo-section">
              <div className="logo-upload">
                {logoPreview ? (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Shop Logo" className="logo-image" />
                    <div className="logo-actions">
                      <label htmlFor="logo-input" className="btn btn-outline btn-sm">
                        <i className="icon-edit"></i>
                        Change
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={removeLogo}
                      >
                        <i className="icon-trash"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="logo-placeholder">
                    <i className="icon-image"></i>
                    <p>No logo uploaded</p>
                    <label htmlFor="logo-input" className="btn btn-outline">
                      <i className="icon-upload"></i>
                      Upload Logo
                    </label>
                  </div>
                )}
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="logo-input"
                />
              </div>
              <div className="logo-info">
                <h4>Logo Guidelines</h4>
                <ul>
                  <li>Recommended size: 200x200 pixels</li>
                  <li>Maximum file size: 2MB</li>
                  <li>Supported formats: JPG, PNG, GIF</li>
                  <li>Square aspect ratio works best</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your shop name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label required">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gst" className="form-label">
                  GST Number
                </label>
                <input
                  type="text"
                  id="gst"
                  name="gst"
                  className="form-input"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label required">
                Shop Address
              </label>
              <textarea
                id="address"
                name="address"
                className="form-textarea"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete shop address"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Current Shop Info Preview */}
          <div className="form-section">
            <h2 className="section-title">Preview</h2>
            <div className="shop-preview">
              <div className="preview-header">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="preview-logo" />
                )}
                <div className="preview-info">
                  <h3>{formData.name || 'Shop Name'}</h3>
                  <p>{formData.address || 'Shop Address'}</p>
                  <p>{formData.phone || 'Phone Number'}</p>
                  {formData.email && <p>{formData.email}</p>}
                  {formData.gst && <p>GST: {formData.gst}</p>}
                </div>
              </div>
              <small className="preview-note">
                This is how your shop information will appear on invoices
              </small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchShopDetails}
              disabled={submitLoading}
            >
              <i className="icon-refresh"></i>
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <i className="icon-loading spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="icon-save"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
