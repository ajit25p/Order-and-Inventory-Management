import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiEye, HiTrash, HiClipboardList } from 'react-icons/hi';
import { getOrders, createOrder, deleteOrder } from '../../api/api';
import { useToast } from '../../App';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import OrderForm from './OrderForm';

export default function OrderList() {
  const addToast = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PAGE_SIZE = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders(page, PAGE_SIZE);
      setOrders(res.data.items);
      setPagination({ total: res.data.total, total_pages: res.data.total_pages });
    } catch {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createOrder(data);
      addToast('Order created successfully', 'success');
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(deleteTarget.id);
      addToast('Order deleted successfully', 'success');
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete order', 'error');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Track and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <HiPlus /> Create Order
        </button>
      </div>

      <div className="toolbar">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {pagination.total} order{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiClipboardList /></div>
          <h3>No orders yet</h3>
          <p>Create your first order to get started</p>
        </div>
      ) : (
        <>
          <div className="table-container animate-in">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{order.id}</td>
                    <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                    <td>
                      <span className="badge badge-default">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>${Number(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-info">{order.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          title="View Details"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTarget(order)}
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="pagination-info">…</span>}
                    <button className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))}
              <button className="pagination-btn" disabled={page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Order">
        <OrderForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to delete Order #${deleteTarget?.id}? Stock will be restored.`}
      />
    </div>
  );
}
