import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { categoriesList } from '../data/sampleData';

export default function TaskModal({ isOpen, onClose, onSave, task = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('College');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'College');
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setPriority(task.priority || 'Medium');
      setTagsInput(Array.isArray(task.tags) ? task.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('College');
      setDueDate('');
      setDueTime('');
      setPriority('Medium');
      setTagsInput('');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      dueDate: dueDate.trim() || 'Anytime',
      dueTime: dueTime.trim() || 'Anytime',
      priority,
      tags: tags.length > 0 ? tags : [category],
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Icons.Tasks size={18} />
            </div>
            <div>
              <h2 className="modal-title">{task ? 'Edit Task' : 'Add New Task'}</h2>
              <p className="modal-subtitle">One-time assignment, deadline, or personal errand</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <Icons.X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Systems Lab Assignment 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description / Notes (Optional)
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              placeholder="Add key objectives, reference links, or checklist items..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row two-cols">
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">Category</label>
              <select
                id="task-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="form-row two-cols">
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="text"
                className="form-input"
                placeholder="e.g. Friday, Oct 24 or 2026-10-24"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due-time">Due Time</label>
              <input
                id="task-due-time"
                type="text"
                className="form-input"
                placeholder="e.g. 11:59 PM or 05:00 PM"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-tags">
              Tags (Comma-separated)
            </label>
            <input
              id="task-tags"
              type="text"
              className="form-input"
              placeholder="e.g. CS302, Coding, Urgent"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
