import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiViewGrid,
  HiCube,
  HiUsers,
  HiClipboardList,
} from 'react-icons/hi';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <HiViewGrid /> },
  { to: '/products', label: 'Products', icon: <HiCube /> },
  { to: '/customers', label: 'Customers', icon: <HiUsers /> },
  { to: '/orders', label: 'Orders', icon: <HiClipboardList /> },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>InvenTrack</h1>
          <p>Inventory & Orders</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
