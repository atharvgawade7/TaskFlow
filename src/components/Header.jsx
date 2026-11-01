import React from 'react';
import { Icons } from './Icons';
import { currentUser } from '../data/sampleData';
import { useAuth } from '../context/AuthContext';

export default function Header({
  activeTab,
  onMobileMenuToggle,
  isMobileMenuOpen,
  completionRate = 0,
  onResetData,
  onSignOut,
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'Daily summary, completion rate, and upcoming schedule' };
      case 'routine':
        return { title: 'My Daily Routine', subtitle: 'Recurring time-blocked habits and scheduled routines' };
      case 'schedule':
        return { title: 'Master Schedule', subtitle: 'Chronological timeline and weekly frequency viewer' };
      case 'meals':
        return { title: 'Daily Meal Tracker', subtitle: 'Structured nutritional check-ins and consistency' };
      case 'insights':
        return { title: 'Insights & Track Record', subtitle: 'Historical consistency, calendar heatmaps, and category adherence' };
      case 'tasks':
        return { title: 'One-Time Tasks', subtitle: 'Assignments, coursework deadlines, and non-recurring errands' };
      default:
        return { title: 'Dashboard', subtitle: 'TaskFlow System' };
    }
  };

  const info = getTabTitle(activeTab);

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isMobileMenuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
        </button>

        <div className="header-titles">
          <div className="header-breadcrumb">
            <span>TaskFlow</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </div>
          <h1 className="header-page-title">{info.title}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Day Phase Indicator */}
        <div className="day-phase-badge">
          <Icons.Sun size={14} className="phase-icon" />
          <span className="phase-text">{currentUser.currentTimePhase}</span>
        </div>

        {/* Date Display */}
        <div className="header-date-badge">
          <Icons.CalendarDays size={14} className="date-icon" />
          <span>{currentUser.dateStr}</span>
        </div>

        {/* Completion Adherence Badge (Streaks completely removed) */}
        <div className="header-adherence-badge" title="Overall completion rate of today's scheduled activities">
          <Icons.Check size={14} className="adherence-icon" />
          <span>{completionRate}% Completion</span>
        </div>

        {/* Clean Data Reset Button */}
        {onResetData && (
          <button
            type="button"
            className="header-reset-btn"
            onClick={onResetData}
            title="Reset data to clean state"
            aria-label="Reset data"
          >
            <Icons.RotateCcw size={14} />
          </button>
        )}

        {/* SignOut Button */}
        {onSignOut && (
          <button
            type="button"
            className="header-signout-btn"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
