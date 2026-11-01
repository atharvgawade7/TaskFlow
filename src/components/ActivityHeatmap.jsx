import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { getDayStatistics } from '../data/taskStore';
import { getCurrentDateInfo } from '../data/sampleData';

export default function ActivityHeatmap({ routines = [], history = {} }) {
  const [weeksCount, setWeeksCount] = useState(16); // 12, 16, or 24 weeks
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current, -1 = previous period
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  const { dateKey: todayKey } = getCurrentDateInfo();

  // Generate the calendar matrix (weeks as columns, 7 days per column)
  const calendarData = useMemo(() => {
    const now = new Date();
    // Shift by offset
    const endWindow = new Date(now);
    endWindow.setDate(endWindow.getDate() + periodOffset * weeksCount * 7);

    // Find the end Sunday of the target week to align columns nicely (Sunday = 0)
    const dayOfWeek = endWindow.getDay();
    const daysToSaturday = 6 - dayOfWeek;
    const endSaturday = new Date(endWindow);
    endSaturday.setDate(endWindow.getDate() + daysToSaturday);

    const totalDays = weeksCount * 7;
    const startSunday = new Date(endSaturday);
    startSunday.setDate(endSaturday.getDate() - totalDays + 1);

    const weeks = [];
    let currentWeek = [];
    const monthHeaders = [];
    let lastSeenMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(startSunday);
      cur.setDate(startSunday.getDate() + i);

      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const curMonth = cur.getMonth();
      const weekIndex = Math.floor(i / 7);

      // Track month transitions for header labels
      if (curMonth !== lastSeenMonth) {
        monthHeaders.push({
          weekIndex,
          monthName: cur.toLocaleDateString('en-US', { month: 'short' }),
        });
        lastSeenMonth = curMonth;
      }

      // Compute stats strictly from real data
      const stats = getDayStatistics(dateKey, routines, history);

      const dayObj = {
        dateKey,
        dateObj: cur,
        formattedDate: cur.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        dayName: cur.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateKey === todayKey,
        isFuture: dateKey > todayKey,
        ...stats,
      };

      currentWeek.push(dayObj);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks, monthHeaders };
  }, [weeksCount, periodOffset, routines, history, todayKey]);

  // Color progression helper based on percentage
  const getCellStyling = (day) => {
    if (day.isFuture) {
      return { className: 'heatmap-cell cell-future', label: 'Future date' };
    }

    if (!day.hasActivities || day.total === 0) {
      return { className: 'heatmap-cell cell-no-data', label: 'No scheduled activities' };
    }

    // Days with scheduled activities but zero completions (distinct from no-data!)
    if (day.eligible > 0 && day.completed === 0) {
      return { className: 'heatmap-cell cell-zero', label: '0% completed' };
    }

    if (day.eligible === 0) {
      return { className: 'heatmap-cell cell-all-skipped', label: 'All activities skipped' };
    }

    // Progression of purple shades: lighter for lower rate, darker for higher rate
    if (day.rate < 40) {
      return { className: 'heatmap-cell level-1', label: `${day.rate}% (Low completion)` };
    }
    if (day.rate < 70) {
      return { className: 'heatmap-cell level-2', label: `${day.rate}% (Medium completion)` };
    }
    if (day.rate < 90) {
      return { className: 'heatmap-cell level-3', label: `${day.rate}% (High completion)` };
    }
    return { className: 'heatmap-cell level-4', label: `${day.rate}% (Optimal completion)` };
  };

  const activeDisplayDay = hoveredDay || selectedDay;

  return (
    <div className="activity-heatmap-component">
      {/* 1. Header with Controls & Period Navigation */}
      <div className="heatmap-control-strip">
        <div className="heatmap-titles">
          <h3 className="heatmap-main-title">Activity Consistency Heatmap</h3>
          <span className="heatmap-sub-hint">
            Calculated as the percentage of eligible scheduled activities completed per calendar day.
          </span>
        </div>

        <div className="heatmap-nav-actions">
          {/* Range Filter */}
          <div className="heatmap-range-pills">
            <button
              type="button"
              className={`range-pill ${weeksCount === 12 ? 'active' : ''}`}
              onClick={() => setWeeksCount(12)}
            >
              12 Weeks
            </button>
            <button
              type="button"
              className={`range-pill ${weeksCount === 16 ? 'active' : ''}`}
              onClick={() => setWeeksCount(16)}
            >
              16 Weeks
            </button>
            <button
              type="button"
              className={`range-pill ${weeksCount === 24 ? 'active' : ''}`}
              onClick={() => setWeeksCount(24)}
            >
              24 Weeks
            </button>
          </div>

          {/* Period Pagination */}
          <div className="heatmap-pagination">
            <button
              type="button"
              className="page-nav-btn"
              onClick={() => setPeriodOffset(periodOffset - 1)}
              title="Review earlier period"
            >
              <Icons.ChevronLeft size={15} /> Earlier
            </button>
            {periodOffset !== 0 && (
              <button
                type="button"
                className="page-nav-btn reset-period"
                onClick={() => setPeriodOffset(0)}
              >
                Current
              </button>
            )}
            <button
              type="button"
              className="page-nav-btn"
              disabled={periodOffset >= 0}
              onClick={() => setPeriodOffset(periodOffset + 1)}
              title="Next period"
            >
              Later <Icons.ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GitHub-Style Calendar Grid */}
      <div className="heatmap-matrix-scroll-wrapper">
        <div className="heatmap-calendar-table">
          {/* Month Labels Row */}
          <div className="heatmap-month-labels-row">
            <div className="weekday-label-spacer" />
            <div className="month-labels-track">
              {calendarData.monthHeaders.map((m, idx) => (
                <span
                  key={`${m.monthName}-${idx}`}
                  className="month-label-tag"
                  style={{ gridColumnStart: m.weekIndex + 1 }}
                >
                  {m.monthName}
                </span>
              ))}
            </div>
          </div>

          <div className="heatmap-body-row">
            {/* Weekday Labels (Mon, Wed, Fri) */}
            <div className="weekday-labels-col">
              <span className="weekday-label">Sun</span>
              <span className="weekday-label">Mon</span>
              <span className="weekday-label">Tue</span>
              <span className="weekday-label">Wed</span>
              <span className="weekday-label">Thu</span>
              <span className="weekday-label">Fri</span>
              <span className="weekday-label">Sat</span>
            </div>

            {/* Weeks Columns Grid */}
            <div
              className="heatmap-columns-grid"
              style={{ gridTemplateColumns: `repeat(${calendarData.weeks.length}, 1fr)` }}
            >
              {calendarData.weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="heatmap-week-column">
                  {week.map((day) => {
                    const styling = getCellStyling(day);
                    const isSelected = selectedDay?.dateKey === day.dateKey;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        className={`${styling.className} ${day.isToday ? 'cell-today' : ''} ${
                          isSelected ? 'cell-selected' : ''
                        }`}
                        onClick={() => setSelectedDay(day)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        aria-label={`${day.formattedDate}: ${styling.label}`}
                      >
                        {day.isToday && <span className="today-marker" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Heatmap Legend */}
      <div className="heatmap-footer-bar">
        <div className="legend-items-wrap">
          <div className="legend-item">
            <span className="legend-box cell-no-data" />
            <span className="legend-text">No activities</span>
          </div>
          <div className="legend-item">
            <span className="legend-box cell-zero" />
            <span className="legend-text">0% completed</span>
          </div>
          <div className="legend-item">
            <span className="legend-box level-1" />
            <span className="legend-text">1 - 39% (Light)</span>
          </div>
          <div className="legend-item">
            <span className="legend-box level-2" />
            <span className="legend-text">40 - 69%</span>
          </div>
          <div className="legend-item">
            <span className="legend-box level-3" />
            <span className="legend-text">70 - 89%</span>
          </div>
          <div className="legend-item">
            <span className="legend-box level-4" />
            <span className="legend-text">90 - 100% (Dark)</span>
          </div>
        </div>

        <span className="legend-hint">
          *Skipped activities are excluded from denominator
        </span>
      </div>

      {/* 4. Interactive Day Inspector Card (Shown when hovered or selected) */}
      {activeDisplayDay && (
        <div className="day-inspector-card">
          <div className="inspector-header">
            <div className="inspector-left">
              <span className="inspector-date">{activeDisplayDay.formattedDate}</span>
              {activeDisplayDay.isToday && <span className="badge badge-personal">TODAY</span>}
            </div>

            <div className="inspector-stats-badges">
              {activeDisplayDay.hasActivities ? (
                <>
                  <span className="inspector-rate-badge">
                    {activeDisplayDay.rate}% Completion Rate
                  </span>
                  <span className="inspector-counts-badge">
                    {activeDisplayDay.completed} / {activeDisplayDay.eligible} Eligible Completed
                  </span>
                  {activeDisplayDay.skipped > 0 && (
                    <span className="inspector-skipped-badge">
                      {activeDisplayDay.skipped} Skipped
                    </span>
                  )}
                </>
              ) : (
                <span className="inspector-empty-badge">No scheduled activities</span>
              )}
            </div>
          </div>

          {/* Activities breakdown list */}
          {activeDisplayDay.activities && activeDisplayDay.activities.length > 0 ? (
            <div className="inspector-activities-list">
              {activeDisplayDay.activities.map((act) => (
                <div key={act.id} className="inspector-activity-item">
                  <div className="item-name-col">
                    <span className="act-title">{act.title}</span>
                    <span className="act-time">{act.time}</span>
                  </div>
                  <span className={`status-pill ${act.status}`}>
                    <span className="status-dot" />
                    {act.status.charAt(0).toUpperCase() + act.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="inspector-empty-text">
              No routines or tasks were scheduled on this calendar day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
