import React, { useState } from 'react';
import { Icons } from './Icons';
import { getCurrentWeekDays } from '../data/sampleData';

export default function ScheduleView({ routines = [], meals = [], onOpenCreateRoutine }) {
  const weekDays = getCurrentWeekDays();
  const todayItem = weekDays.find((d) => d.isToday) || weekDays[0];
  const [activeDay, setActiveDay] = useState(todayItem.key);
  const [filterFrequency, setFilterFrequency] = useState('all'); // all | daily | custom

  // Dynamically compute activities for the active day from user's routines and meals
  const dayRoutines = routines.filter((r) => {
    return Array.isArray(r.days) && r.days.includes(activeDay);
  });

  const timelineItems = [
    ...dayRoutines.map((r) => ({
      id: r.id,
      time: r.time,
      title: r.title,
      category: r.category || 'Personal',
      type: 'Recurring',
      frequency: r.recurrence || (r.days?.length === 7 ? 'Daily' : 'Selected Days'),
      isDaily: r.days?.length === 7,
      status: 'scheduled',
    })),
    ...meals.map((m) => ({
      id: m.id,
      time: m.time,
      title: `${m.slotLabel}: ${m.title}`,
      category: 'Meals',
      type: 'Meal Checkpoint',
      frequency: 'Daily',
      isDaily: true,
      status: 'scheduled',
    })),
  ];

  const filteredTimeline = timelineItems.filter((item) => {
    if (filterFrequency === 'daily') return item.isDaily;
    if (filterFrequency === 'custom') return !item.isDaily;
    return true;
  });

  const selectedDayInfo = weekDays.find((d) => d.key === activeDay);

  return (
    <div className="schedule-view-container">
      {/* 1. Header & Weekday Selector */}
      <section className="schedule-header-card">
        <div className="schedule-top-row">
          <div>
            <h2 className="schedule-title">Master Schedule & Weekly Frequency</h2>
            <p className="schedule-subtitle">
              Inspect how your recurring routines repeat across weekdays. Daily habits repeat every day, while custom items occur on specific days.
            </p>
          </div>

          {/* Frequency Filter Toggle */}
          <div className="frequency-filter-pills">
            <button
              type="button"
              className={`filter-btn ${filterFrequency === 'all' ? 'active' : ''}`}
              onClick={() => setFilterFrequency('all')}
            >
              All Activities ({timelineItems.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filterFrequency === 'daily' ? 'active' : ''}`}
              onClick={() => setFilterFrequency('daily')}
            >
              <Icons.Repeat size={12} /> Daily
            </button>
            <button
              type="button"
              className={`filter-btn ${filterFrequency === 'custom' ? 'active' : ''}`}
              onClick={() => setFilterFrequency('custom')}
            >
              <Icons.CalendarDays size={12} /> Selected Days
            </button>
          </div>
        </div>

        {/* 7-Day Weekday Selector Bar */}
        <div className="weekday-selector-bar">
          {weekDays.map((day) => {
            const isSelected = activeDay === day.key;
            const isToday = day.isToday;

            return (
              <button
                key={day.key}
                type="button"
                className={`weekday-tab ${isSelected ? 'selected' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => setActiveDay(day.key)}
              >
                <span className="weekday-name">{day.key}</span>
                <span className="weekday-date">{day.date}</span>
                {isToday && <span className="today-chip">TODAY</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Chronological Timeline */}
      <div className="schedule-timeline-card">
        <div className="timeline-header-meta">
          <div className="meta-left">
            <Icons.Clock size={16} className="clock-icon" />
            <span className="timeline-day-heading">
              {selectedDayInfo?.label} Schedule Timeline
            </span>
          </div>
          <span className="item-count-chip">
            {filteredTimeline.length} events scheduled
          </span>
        </div>

        {filteredTimeline.length === 0 ? (
          <div className="clean-empty-state-card timeline-empty">
            <Icons.CalendarDays size={32} className="empty-icon" />
            <h3>No activities scheduled for {selectedDayInfo?.label}</h3>
            <p>
              Routines configured for {activeDay} will automatically appear on this timeline.
            </p>
            {onOpenCreateRoutine && (
              <button
                type="button"
                className="btn-primary empty-state-cta"
                onClick={onOpenCreateRoutine}
              >
                <Icons.Plus size={16} /> Add Routine for {activeDay}
              </button>
            )}
          </div>
        ) : (
          <div className="timeline-spine-wrapper">
            {filteredTimeline.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="timeline-entry-row scheduled">
                {/* Time Indicator */}
                <div className="timeline-time-col">
                  <span className="time-value">{item.time}</span>
                  <span className="type-value">{item.type}</span>
                </div>

                {/* Vertical Spine Node */}
                <div className="timeline-spine-node">
                  <div className="node-marker scheduled">
                    <span className="scheduled-core" />
                  </div>
                  {idx < filteredTimeline.length - 1 && <div className="node-line" />}
                </div>

                {/* Content Card */}
                <div className="timeline-card-col">
                  <div className="timeline-item-header">
                    <div className="title-and-badges">
                      <h4 className="timeline-item-title">{item.title}</h4>
                      <div className="timeline-badges">
                        <span className={`badge badge-${(item.category || 'personal').toLowerCase()}`}>
                          {item.category}
                        </span>
                        <span className={`frequency-badge ${item.isDaily ? 'daily' : 'custom'}`}>
                          {item.isDaily ? (
                            <>
                              <Icons.Repeat size={11} /> Daily Repeat
                            </>
                          ) : (
                            <>
                              <Icons.CalendarDays size={11} /> {item.frequency}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="status-pill scheduled">
                      <span className="status-dot" />
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
