import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiSearch, HiTrash, HiUsers, HiMail, HiPhone } from 'react-icons/hi';
import { getCustomers, createCustomer, deleteCustomer } from '../../api/api';
import { useToast } from '../../App';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import CustomerForm from './CustomerForm';

export default function CustomerList() {
  const addToast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PAGE_SIZE = 12;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers(page, PAGE_SIZE, search);
      setCustomers(res.data.items);
      setPagination({ total: res.data.total, total_pages: res.data.total_pages });
    } catch {
      addToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createCustomer(data);
      addToast('Customer added successfully', 'success');
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to add customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      addToast('Customer deleted successfully', 'success');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete customer', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <HiPlus /> Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <HiSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {pagination.total} customer{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="data-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiUsers /></div>
          <h3>No customers found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
        </div>
      ) : (
        <>
          <div className="data-grid">
            {customers.map((c, i) => (
              <div key={c.id} className="data-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="data-card-header">
                  <div>
                    <div className="data-card-title">{c.full_name}</div>
                  </div>
                  <div className="data-card-actions">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => setDeleteTarget(c)}
                      title="Delete"
                      style={{ color: 'var(--danger)' }}
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
                <div className="data-card-body">
                  <div className="data-card-field">
                    <span className="data-card-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiMail /> Email
                    </span>
                    <span className="data-card-field-value" style={{ fontSize: '0.85rem' }}>{c.email}</span>
                  </div>
                  <div className="data-card-field">
                    <span className="data-card-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiPhone /> Phone
                    </span>
                    <span className="data-card-field-value">{c.phone}</span>
                  </div>
                </div>
              </div>
            ))}
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Customer">
        <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This action cannot be undone.`}
      />
    </div>
  );
}
