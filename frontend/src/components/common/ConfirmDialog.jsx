import React from 'react';
import { HiExclamation } from 'react-icons/hi';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-body">
        <div className="confirm-icon">
          <HiExclamation />
        </div>
        <h3>{title || 'Are you sure?'}</h3>
        <p>{message || 'This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
