import React, { useState } from 'react';
import { Icons } from './Icons';

export default function TasksView({
  tasks = [],
  onToggleTask,
  onSetTaskStatus,
  onOpenCreateTask,
  onOpenEditTask,
  onOpenDeleteTask,
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | completed | missed | skipped
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'College', 'Fitness', 'Meals', 'Study', 'Personal', 'Errands', 'Health'];

  const filteredTasks = tasks.filter((t) => {
    const status = t.status || (t.completed ? 'completed' : 'pending');
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => (t.status || (t.completed ? 'completed' : 'pending')) === 'pending').length;
  const completedCount = tasks.filter((t) => (t.status || (t.completed ? 'completed' : 'pending')) === 'completed').length;
  const missedCount = tasks.filter((t) => t.status === 'missed').length;
  const skippedCount = tasks.filter((t) => t.status === 'skipped').length;

  return (
    <div className="tasks-view-container">
      {/* 1. Header & Explanation Banner */}
      <section className="engine-banner-card tasks-banner">
        <div className="banner-left">
          <div className="banner-icon-box">
            <Icons.Tasks size={20} />
          </div>
          <div>
            <h2 className="banner-title">One-Time Tasks & Coursework</h2>
            <p className="banner-text">
              Dedicated space for college assignments, semester deadlines, and personal errands.
              Unlike recurring daily routines, these finish once completed or can be rescheduled as needed.
            </p>
          </div>
        </div>

        <div className="banner-right-actions">
          <button
            type="button"
            className="action-btn-primary"
            onClick={onOpenCreateTask}
          >
            <Icons.Plus size={16} /> Add Task
          </button>
        </div>
      </section>

      {/* 2. Status Metric Chips */}
      <div className="routine-summary-strip">
        <div className="chip-item">
          <span className="chip-dot silver" />
          <span className="chip-label">Pending: <strong>{pendingCount}</strong></span>
        </div>
        <div className="chip-item">
          <span className="chip-dot green" />
          <span className="chip-label">Completed: <strong>{completedCount}</strong></span>
        </div>
        {missedCount > 0 && (
          <div className="chip-item">
            <span className="chip-dot rose" />
            <span className="chip-label">Missed: <strong>{missedCount}</strong></span>
          </div>
        )}
        {skippedCount > 0 && (
          <div className="chip-item">
            <span className="chip-dot neutral" />
            <span className="chip-label">Skipped: <strong>{skippedCount}</strong></span>
          </div>
        )}
      </div>

      {/* 3. Filters & Controls Bar */}
      <div className="tasks-controls-bar">
        {/* Status Filters */}
        <div className="status-filter-pills">
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({completedCount})
          </button>
          {missedCount > 0 && (
            <button
              type="button"
              className={`filter-btn ${filterStatus === 'missed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('missed')}
            >
              Missed ({missedCount})
            </button>
          )}
          {skippedCount > 0 && (
            <button
              type="button"
              className={`filter-btn ${filterStatus === 'skipped' ? 'active' : ''}`}
              onClick={() => setFilterStatus('skipped')}
            >
              Skipped ({skippedCount})
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="category-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-chip ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tasks List or Empty State */}
      <div className="tasks-list-stack">
        {tasks.length === 0 ? (
          <div className="clean-empty-state-card">
            <div className="empty-state-icon purple-glow">
              <Icons.Tasks size={36} />
            </div>
            <h3 className="empty-state-title">No tasks yet</h3>
            <p className="empty-state-desc">
              Track university coursework, project deliverables, and personal errands with custom due dates and priorities.
            </p>
            <button
              type="button"
              className="btn-primary empty-state-cta"
              onClick={onOpenCreateTask}
            >
              <Icons.Plus size={16} /> Add Your First Task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-tasks-card">
            <Icons.Check size={28} className="empty-icon" />
            <h3>No tasks match the active filters</h3>
            <p>Try clearing your status or category filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = task.status || (task.completed ? 'completed' : 'pending');
            const isCompleted = status === 'completed';
            const isMissed = status === 'missed';
            const isSkipped = status === 'skipped';
            const priorityClass = (task.priority || 'medium').toLowerCase();

            return (
              <div
                key={task.id}
                className={`task-item-card ${status}`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  className={`task-checkbox ${isCompleted ? 'checked' : ''} ${isMissed ? 'missed' : ''} ${isSkipped ? 'skipped' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Toggle task: ${task.title}`}
                  title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                >
                  {isCompleted && <Icons.Check size={14} />}
                  {isMissed && <Icons.AlertCircle size={14} />}
                  {isSkipped && <Icons.Skip size={14} />}
                </button>

                {/* Main Details */}
                <div className="task-main-col">
                  <div className="task-title-row">
                    <h3 className={`task-title ${isCompleted ? 'strikethrough' : ''} ${isSkipped ? 'dimmed' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="task-badge-row">
                      <span className={`badge badge-${(task.category || 'personal').toLowerCase()}`}>
                        {task.category || 'Personal'}
                      </span>
                      <span className={`priority-pill ${priorityClass}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="task-desc-text">{task.description}</p>
                  )}

                  <div className="task-footer-meta">
                    <div className="task-due-date">
                      <Icons.Clock size={12} />
                      <span>
                        Due: <strong>{task.dueDate || 'Anytime'}</strong> {task.dueTime ? `(${task.dueTime})` : ''}
                      </span>
                    </div>

                    {Array.isArray(task.tags) && task.tags.length > 0 && (
                      <div className="task-tags-group">
                        {task.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Selector & Action Controls */}
                <div className="task-actions-col">
                  <select
                    className={`status-select-badge ${status}`}
                    value={status}
                    onChange={(e) => onSetTaskStatus(task.id, e.target.value)}
                    title="Change status"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                    <option value="skipped">Skipped</option>
                  </select>

                  <div className="row-action-buttons">
                    <button
                      type="button"
                      className="item-action-btn edit-btn"
                      onClick={() => onOpenEditTask(task)}
                      title="Edit or reschedule task"
                      aria-label="Edit task"
                    >
                      <Icons.Edit size={14} />
                    </button>
                    <button
                      type="button"
                      className="item-action-btn delete-btn"
                      onClick={() => onOpenDeleteTask(task)}
                      title="Delete task"
                      aria-label="Delete task"
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
    </div>
  );
}
