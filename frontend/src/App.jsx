import React, { useState, createContext, useContext, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import CustomerList from './components/Customers/CustomerList';
import OrderList from './components/Orders/OrderList';
import OrderDetail from './components/Orders/OrderDetail';
import Toast from './components/common/Toast';

// ── Toast Context ─────────────────────────────────────────────────────
const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// ── App ───────────────────────────────────────────────────────────────
function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

export default App;
