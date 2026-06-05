import React, { useState, useEffect } from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { getProducts, getCustomers } from '../../api/api';

export default function OrderForm({ onSubmit, onCancel, loading }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch all customers and products for dropdowns
    getCustomers(1, 1000).then((res) => setCustomers(res.data.items)).catch(() => {});
    getProducts(1, 1000).then((res) => setProducts(res.data.items)).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!customerId) errs.customer = 'Please select a customer';
    
    const itemErrors = [];
    let hasItemError = false;
    items.forEach((item, idx) => {
      const ie = {};
      if (!item.product_id) { ie.product = 'Select a product'; hasItemError = true; }
      if (!item.quantity || item.quantity < 1) { ie.quantity = 'Min 1'; hasItemError = true; }
      itemErrors.push(ie);
    });
    
    if (hasItemError) errs.items = itemErrors;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customer_id: parseInt(customerId),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      })),
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Calculate live total
  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === parseInt(item.product_id));
    if (product && item.quantity > 0) {
      return sum + Number(product.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <form onSubmit={handleSubmit}>
      {/* Customer Selection */}
      <div className="form-group">
        <label className="form-label">Customer</label>
        <select
          className={`form-select ${errors.customer ? 'error' : ''}`}
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            if (errors.customer) setErrors((prev) => ({ ...prev, customer: undefined }));
          }}
        >
          <option value="">Select a customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} ({c.email})
            </option>
          ))}
        </select>
        {errors.customer && <div className="form-error">{errors.customer}</div>}
      </div>

      {/* Order Items */}
      <div className="form-group">
        <label className="form-label">Order Items</label>
        <div className="order-items-list">
          {items.map((item, idx) => {
            const selectedProduct = products.find((p) => p.id === parseInt(item.product_id));
            const itemErr = errors.items?.[idx] || {};
            
            return (
              <div key={idx} className="order-item-row">
                <div>
                  <select
                    className={`form-select ${itemErr.product ? 'error' : ''}`}
                    value={item.product_id}
                    onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.price).toFixed(2)}) — Stock: {p.quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    className={`form-input ${itemErr.quantity ? 'error' : ''}`}
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 9999}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="Qty"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeItem(idx)}
                  disabled={items.length <= 1}
                  style={{ color: items.length > 1 ? 'var(--danger)' : 'var(--text-muted)' }}
                >
                  <HiTrash />
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="add-item-btn" onClick={addItem}>
          <HiPlus /> Add Another Item
        </button>
      </div>

      {/* Total */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Estimated Total
        </span>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="modal-footer" style={{ padding: 0 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
