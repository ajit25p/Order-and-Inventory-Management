import React from 'react';
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle, HiX } from 'react-icons/hi';

const icons = {
  success: <HiCheckCircle />,
  error: <HiXCircle />,
  warning: <HiExclamation />,
  info: <HiInformationCircle />,
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{icons[toast.type] || icons.info}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-dismiss" onClick={() => onDismiss(toast.id)}>
            <HiX />
          </button>
        </div>
      ))}
    </div>
  );
}
