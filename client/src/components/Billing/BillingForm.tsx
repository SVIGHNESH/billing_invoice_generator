import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import './BillingForm.css';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  email: string;
}

const BillingForm: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const [taxRate, setTaxRate] = useState<number>(18);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'bank_transfer' | 'check'>('cash');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      setProducts(response.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    const existingItemIndex = items.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        alert(`Only ${product.stock} items available in stock`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        total: newQuantity * product.price
      };
      setItems(updatedItems);
    } else {
      const newItem: InvoiceItem = {
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
        discount: 0,
        total: quantity * product.price
      };
      setItems([...items, newItem]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemDiscount = (index: number, discount: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const discountAmount = (item.price * item.quantity * discount) / 100;
    updatedItems[index] = {
      ...item,
      discount,
      total: (item.price * item.quantity) - discountAmount
    };
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    return ((subtotal - discountAmount) * taxRate) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = calculateTaxAmount();
    return subtotal - discountAmount + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!customerDetails.name.trim()) {
      alert('Please enter customer name');
      return;
    }

    try {
      setLoading(true);

      const invoiceData = {
        customerDetails,
        items,
        subtotal: calculateSubtotal(),
        taxRate,
        taxAmount: calculateTaxAmount(),
        discount,
        grandTotal: calculateGrandTotal(),
        paymentMethod,
        notes: notes.trim() || undefined,
        status: 'paid' as const
      };

      const response = await apiService.createInvoice(invoiceData);
      alert('Invoice created successfully!');
      navigate(`/invoices/${response.invoice.id}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      
      // Handle specific stock validation errors
      if (error.response?.data?.error === 'Insufficient stock') {
        const stockErrors = error.response.data.insufficientStock;
        let errorMessage = 'Insufficient stock for the following items:\n\n';
        
        stockErrors.forEach((item: any) => {
          errorMessage += `• ${item.productName}: Requested ${item.requestedQuantity}, Available ${item.availableStock}\n`;
        });
        
        errorMessage += '\nPlease adjust quantities or check your inventory.';
        alert(errorMessage);
      } else {
        alert(error.response?.data?.message || 'Failed to create invoice');
      }
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

  return (
    <div className="billing-form">
      <div className="page-header">
        <h1 className="page-title">Create Invoice</h1>
        <p className="page-subtitle">Generate a new invoice for your customer</p>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Customer Details */}
        <div className="form-section">
          <h2 className="section-title">Customer Details</h2>
          <div className="customer-grid">
            <div className="form-group">
              <label className="form-label required">Customer Name</label>
              <input
                type="text"
                className="form-input"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="form-textarea"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter customer address"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="form-section">
          <h2 className="section-title">Add Items</h2>
          <div className="add-item-form">
            <select
              className="form-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)} (Stock: {product.stock})
                </option>
              ))}
            </select>
            <input
              type="number"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              placeholder="Qty"
            />
            <button type="button" className="btn btn-primary" onClick={addItem}>
              Add Item
            </button>
          </div>
        </div>

        {/* Invoice Items */}
        {items.length > 0 && (
          <div className="form-section">
            <h2 className="section-title">Invoice Items</h2>
            <div className="items-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Discount (%)</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <input
                          type="number"
                          className="form-input-sm"
                          value={item.discount}
                          onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </td>
                      <td className="font-medium">{formatCurrency(item.total)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        {items.length > 0 && (
          <div className="form-section">
            <h2 className="section-title">Invoice Summary</h2>
            <div className="summary-grid">
              <div className="summary-controls">
                <div className="form-group">
                  <label className="form-label">Overall Discount (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'check')}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="total-row">
                  <span>Discount ({discount}%):</span>
                  <span>-{formatCurrency((calculateSubtotal() * discount) / 100)}</span>
                </div>
                <div className="total-row">
                  <span>Tax ({taxRate}%):</span>
                  <span>{formatCurrency(calculateTaxAmount())}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/invoices')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || items.length === 0}
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;
