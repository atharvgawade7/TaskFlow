import React from 'react';
import { Icons } from './Icons';
import { currentUser, getCurrentWeekDays } from '../data/sampleData';
import { getDayStatistics } from '../data/taskStore';

export default function OverviewView({
  routines = [],
  meals = [],
  tasks = [],
  todayActivities = [],
  history = {},
  setActiveTab,
  onToggleStatus,
  onOpenCreateRoutine,
  onOpenCreateTask,
}) {
  // Compute summary stats dynamically from today's occurrences
  const totalRoutines = routines.length;
  const completedRoutines = todayActivities.filter((r) => r.status === 'completed').length;
  const missedRoutines = todayActivities.filter((r) => r.status === 'missed').length;
  const pendingRoutines = todayActivities.filter((r) => r.status === 'pending').length;
  const skippedRoutines = todayActivities.filter((r) => r.status === 'skipped').length;

  const totalMeals = meals.length;
  const eatenMeals = meals.filter((m) => m.status === 'eaten').length;

  const overallTotal = todayActivities.length + totalMeals;
  const overallEligible = overallTotal - skippedRoutines;
  const overallCompleted = completedRoutines + eatenMeals;
  const completionPercent = overallEligible > 0 ? Math.round((overallCompleted / overallEligible) * 100) : 0;

  // Next upcoming pending activities for today
  const upcomingActivities = todayActivities
    .filter((r) => r.status === 'pending')
    .slice(0, 5);

  // Compute 7-day weekly overview from actual history data
  const weekDays = getCurrentWeekDays().map((w) => {
    const stats = getDayStatistics(w.dateKey, routines, history);
    return {
      day: w.key,
      date: w.date,
      rate: stats.hasActivities && stats.eligible > 0 ? stats.rate : 0,
      completed: stats.completed,
      total: stats.eligible,
      hasActivities: stats.hasActivities,
      isToday: w.isToday,
    };
  });

  // SVG circular calculation for 80px radius circle
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="overview-container">
      {/* 1. Greeting & Day Progression Banner */}
      <section className="overview-hero-card">
        <div className="hero-content">
          <div className="hero-greeting-line">
            <span className="hero-wave">👋</span>
            <span className="hero-welcome">{currentUser.greeting}</span>
          </div>
          <p className="hero-subtitle">
            It is <strong className="hero-date">{currentUser.dateStr}</strong>.{' '}
            {overallTotal > 0 ? (
              <>
                You have completed {overallCompleted} of {overallEligible} eligible scheduled activities today.
              </>
            ) : (
              <>
                Welcome to TaskFlow. Build your daily foundation by adding your first routine or task.
              </>
            )}
          </p>

          {/* Quick Creation CTA Strip when starting out */}
          <div className="overview-quick-ctas">
            <button
              type="button"
              className="action-btn-primary"
              onClick={onOpenCreateRoutine}
            >
              <Icons.Plus size={15} /> Add Routine
            </button>
            <button
              type="button"
              className="action-btn-secondary"
              onClick={onOpenCreateTask}
            >
              <Icons.Plus size={15} /> Add Task
            </button>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="hero-gauge-box">
          <div className="circular-meter-wrapper">
            <svg className="circular-meter-svg" width="160" height="160" viewBox="0 0 160 160">
              <circle
                className="meter-bg-circle"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="11"
              />
              <circle
                className="meter-fill-circle"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="meter-inner-content">
              <span className="meter-percentage">{completionPercent}%</span>
              <span className="meter-subtext">Today's Total</span>
            </div>
          </div>
          <div className="gauge-status-note">
            <span className="gauge-badge">
              {overallTotal === 0 ? 'Fresh Start' : completionPercent === 100 ? 'All Completed' : 'In Progress'}
            </span>
            <span className="gauge-detail">
              {overallCompleted} / {overallEligible} activities
            </span>
          </div>
        </div>
      </section>

      {/* 2. Four Activity Summary Cards */}
      <section className="summary-cards-grid">
        {/* Scheduled Card */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-title">Scheduled Today</span>
            <div className="summary-icon-box blue">
              <Icons.CalendarDays size={18} />
            </div>
          </div>
          <div className="summary-number">{todayActivities.length}</div>
          <div className="summary-subtext">
            <span>Configured recurring items</span>
          </div>
          <div className="summary-status-tag scheduled">
            <span className="status-dot" /> {totalRoutines} routines active
          </div>
        </div>

        {/* Completed Card */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-title">Completed</span>
            <div className="summary-icon-box green">
              <Icons.Check size={18} />
            </div>
          </div>
          <div className="summary-number green-text">{completedRoutines}</div>
          <div className="summary-subtext">
            <span>Checked off so far</span>
          </div>
          <div className="summary-status-tag completed">
            <span className="status-dot" />{' '}
            {todayActivities.length > 0
              ? `${Math.round((completedRoutines / Math.max(1, todayActivities.length - skippedRoutines)) * 100)}% Rate`
              : '0% Rate'}
          </div>
        </div>

        {/* Pending Card */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-title">Pending Ahead</span>
            <div className="summary-icon-box silver">
              <Icons.Clock size={18} />
            </div>
          </div>
          <div className="summary-number silver-text">{pendingRoutines}</div>
          <div className="summary-subtext">
            <span>Upcoming on today's schedule</span>
          </div>
          <div className="summary-status-tag pending">
            <span className="status-dot" /> Awaiting deadline
          </div>
        </div>

        {/* Missed Card */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-title">Missed Deadlines</span>
            <div className="summary-icon-box rose">
              <Icons.AlertCircle size={18} />
            </div>
          </div>
          <div className="summary-number rose-text">{missedRoutines}</div>
          <div className="summary-subtext">
            <span>Past scheduled time</span>
          </div>
          <div className="summary-status-tag missed">
            <span className="status-dot" /> {skippedRoutines} skipped (excluded)
          </div>
        </div>
      </section>

      {/* 3. Split Layout: Weekly Consistency & Upcoming Schedule */}
      <section className="overview-split-grid">
        {/* Weekly Consistency Overview Card */}
        <div className="dashboard-panel weekly-progress-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Weekly Consistency Overview</h2>
              <p className="panel-desc">Adherence rates across the current 7-day routine block</p>
            </div>
            <button
              type="button"
              className="panel-action-btn"
              onClick={() => setActiveTab('insights')}
            >
              Full Analytics <Icons.ChevronRight size={14} />
            </button>
          </div>

          <div className="weekly-bars-container">
            {weekDays.map((w) => (
              <div key={w.day} className={`week-bar-column ${w.isToday ? 'today-column' : ''}`}>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${w.isToday ? 'today-fill' : ''}`}
                    style={{
                      height: w.hasActivities ? `${Math.max(6, w.rate)}%` : '0%',
                      opacity: w.hasActivities ? 1 : 0.2,
                    }}
                    title={`${w.day}: ${w.rate}% completed (${w.completed}/${w.total})`}
                  />
                </div>
                <div className="bar-rate-text">{w.hasActivities ? `${w.rate}%` : '-'}</div>
                <div className="bar-day-name">{w.day}</div>
                <div className="bar-date-sub">{w.date.split(' ')[1]}</div>
                {w.isToday && <span className="today-badge">TODAY</span>}
              </div>
            ))}
          </div>

          <div className="weekly-stats-footer">
            <div className="footer-stat-item">
              <span className="footer-stat-label">Active Routines</span>
              <strong className="footer-stat-val">{totalRoutines} Configured</strong>
            </div>
            <div className="footer-stat-item">
              <span className="footer-stat-label">Pending Deadlines</span>
              <strong className="footer-stat-val">{tasks.filter((t) => !t.completed).length} Tasks</strong>
            </div>
            <div className="footer-stat-item">
              <span className="footer-stat-label">Meals On Track</span>
              <strong className="footer-stat-val">{eatenMeals} / {totalMeals} Eaten</strong>
            </div>
          </div>
        </div>

        {/* Compact Upcoming Schedule */}
        <div className="dashboard-panel upcoming-schedule-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Upcoming Schedule Today</h2>
              <p className="panel-desc">Next scheduled activities on your agenda</p>
            </div>
            <button
              type="button"
              className="panel-action-btn"
              onClick={() => setActiveTab('schedule')}
            >
              Timeline <Icons.ChevronRight size={14} />
            </button>
          </div>

          <div className="upcoming-list">
            {upcomingActivities.length === 0 ? (
              <div className="empty-state-notice">
                <Icons.Check size={28} className="empty-icon" />
                <p>
                  {todayActivities.length === 0
                    ? 'No routines scheduled for today.'
                    : 'All routines for today have been checked off!'}
                </p>
              </div>
            ) : (
              upcomingActivities.map((item) => (
                <div key={item.id} className="upcoming-item-card">
                  <div className="upcoming-time-col">
                    <Icons.Clock size={13} className="time-icon" />
                    <span className="upcoming-time-str">{item.time.split(' - ')[0]}</span>
                  </div>

                  <div className="upcoming-info-col">
                    <div className="upcoming-title-row">
                      <span className="upcoming-title">{item.title}</span>
                      <span className={`badge badge-${(item.category || 'personal').toLowerCase()}`}>
                        {item.category}
                      </span>
                    </div>
                    <span className="upcoming-recurrence-hint">
                      <Icons.Repeat size={11} /> {item.recurrence || 'Daily'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="quick-check-btn"
                    onClick={() => onToggleStatus(item.id, item.status)}
                    title="Mark as completed"
                  >
                    <Icons.Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="upcoming-actions-strip">
            <button
              type="button"
              className="shortcut-btn routine-shortcut"
              onClick={() => setActiveTab('routine')}
            >
              <Icons.Routine size={16} /> Open Daily Checklist ({pendingRoutines} Pending)
            </button>
            <button
              type="button"
              className="shortcut-btn meal-shortcut"
              onClick={() => setActiveTab('meals')}
            >
              <Icons.Meals size={16} /> Log Meal ({eatenMeals}/{totalMeals})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
