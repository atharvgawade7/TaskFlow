import React from 'react';
import { Icons } from './Icons';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemTitle = 'Item',
  itemType = 'routine', // 'routine' | 'task' | 'meal'
}) {
  if (!isOpen) return null;

  const isRoutine = itemType === 'routine';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap rose">
          <Icons.Trash size={24} />
        </div>

        <h2 className="confirm-modal-title">Delete {itemTitle}?</h2>

        {isRoutine ? (
          <div className="confirm-explanation">
            <p className="confirm-main-text">
              Are you sure you want to remove this recurring routine?
            </p>
            <div className="history-safe-callout">
              <Icons.Check size={14} className="safe-icon" />
              <span>
                <strong>Past history is safe:</strong> All previously completed records, dates, and historical consistency statistics are permanently preserved. Only future occurrences will stop appearing.
              </span>
            </div>
          </div>
        ) : (
          <p className="confirm-main-text">
            Are you sure you want to delete this {itemType}? This action cannot be undone.
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
