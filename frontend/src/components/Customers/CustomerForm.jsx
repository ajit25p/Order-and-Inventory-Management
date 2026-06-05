import React, { useState } from 'react';

export default function CustomerForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          className={`form-input ${errors.full_name ? 'error' : ''}`}
          type="text"
          placeholder="e.g. John Smith"
          value={form.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
        />
        {errors.full_name && <div className="form-error">{errors.full_name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          className={`form-input ${errors.email ? 'error' : ''}`}
          type="email"
          placeholder="e.g. john@example.com"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input
          className={`form-input ${errors.phone ? 'error' : ''}`}
          type="tel"
          placeholder="e.g. +1 234 567 8900"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors.phone && <div className="form-error">{errors.phone}</div>}
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
}
