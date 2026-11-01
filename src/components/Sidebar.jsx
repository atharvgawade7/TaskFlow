import React from 'react';
import { Icons } from './Icons';
import { currentUser } from '../data/sampleData';

export default function Sidebar({
  activeTab,
  setActiveTab,
  completionRate = 0,
  routinesCount = 0,
  pendingTasksCount = 0,
  mealsCount = 0,
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Icons.Overview,
      badge: 'Today',
      badgeType: 'neutral',
    },
    {
      id: 'routine',
      label: 'Daily Routine',
      icon: Icons.Routine,
      badge: `${routinesCount}`,
      badgeType: 'purple',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Icons.Schedule,
      badge: 'Timeline',
      badgeType: 'neutral',
    },
    {
      id: 'meals',
      label: 'Meal Tracker',
      icon: Icons.Meals,
      badge: `${mealsCount}`,
      badgeType: 'purple',
    },
    {
      id: 'insights',
      label: 'Insights & Record',
      icon: Icons.Insights,
      badge: 'Heatmap',
      badgeType: 'neutral', // streak '14d 🔥' removed!
    },
    {
      id: 'tasks',
      label: 'One-Time Tasks',
      icon: Icons.Tasks,
      badge: `${pendingTasksCount}`,
      badgeType: 'neutral',
    },
  ];

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      {/* Brand Logo Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <div className="brand-logo-glow" />
          <div className="brand-logo-icon">
            <Icons.Zap size={20} />
          </div>
        </div>
        <div className="brand-text">
          <span className="brand-name">TaskFlow</span>
          <span className="brand-tagline">DAILY SYSTEM</span>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="sidebar-nav-container">
        <div className="sidebar-section-label">MAIN DASHBOARD</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon-wrapper">
                  <IconComponent size={19} className="nav-icon" />
                </span>
                <span className="nav-label">{item.label}</span>

                {item.badge && (
                  <span className={`nav-badge ${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <span className="active-pill-glow" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Routine System Notice Card */}
      <div className="sidebar-quick-card">
        <div className="quick-card-header">
          <div className="quick-card-icon">
            <Icons.Repeat size={14} />
          </div>
          <span className="quick-card-title">Recurring Engine</span>
        </div>
        <p className="quick-card-desc">
          Routines refresh on assigned days. Past completion history is permanently preserved.
        </p>
        <div className="quick-card-meter">
          <div className="quick-card-meter-info">
            <span>Today's Progress</span>
            <span className="quick-card-percent">{completionRate}%</span>
          </div>
          <div className="quick-meter-bar">
            <div
              className="quick-meter-fill"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="sidebar-user-footer">
        <div className="user-avatar-wrapper">
          <div className="user-avatar">TF</div>
          <span className="user-online-dot" />
        </div>
        <div className="user-details">
          <span className="user-name">TaskFlow User</span>
          <span className="user-role">Focus & Habit System</span>
        </div>
      </div>
    </aside>
  );
}
