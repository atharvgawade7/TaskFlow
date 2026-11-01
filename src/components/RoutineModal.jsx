import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { routinePeriods } from '../data/sampleData';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RoutineModal({ isOpen, onClose, onSave, routine = null }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Personal');
  const [time, setTime] = useState('');
  const [period, setPeriod] = useState('morning');
  const [recurrenceType, setRecurrenceType] = useState('daily'); // 'daily' | 'weekdays' | 'custom'
  const [selectedDays, setSelectedDays] = useState(ALL_DAYS);
  const [applyMode, setApplyMode] = useState('future'); // 'future' | 'todayOnly'
  const [error, setError] = useState('');

  const routineCategories = ['College', 'Fitness', 'Meals', 'Study', 'Personal'];

  useEffect(() => {
    if (routine) {
      setTitle(routine.title || '');
      setNotes(routine.notes || routine.description || '');
      setCategory(routine.category || 'Personal');
      setTime(routine.time || '');
      setPeriod(routine.period || 'morning');
      const days = Array.isArray(routine.days) ? routine.days : ALL_DAYS;
      setSelectedDays(days);

      if (days.length === 7) {
        setRecurrenceType('daily');
      } else if (
        days.length === 5 &&
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every((d) => days.includes(d))
      ) {
        setRecurrenceType('weekdays');
      } else {
        setRecurrenceType('custom');
      }
      setApplyMode('future');
    } else {
      setTitle('');
      setNotes('');
      setCategory('Personal');
      setTime('');
      setPeriod('morning');
      setRecurrenceType('daily');
      setSelectedDays(ALL_DAYS);
      setApplyMode('future');
    }
    setError('');
  }, [routine, isOpen]);

  if (!isOpen) return null;

  const handleRecurrenceChange = (type) => {
    setRecurrenceType(type);
    if (type === 'daily') {
      setSelectedDays(ALL_DAYS);
    } else if (type === 'weekdays') {
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    }
  };

  const toggleDay = (day) => {
    setRecurrenceType('custom');
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // keep at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Routine title is required');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Select at least one day for this routine');
      return;
    }

    let recurrenceLabel = 'Daily';
    if (selectedDays.length === 7) {
      recurrenceLabel = 'Daily';
    } else if (
      selectedDays.length === 5 &&
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every((d) => selectedDays.includes(d))
    ) {
      recurrenceLabel = 'Mon - Fri';
    } else {
      recurrenceLabel = selectedDays.join(', ');
    }

    onSave({
      title: title.trim(),
      notes: notes.trim(),
      category,
      time: time.trim() || 'Scheduled',
      period,
      recurrence: recurrenceLabel,
      days: selectedDays,
      applyMode, // 'future' or 'todayOnly'
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge purple">
              <Icons.Repeat size={18} />
            </div>
            <div>
              <h2 className="modal-title">{routine ? 'Edit Routine' : 'Create Recurring Routine'}</h2>
              <p className="modal-subtitle">
                {routine
                  ? 'Update schedule parameters with history protection'
                  : 'Configured once; automatically generates on designated days'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <Icons.X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          {/* Edit Scope Selector for existing routines */}
          {routine && (
            <div className="history-guard-box">
              <div className="guard-header">
                <Icons.Info size={16} className="guard-icon" />
                <span className="guard-title">History Protection Rule</span>
              </div>
              <p className="guard-desc">
                Past records preserve the task title, scheduled time, and completion status as they existed. Changes never silently rewrite your history.
              </p>

              <div className="scope-radio-group">
                <label className={`scope-radio-card ${applyMode === 'future' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="applyMode"
                    value="future"
                    checked={applyMode === 'future'}
                    onChange={() => setApplyMode('future')}
                  />
                  <div className="scope-radio-text">
                    <strong>Future occurrences (Recommended)</strong>
                    <span>Updates future days; preserves all past historical logs</span>
                  </div>
                </label>

                <label className={`scope-radio-card ${applyMode === 'todayOnly' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="applyMode"
                    value="todayOnly"
                    checked={applyMode === 'todayOnly'}
                    onChange={() => setApplyMode('todayOnly')}
                  />
                  <div className="scope-radio-text">
                    <strong>Today's occurrence only</strong>
                    <span>Applies changes only to today without altering recurring template</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="routine-title">
              Routine Title <span className="required-star">*</span>
            </label>
            <input
              id="routine-title"
              type="text"
              className="form-input"
              placeholder="e.g. Morning Mobility & Core Warmup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="routine-notes">
              Description / Action Steps (Optional)
            </label>
            <textarea
              id="routine-notes"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Dynamic hip openers, 10 min plank circuit, hydration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-row three-cols">
            <div className="form-group">
              <label className="form-label" htmlFor="routine-category">Category</label>
              <select
                id="routine-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {routineCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="routine-period">Day Period</label>
              <select
                id="routine-period"
                className="form-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {routinePeriods.map((p) => (
                  <option key={p.key} value={p.key}>{p.label} ({p.timeRange})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="routine-time">Scheduled Time</label>
              <input
                id="routine-time"
                type="text"
                className="form-input"
                placeholder="e.g. 07:00 AM - 07:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div className="form-group">
            <label className="form-label">Recurrence Schedule</label>
            <div className="recurrence-presets-row">
              <button
                type="button"
                className={`preset-btn ${recurrenceType === 'daily' ? 'active' : ''}`}
                onClick={() => handleRecurrenceChange('daily')}
              >
                Every Day (Daily)
              </button>
              <button
                type="button"
                className={`preset-btn ${recurrenceType === 'weekdays' ? 'active' : ''}`}
                onClick={() => handleRecurrenceChange('weekdays')}
              >
                Weekdays (Mon - Fri)
              </button>
              <button
                type="button"
                className={`preset-btn ${recurrenceType === 'custom' ? 'active' : ''}`}
                onClick={() => setRecurrenceType('custom')}
              >
                Selected Weekdays
              </button>
            </div>

            <div className="days-checkboxes-row">
              {ALL_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`day-select-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {routine ? 'Save Routine Changes' : 'Add Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
