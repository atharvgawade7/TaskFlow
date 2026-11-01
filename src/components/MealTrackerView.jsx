import React from 'react';
import { Icons } from './Icons';

export default function MealTrackerView({
  meals = [],
  onToggleMeal,
  onSetMealStatus,
  onOpenCreateMeal,
  onOpenEditMeal,
  onOpenDeleteMeal,
}) {
  const totalMeals = meals.length;
  const eatenCount = meals.filter((m) => m.status === 'eaten').length;
  const skippedCount = meals.filter((m) => m.status === 'skipped').length;
  const eligibleMeals = totalMeals - skippedCount;
  const mealProgress = eligibleMeals > 0 ? Math.round((eatenCount / eligibleMeals) * 100) : 0;

  return (
    <div className="meal-tracker-container">
      {/* 1. Header & Progress Panel */}
      <section className="meal-header-panel">
        <div className="meal-header-info">
          <div className="meal-badge-title">
            <span className="badge badge-meals">
              <Icons.Meals size={13} /> NUTRITIONAL CHECKPOINTS
            </span>
          </div>
          <h2 className="meal-title">Daily Meal Tracker</h2>
          <p className="meal-subtitle">
            Configure regular nutritional checkpoints to fuel your study and training cadences throughout the day.
          </p>
        </div>

        <div className="meal-header-right-col">
          <button
            type="button"
            className="action-btn-primary"
            onClick={onOpenCreateMeal}
          >
            <Icons.Plus size={16} /> Add Meal Checkpoint
          </button>

          {/* Progress Meter */}
          {totalMeals > 0 && (
            <div className="meal-meter-box">
              <div className="meal-meter-header">
                <span className="meter-label">Daily Target</span>
                <span className="meter-count">{eatenCount} of {eligibleMeals} Logged ({mealProgress}%)</span>
              </div>

              <div className="segmented-progress-bar">
                {meals.map((meal, idx) => (
                  <div
                    key={meal.id}
                    className={`segment-step ${meal.status === 'eaten' ? 'filled' : ''} ${
                      meal.status === 'skipped' ? 'skipped-seg' : ''
                    }`}
                    title={`${meal.slotLabel}: ${meal.status}`}
                  >
                    <span className="segment-number">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Meal Slots Cards or Clean Empty State */}
      {totalMeals === 0 ? (
        <div className="clean-empty-state-card">
          <div className="empty-state-icon blue-glow">
            <Icons.Meals size={36} />
          </div>
          <h3 className="empty-state-title">No meal checkpoints yet</h3>
          <p className="empty-state-desc">
            Add your regular breakfast, lunch, post-workout, or dinner checkpoints to keep nutrition consistent.
          </p>
          <button
            type="button"
            className="btn-primary empty-state-cta"
            onClick={onOpenCreateMeal}
          >
            <Icons.Plus size={16} /> Add First Meal Checkpoint
          </button>
        </div>
      ) : (
        <div className="meal-slots-grid">
          {meals.map((meal, index) => {
            const isEaten = meal.status === 'eaten';
            const isSkipped = meal.status === 'skipped';

            return (
              <div
                key={meal.id}
                className={`meal-slot-card ${isEaten ? 'eaten' : isSkipped ? 'skipped' : 'pending'}`}
              >
                <div className="slot-card-top">
                  <div className="slot-number-badge">
                    <span>SLOT {String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div className="slot-header-actions">
                    <div className="slot-time-badge">
                      <Icons.Clock size={12} />
                      <span>{meal.time}</span>
                    </div>

                    <button
                      type="button"
                      className="item-action-btn edit-btn"
                      onClick={() => onOpenEditMeal(meal)}
                      title="Edit meal slot"
                      aria-label="Edit meal"
                    >
                      <Icons.Edit size={13} />
                    </button>
                    <button
                      type="button"
                      className="item-action-btn delete-btn"
                      onClick={() => onOpenDeleteMeal(meal)}
                      title="Delete meal slot"
                      aria-label="Delete meal"
                    >
                      <Icons.Trash size={13} />
                    </button>
                  </div>
                </div>

                <div className="slot-content">
                  <div className="slot-label-row">
                    <h3 className="slot-label">{meal.slotLabel}</h3>
                    <span className={`status-pill ${isEaten ? 'completed' : isSkipped ? 'missed' : 'pending'}`}>
                      <span className="status-dot" />
                      {isEaten ? 'Eaten' : isSkipped ? 'Skipped' : 'Pending'}
                    </span>
                  </div>

                  <h4 className="meal-item-name">{meal.title}</h4>
                  {meal.description && (
                    <p className="meal-desc-text">{meal.description}</p>
                  )}

                  <div className="meal-meta-tags">
                    {meal.category && <span className="macro-tag">{meal.category}</span>}
                    {meal.caloriesEstimate && <span className="calorie-tag">{meal.caloriesEstimate}</span>}
                  </div>
                </div>

                <div className="slot-card-footer">
                  <button
                    type="button"
                    className={`meal-toggle-btn ${isEaten ? 'btn-eaten' : 'btn-mark'}`}
                    onClick={() => onToggleMeal(meal.id)}
                  >
                    {isEaten ? (
                      <>
                        <Icons.Check size={16} /> Logged as Eaten
                      </>
                    ) : (
                      <>
                        <Icons.Clock size={16} /> Mark as Eaten
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="meal-skip-btn"
                    onClick={() => onSetMealStatus && onSetMealStatus(meal.id, isSkipped ? 'pending' : 'skipped')}
                    title={isSkipped ? 'Unskip meal' : 'Skip meal (excluded from denominator)'}
                  >
                    {isSkipped ? 'Unskip' : 'Skip'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
