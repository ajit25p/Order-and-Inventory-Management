import React, { useState, useEffect } from 'react';

export default function ProductForm({ product, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
      });
    }
  }, [product]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) < 0) errs.price = 'Valid price is required';
    if (form.quantity === '' || parseInt(form.quantity) < 0) errs.quantity = 'Valid quantity is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Product Name</label>
        <input
          className={`form-input ${errors.name ? 'error' : ''}`}
          type="text"
          placeholder="e.g. Wireless Mouse"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">SKU / Code</label>
        <input
          className={`form-input ${errors.sku ? 'error' : ''}`}
          type="text"
          placeholder="e.g. WM-001"
          value={form.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
        />
        {errors.sku && <div className="form-error">{errors.sku}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Price ($)</label>
          <input
            className={`form-input ${errors.price ? 'error' : ''}`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
          {errors.price && <div className="form-error">{errors.price}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            className={`form-input ${errors.quantity ? 'error' : ''}`}
            type="number"
            min="0"
            placeholder="0"
            value={form.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
          {errors.quantity && <div className="form-error">{errors.quantity}</div>}
        </div>
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
