import React from 'react';
import { Icons } from './Icons';

export default function MobileNav({ activeTab, setActiveTab, isOpen, onClose }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Icons.Overview },
    { id: 'routine', label: 'Routine', icon: Icons.Routine },
    { id: 'schedule', label: 'Schedule', icon: Icons.Schedule },
    { id: 'meals', label: 'Meals', icon: Icons.Meals },
    { id: 'insights', label: 'Insights', icon: Icons.Insights },
    { id: 'tasks', label: 'Tasks', icon: Icons.Tasks },
  ];

  return (
    <>
      {/* 1. Slide-out Drawer Overlay for Mobile */}
      {isOpen && (
        <div className="mobile-drawer-backdrop" onClick={onClose}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-brand">
                <div className="brand-logo-icon small">
                  <Icons.Zap size={16} />
                </div>
                <span>TaskFlow</span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={onClose}
                aria-label="Close menu"
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="drawer-nav-list">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                  >
                    <IconComp size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Fixed Bottom Quick Bar for Mobile */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-bottom-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComp size={18} />
              <span className="mobile-item-label">{item.label}</span>
              {isActive && <span className="mobile-active-dot" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
