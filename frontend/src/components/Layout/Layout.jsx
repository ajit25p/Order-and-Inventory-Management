import React, { useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="mobile-header">
        <h1>InvenTrack</h1>
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          <HiMenu />
        </button>
      </div>

      <main className="main-content">{children}</main>
    </div>
  );
}
