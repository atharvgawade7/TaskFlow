import React, { useState } from 'react';
import { Icons } from './Icons';

export default function RoutineView({
  routines = [],
  todayActivities = [],
  onToggleStatus,
  onSetStatus,
  onOpenCreateRoutine,
  onOpenEditRoutine,
  onOpenDeleteRoutine,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const periods = [
    { key: 'all', label: 'All Routines', icon: Icons.Routine },
    { key: 'morning', label: 'Morning', icon: Icons.Sun, timeRange: '06:00 - 12:00' },
    { key: 'afternoon', label: 'Afternoon', icon: Icons.Sun, timeRange: '12:00 - 17:00' },
    { key: 'evening', label: 'Evening', icon: Icons.Sunset, timeRange: '17:00 - 20:30' },
    { key: 'night', label: 'Night', icon: Icons.Moon, timeRange: '20:30 - 23:30' },
  ];

  // Map each routine to today's occurrence status if available
  const routineItems = routines.map((routine) => {
    const todayOccurrence = todayActivities.find((a) => a.routineId === routine.id);
    const status = todayOccurrence ? todayOccurrence.status : 'pending';
    return {
      ...routine,
      currentStatus: status,
      activityId: todayOccurrence ? todayOccurrence.id : routine.id,
      occurrenceTitle: todayOccurrence ? todayOccurrence.title : routine.title,
      occurrenceTime: todayOccurrence ? todayOccurrence.time : routine.time,
      occurrenceNotes: todayOccurrence ? todayOccurrence.notes : routine.notes,
    };
  });

  const completedCount = routineItems.filter((r) => r.currentStatus === 'completed').length;
  const pendingCount = routineItems.filter((r) => r.currentStatus === 'pending').length;
  const missedCount = routineItems.filter((r) => r.currentStatus === 'missed').length;
  const skippedCount = routineItems.filter((r) => r.currentStatus === 'skipped').length;

  const filteredRoutines = selectedPeriod === 'all'
    ? routineItems
    : routineItems.filter((r) => r.period === selectedPeriod);

  // Group by period
  const periodGroups = [
    { key: 'morning', title: 'Morning Routine', timeRange: '06:00 - 12:00', icon: Icons.Sun },
    { key: 'afternoon', title: 'Afternoon Routine', timeRange: '12:00 - 17:00', icon: Icons.Sun },
    { key: 'evening', title: 'Evening Routine & Training', timeRange: '17:00 - 20:30', icon: Icons.Sunset },
    { key: 'night', title: 'Night Wind-Down & Sleep', timeRange: '20:30 - 23:30', icon: Icons.Moon },
  ];

  const displayedGroups = selectedPeriod === 'all'
    ? periodGroups
    : periodGroups.filter((g) => g.key === selectedPeriod);

  return (
    <div className="routine-view-container">
      {/* 1. Header & Engine Banner */}
      <section className="engine-banner-card">
        <div className="banner-left">
          <div className="banner-icon-box">
            <Icons.Repeat size={20} />
          </div>
          <div>
            <h2 className="banner-title">Recurring Routine Engine</h2>
            <p className="banner-text">
              Routines are configured once and automatically populate every morning according to their assigned weekday schedules.
              Editing updates future occurrences only; your past completion records remain safely preserved.
            </p>
          </div>
        </div>

        <div className="banner-right-actions">
          <button
            type="button"
            className="action-btn-primary"
            onClick={onOpenCreateRoutine}
          >
            <Icons.Plus size={16} /> Create Routine
          </button>
        </div>
      </section>

      {/* 2. Today's Status Summary Chips */}
      <div className="routine-summary-strip">
        <div className="chip-item">
          <span className="chip-dot green" />
          <span className="chip-label">Completed: <strong>{completedCount}</strong></span>
        </div>
        <div className="chip-item">
          <span className="chip-dot silver" />
          <span className="chip-label">Pending: <strong>{pendingCount}</strong></span>
        </div>
        <div className="chip-item">
          <span className="chip-dot rose" />
          <span className="chip-label">Missed: <strong>{missedCount}</strong></span>
        </div>
        <div className="chip-item">
          <span className="chip-dot neutral" />
          <span className="chip-label">Skipped: <strong>{skippedCount}</strong></span>
        </div>
      </div>

      {/* 3. Period Filter Tabs */}
      <div className="period-tabs-bar">
        {periods.map((p) => {
          const IconComp = p.icon;
          const isActive = selectedPeriod === p.key;
          const count = p.key === 'all'
            ? routineItems.length
            : routineItems.filter((r) => r.period === p.key).length;

          return (
            <button
              key={p.key}
              type="button"
              className={`period-filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(p.key)}
            >
              <IconComp size={15} />
              <span>{p.label}</span>
              <span className="period-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Routines List or Clean Empty State */}
      {routineItems.length === 0 ? (
        <div className="clean-empty-state-card">
          <div className="empty-state-icon purple-glow">
            <Icons.Repeat size={36} />
          </div>
          <h3 className="empty-state-title">No routines yet</h3>
          <p className="empty-state-desc">
            Build your daily rhythm by adding morning hydration, workouts, classes, or evening wind-down habits.
            They will automatically populate on designated days.
          </p>
          <button
            type="button"
            className="btn-primary empty-state-cta"
            onClick={onOpenCreateRoutine}
          >
            <Icons.Plus size={16} /> Add Your First Routine
          </button>
        </div>
      ) : (
        <div className="routine-groups-stack">
          {displayedGroups.map((group) => {
            const IconComp = group.icon;
            const items = filteredRoutines.filter((r) => r.period === group.key);
            if (items.length === 0 && selectedPeriod === 'all') return null;

            const groupCompleted = items.filter((i) => i.currentStatus === 'completed').length;

            return (
              <section key={group.key} className="routine-group-card">
                <div className="routine-group-header">
                  <div className="group-header-left">
                    <div className="group-header-icon">
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h3 className="group-title">{group.title}</h3>
                      <span className="group-time-range">{group.timeRange}</span>
                    </div>
                  </div>

                  <div className="group-progress-pill">
                    <span>{groupCompleted} of {items.length} Completed</span>
                    <div className="group-mini-bar">
                      <div
                        className="group-mini-fill"
                        style={{
                          width: items.length > 0 ? `${(groupCompleted / items.length) * 100}%` : '0%',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="routine-items-list">
                  {items.length === 0 ? (
                    <div className="group-empty-hint">
                      <span>No {group.title.toLowerCase()} scheduled</span>
                    </div>
                  ) : (
                    items.map((item) => {
                      const isCompleted = item.currentStatus === 'completed';
                      const isMissed = item.currentStatus === 'missed';
                      const isSkipped = item.currentStatus === 'skipped';
                      const isPending = item.currentStatus === 'pending';

                      return (
                        <div
                          key={item.id}
                          className={`routine-item-row ${item.currentStatus}`}
                        >
                          {/* Checkbox Control */}
                          <button
                            type="button"
                            className={`routine-checkbox ${isCompleted ? 'checked' : ''} ${
                              isMissed ? 'missed' : ''
                            } ${isSkipped ? 'skipped' : ''}`}
                            onClick={() => onToggleStatus(item.activityId || item.id, item.currentStatus)}
                            aria-label={`Toggle ${item.occurrenceTitle}`}
                            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {isCompleted && <Icons.Check size={14} />}
                            {isMissed && <Icons.AlertCircle size={14} />}
                            {isSkipped && <Icons.Skip size={14} />}
                          </button>

                          {/* Content Column */}
                          <div className="routine-content-col">
                            <div className="routine-main-row">
                              <h4
                                className={`routine-title ${
                                  isCompleted ? 'strikethrough' : ''
                                } ${isSkipped ? 'dimmed' : ''}`}
                              >
                                {item.occurrenceTitle}
                              </h4>

                              <div className="routine-badges-wrap">
                                <span className={`badge badge-${item.category.toLowerCase()}`}>
                                  {item.category}
                                </span>
                                <span className="recurrence-tag" title="Assigned Days">
                                  <Icons.Repeat size={11} /> {item.recurrence}
                                </span>
                              </div>
                            </div>

                            {item.occurrenceNotes && (
                              <p className="routine-notes-text">{item.occurrenceNotes}</p>
                            )}

                            <div className="routine-footer-meta">
                              <div className="meta-time">
                                <Icons.Clock size={12} />
                                <span>{item.occurrenceTime}</span>
                              </div>

                              <div className="meta-assigned-days">
                                {Array.isArray(item.days) &&
                                  item.days.map((day) => (
                                    <span key={day} className="day-chip">
                                      {day}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Status Select & Action Buttons */}
                          <div className="routine-actions-col">
                            {/* 4 Status Selector */}
                            <select
                              className={`status-select-badge ${item.currentStatus}`}
                              value={item.currentStatus}
                              onChange={(e) => onSetStatus(item.activityId || item.id, e.target.value)}
                              title="Set activity status"
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="missed">Missed</option>
                              <option value="skipped">Skipped (N/A)</option>
                            </select>

                            {/* Edit & Delete Controls */}
                            <div className="row-action-buttons">
                              <button
                                type="button"
                                className="item-action-btn edit-btn"
                                onClick={() => onOpenEditRoutine(item)}
                                title="Edit routine schedule"
                                aria-label="Edit routine"
                              >
                                <Icons.Edit size={14} />
                              </button>
                              <button
                                type="button"
                                className="item-action-btn delete-btn"
                                onClick={() => onOpenDeleteRoutine(item)}
                                title="Delete routine (history preserved)"
                                aria-label="Delete routine"
                              >
                                <Icons.Trash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
