import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiCube } from 'react-icons/hi';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/api';
import { useToast } from '../../App';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import ProductForm from './ProductForm';

export default function ProductList() {
  const addToast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(page, PAGE_SIZE, search);
      setProducts(res.data.items);
      setPagination({ total: res.data.total, total_pages: res.data.total_pages });
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createProduct(data);
      addToast('Product created successfully', 'success');
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateProduct(editProduct.id, data);
      addToast('Product updated successfully', 'success');
      setEditProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      addToast('Product deleted successfully', 'success');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete product', 'error');
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const getStockClass = (qty) => {
    if (qty === 0) return 'stock-low';
    if (qty <= 10) return 'stock-medium';
    return 'stock-high';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiPlus /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-bar">
          <HiSearch />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {pagination.total} product{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="data-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HiCube /></div>
          <h3>No products found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
        </div>
      ) : (
        <>
          <div className="data-grid">
            {products.map((p, i) => (
              <div key={p.id} className="data-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="data-card-header">
                  <div>
                    <div className="data-card-title">{p.name}</div>
                    <div className="data-card-subtitle">
                      <span className="badge badge-default">{p.sku}</span>
                    </div>
                  </div>
                  <div className="data-card-actions">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(p)} title="Edit">
                      <HiPencil />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(p)} title="Delete" style={{ color: 'var(--danger)' }}>
                      <HiTrash />
                    </button>
                  </div>
                </div>
                <div className="data-card-body">
                  <div className="data-card-field">
                    <span className="data-card-field-label">Price</span>
                    <span className="data-card-field-value">${Number(p.price).toFixed(2)}</span>
                  </div>
                  <div className="data-card-field">
                    <span className="data-card-field-label">In Stock</span>
                    <span className={`data-card-field-value stock-indicator ${getStockClass(p.quantity)}`}>
                      {p.quantity} units
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="pagination-info">…</span>
                    )}
                    <button
                      className={`pagination-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                className="pagination-btn"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditProduct(null); }}
        title={editProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          product={editProduct}
          onSubmit={editProduct ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
          loading={saving}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
