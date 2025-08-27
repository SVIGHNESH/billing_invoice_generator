import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks';
import { validateEmail, validatePhone, getErrorMessage } from '../../utils/helpers';
import Loading from '../../components/UI/Loading';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  shopGst: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    values,
    errors,
    setValue,
    validate,
  } = useForm<RegisterFormData>(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      shopName: '',
      shopAddress: '',
      shopPhone: '',
      shopEmail: '',
      shopGst: '',
    },
    {
      username: (value: string) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return null;
      },
      email: (value: string) => {
        if (!value) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email';
        return null;
      },
      password: (value: string) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value: string) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
      shopName: (value: string) => {
        if (!value) return 'Shop name is required';
        if (value.length < 2) return 'Shop name must be at least 2 characters';
        return null;
      },
      shopAddress: (value: string) => {
        if (!value) return 'Shop address is required';
        if (value.length < 5) return 'Shop address must be at least 5 characters';
        return null;
      },
      shopPhone: (value: string) => {
        if (!value) return 'Shop phone is required';
        if (!validatePhone(value)) return 'Please enter a valid phone number';
        return null;
      },
      shopEmail: (value: string) => {
        if (value && !validateEmail(value)) return 'Please enter a valid email';
        return null;
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        shop: {
          name: values.shopName,
          address: values.shopAddress,
          phone: values.shopPhone,
          email: values.shopEmail || undefined,
          gst: values.shopGst || undefined,
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(field, e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title text-2xl mb-2">Create Your Account</h1>
            <p className="text-secondary">Set up your shop and start invoicing</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-light border border-error rounded-md">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label required">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={values.username}
                      onChange={handleInputChange('username')}
                      className={`form-input ${errors.username ? 'error' : ''}`}
                      placeholder="Enter username"
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <span className="form-error">{errors.username}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label required">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={values.email}
                      onChange={handleInputChange('email')}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter email"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <span className="form-error">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label required">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={values.password}
                      onChange={handleInputChange('password')}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Enter password"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <span className="form-error">{errors.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label required">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <span className="form-error">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Shop Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="shopName" className="form-label required">
                      Shop Name
                    </label>
                    <input
                      id="shopName"
                      type="text"
                      value={values.shopName}
                      onChange={handleInputChange('shopName')}
                      className={`form-input ${errors.shopName ? 'error' : ''}`}
                      placeholder="Enter shop name"
                      disabled={isLoading}
                    />
                    {errors.shopName && (
                      <span className="form-error">{errors.shopName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopPhone" className="form-label required">
                      Shop Phone
                    </label>
                    <input
                      id="shopPhone"
                      type="tel"
                      value={values.shopPhone}
                      onChange={handleInputChange('shopPhone')}
                      className={`form-input ${errors.shopPhone ? 'error' : ''}`}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                    {errors.shopPhone && (
                      <span className="form-error">{errors.shopPhone}</span>
                    )}
                  </div>

                  <div className="form-group md:col-span-2">
                    <label htmlFor="shopAddress" className="form-label required">
                      Shop Address
                    </label>
                    <textarea
                      id="shopAddress"
                      value={values.shopAddress}
                      onChange={handleInputChange('shopAddress')}
                      className={`form-input form-textarea ${errors.shopAddress ? 'error' : ''}`}
                      placeholder="Enter shop address"
                      disabled={isLoading}
                      rows={3}
                    />
                    {errors.shopAddress && (
                      <span className="form-error">{errors.shopAddress}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopEmail" className="form-label">
                      Shop Email (Optional)
                    </label>
                    <input
                      id="shopEmail"
                      type="email"
                      value={values.shopEmail}
                      onChange={handleInputChange('shopEmail')}
                      className={`form-input ${errors.shopEmail ? 'error' : ''}`}
                      placeholder="Enter shop email"
                      disabled={isLoading}
                    />
                    {errors.shopEmail && (
                      <span className="form-error">{errors.shopEmail}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="shopGst" className="form-label">
                      GST Number (Optional)
                    </label>
                    <input
                      id="shopGst"
                      type="text"
                      value={values.shopGst}
                      onChange={handleInputChange('shopGst')}
                      className="form-input"
                      placeholder="Enter GST number"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-full btn-lg"
              >
                {isLoading ? <Loading size="sm" text="" /> : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="card-footer justify-center">
            <p className="text-sm text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
