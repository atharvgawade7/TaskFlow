import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export default function MealModal({ isOpen, onClose, onSave, meal = null }) {
  const [slotLabel, setSlotLabel] = useState('Breakfast');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('Balanced Fuel');
  const [caloriesEstimate, setCaloriesEstimate] = useState('');
  const [error, setError] = useState('');

  const defaultSlots = ['Breakfast', 'Lunch', 'Evening Snack', 'Dinner', 'Pre-bed Meal', 'Custom Slot'];

  useEffect(() => {
    if (meal) {
      setSlotLabel(meal.slotLabel || 'Breakfast');
      setTitle(meal.title || '');
      setDescription(meal.description || '');
      setTime(meal.time || '');
      setCategory(meal.category || 'Balanced Fuel');
      setCaloriesEstimate(meal.caloriesEstimate || '');
    } else {
      setSlotLabel('Breakfast');
      setTitle('');
      setDescription('');
      setTime('08:00 AM');
      setCategory('Balanced Fuel');
      setCaloriesEstimate('');
    }
    setError('');
  }, [meal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Meal title or item name is required');
      return;
    }

    onSave({
      slotLabel: slotLabel.trim(),
      slotKey: slotLabel.toLowerCase().replace(/\s+/g, '-'),
      title: title.trim(),
      description: description.trim(),
      time: time.trim() || 'Scheduled',
      category: category.trim(),
      caloriesEstimate: caloriesEstimate.trim(),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge blue">
              <Icons.Meals size={18} />
            </div>
            <div>
              <h2 className="modal-title">{meal ? 'Edit Meal Checkpoint' : 'Add Meal Checkpoint'}</h2>
              <p className="modal-subtitle">Structured nutritional checkpoint on your daily schedule</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <Icons.X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-row two-cols">
            <div className="form-group">
              <label className="form-label" htmlFor="meal-slot">Meal Slot</label>
              <select
                id="meal-slot"
                className="form-select"
                value={slotLabel}
                onChange={(e) => setSlotLabel(e.target.value)}
              >
                {defaultSlots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="meal-time">Scheduled Time</label>
              <input
                id="meal-time"
                type="text"
                className="form-input"
                placeholder="e.g. 08:15 AM or 01:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="meal-title">
              Meal Title / Focus <span className="required-star">*</span>
            </label>
            <input
              id="meal-title"
              type="text"
              className="form-input"
              placeholder="e.g. Protein Oatmeal Bowl with Berries & Seeds"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="meal-description">
              Meal Details / Ingredients
            </label>
            <textarea
              id="meal-description"
              className="form-textarea"
              rows={2}
              placeholder="e.g. Rolled oats, whey scoop, fresh blueberries, chia seeds & crushed walnuts"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row two-cols">
            <div className="form-group">
              <label className="form-label" htmlFor="meal-category">Nutrition Category</label>
              <input
                id="meal-category"
                type="text"
                className="form-input"
                placeholder="e.g. High Protein, Balanced Fuel, Recovery"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="meal-calories">Calories / Macro Note (Optional)</label>
              <input
                id="meal-calories"
                type="text"
                className="form-input"
                placeholder="e.g. 500 kcal or 40g Protein"
                value={caloriesEstimate}
                onChange={(e) => setCaloriesEstimate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {meal ? 'Save Meal' : 'Add Meal Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
