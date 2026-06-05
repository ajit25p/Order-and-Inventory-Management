import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCube,
  HiUsers,
  HiClipboardList,
  HiCurrencyDollar,
  HiExclamation,
} from 'react-icons/hi';
import { getDashboard } from '../../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your inventory and orders</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3>Unable to load dashboard</h3>
        <p>Please ensure the backend API is running.</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Products',
      value: data.total_products,
      icon: <HiCube />,
      color: 'cyan',
      action: () => navigate('/products'),
    },
    {
      label: 'Total Customers',
      value: data.total_customers,
      icon: <HiUsers />,
      color: 'green',
      action: () => navigate('/customers'),
    },
    {
      label: 'Total Orders',
      value: data.total_orders,
      icon: <HiClipboardList />,
      color: 'violet',
      action: () => navigate('/orders'),
    },
    {
      label: 'Total Revenue',
      value: `$${Number(data.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <HiCurrencyDollar />,
      color: 'amber',
    },
  ];

  const getStockClass = (qty) => {
    if (qty === 0) return 'stock-low';
    if (qty <= 5) return 'stock-low';
    return 'stock-medium';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your inventory and orders</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div
            key={i}
            className="stat-card animate-in"
            style={{ animationDelay: `${i * 0.08}s`, cursor: s.action ? 'pointer' : 'default' }}
            onClick={s.action}
          >
            <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Products */}
      {data.low_stock_products.length > 0 && (
        <div className="low-stock-section animate-in" style={{ animationDelay: '0.35s' }}>
          <h2>
            <HiExclamation /> Low Stock Alert
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className="badge badge-default">{p.sku}</span>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`stock-indicator ${getStockClass(p.quantity)}`}>
                        {p.quantity} {p.quantity === 0 ? '— Out of Stock' : 'units'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
