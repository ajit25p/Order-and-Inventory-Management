import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { getOrder } from '../../api/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="order-detail">
        <div className="skeleton skeleton-card" style={{ height: 300 }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state">
        <h3>Order not found</h3>
        <p>The order you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ marginTop: 16 }}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail animate-in">
      <div className="order-detail-header">
        <button className="back-btn" onClick={() => navigate('/orders')}>
          <HiArrowLeft /> Back to Orders
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1>Order #{order.id}</h1>
          <p>Created on {formatDate(order.created_at)}</p>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.88rem', padding: '6px 16px' }}>
          {order.status}
        </span>
      </div>

      {/* Order Info */}
      <div className="order-info-grid">
        <div className="order-info-item">
          <label>Customer</label>
          <span>{order.customer_name}</span>
        </div>
        <div className="order-info-item">
          <label>Items</label>
          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="order-info-item">
          <label>Total Amount</label>
          <span style={{ color: 'var(--accent)' }}>${Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                <td><span className="badge badge-default">{item.product_sku}</span></td>
                <td>${Number(item.unit_price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td style={{ fontWeight: 700 }}>${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                Total
              </td>
              <td style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                ${Number(order.total_amount).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
