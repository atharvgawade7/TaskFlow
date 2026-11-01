// TaskFlow - Persistent State & History Management Engine
// Implements strict history protection:
// 1. Routine updates/deletions never alter past recorded activities.
// 2. Routine deletions set an archive date preventing future generation without wiping historical logs.
// 3. Past records preserve frozen title, time, date, category, and status.
// 4. Skipped activities are excluded from completion rate denominators.
// 5. Zero sample data loaded by default.

import { getCurrentDateInfo } from './sampleData';

const STORAGE_KEYS = {
  ROUTINES: 'taskflow_routines_v2',
  TASKS: 'taskflow_tasks_v2',
  MEALS: 'taskflow_meals_v2',
  HISTORY: 'taskflow_history_v2',
  META: 'taskflow_meta_v2',
};

// Check if localStorage has legacy mock/sample data and clean it if needed
export const checkAndCleanLegacySampleData = () => {
  try {
    const rawRoutines = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (rawRoutines) {
      const parsed = JSON.parse(rawRoutines);
      // If legacy sample routine ID 'r1' is present from previous version
      if (Array.isArray(parsed) && parsed.some((r) => r.id === 'r1' || r.id === 'r2')) {
        localStorage.removeItem(STORAGE_KEYS.ROUTINES);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.MEALS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      }
    }
  } catch (e) {
    console.error('Error checking legacy data:', e);
  }
};

// Run check once on module load
checkAndCleanLegacySampleData();

// Storage helper with error catching
export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

// Clear all data (user-initiated clean reset)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};

// Generate a unique ID with timestamp
export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

// Format time string to 12-hour format if entered as HH:MM
export const formatTimeString = (timeInput) => {
  if (!timeInput) return '';
  if (timeInput.includes('AM') || timeInput.includes('PM')) return timeInput;

  const parts = timeInput.split(':');
  if (parts.length < 2) return timeInput;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
};

// Helper to determine day of week for a YYYY-MM-DD date key
export const getDayOfWeekShort = (dateKey) => {
  const parts = dateKey.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return shortDays[d.getDay()];
};

/**
 * Get or initialize activities for a specific dateKey (YYYY-MM-DD).
 * If records are already stored in history for this date, returns them.
 * If not, and date is today, generates occurrences from active routines without overwriting past history.
 */
export const getActivitiesForDate = (dateKey, routines = [], history = {}) => {
  if (history[dateKey] && Array.isArray(history[dateKey].activities)) {
    return history[dateKey].activities;
  }

  const dayShort = getDayOfWeekShort(dateKey);
  const nowInfo = getCurrentDateInfo();
  const isFutureOrToday = dateKey >= nowInfo.dateKey;

  // Generate activities from active routines matching this day of week
  const generated = [];

  routines.forEach((routine) => {
    // Check if routine existed on or before this date
    if (routine.createdAt && routine.createdAt > dateKey) {
      return;
    }

    // Check if routine was archived/deleted before this date
    if (routine.archivedAt && routine.archivedAt <= dateKey) {
      return;
    }

    // Check if routine runs on this day of week
    if (Array.isArray(routine.days) && routine.days.includes(dayShort)) {
      generated.push({
        id: `${dateKey}_${routine.id}`,
        routineId: routine.id,
        title: routine.title,
        time: routine.time,
        category: routine.category || 'Personal',
        period: routine.period || 'morning',
        recurrence: routine.recurrence || 'Daily',
        notes: routine.notes || routine.description || '',
        status: isFutureOrToday ? 'pending' : 'missed',
        date: dateKey,
      });
    }
  });

  return generated;
};

/**
 * Calculate completion metrics for a list of activities.
 * Strictly excludes 'skipped' activities from the denominator.
 */
export const calculateCompletionMetrics = (activities = []) => {
  if (!activities || activities.length === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      missed: 0,
      skipped: 0,
      eligible: 0,
      rate: 0,
      hasActivities: false,
    };
  }

  const completed = activities.filter((a) => a.status === 'completed' || a.status === 'eaten').length;
  const missed = activities.filter((a) => a.status === 'missed').length;
  const skipped = activities.filter((a) => a.status === 'skipped').length;
  const pending = activities.filter((a) => a.status === 'pending').length;

  const total = activities.length;
  // Skipped / not applicable activities are excluded from denominator
  const eligible = total - skipped;
  const rate = eligible > 0 ? Math.round((completed / eligible) * 100) : 0;

  return {
    total,
    completed,
    pending,
    missed,
    skipped,
    eligible,
    rate,
    hasActivities: true,
  };
};

/**
 * Look up or compute stats for any calendar dateKey
 */
export const getDayStatistics = (dateKey, routines = [], history = {}) => {
  const activities = getActivitiesForDate(dateKey, routines, history);
  return {
    dateKey,
    ...calculateCompletionMetrics(activities),
    activities,
  };
};

/**
 * Immutable Routine Update:
 * - If applyMode === 'todayOnly': updates only today's snapshot in history.
 * - If applyMode === 'future': updates routine template for future days. Past history records remain frozen.
 */
export const applyRoutineUpdate = ({
  routines,
  setRoutines,
  history,
  setHistory,
  routineId,
  updatedData,
  applyMode = 'future',
  currentDateKey,
}) => {
  if (applyMode === 'todayOnly') {
    // Only update occurrence snapshot for today
    const currentActivities = getActivitiesForDate(currentDateKey, routines, history);
    const updatedActivities = currentActivities.map((act) => {
      if (act.routineId === routineId || act.id === `${currentDateKey}_${routineId}`) {
        return {
          ...act,
          title: updatedData.title ?? act.title,
          time: updatedData.time ?? act.time,
          category: updatedData.category ?? act.category,
          notes: updatedData.notes ?? updatedData.description ?? act.notes,
          isCustomized: true,
        };
      }
      return act;
    });

    const newHistory = {
      ...history,
      [currentDateKey]: {
        date: currentDateKey,
        activities: updatedActivities,
      },
    };
    setHistory(newHistory);
    saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
  } else {
    // Apply to future occurrences by updating the routine definition
    const updatedRoutines = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          ...updatedData,
          version: (r.version || 1) + 1,
        };
      }
      return r;
    });
    setRoutines(updatedRoutines);
    saveToStorage(STORAGE_KEYS.ROUTINES, updatedRoutines);

    // Also update today's occurrence if pending
    if (history[currentDateKey]) {
      const todayActivities = (history[currentDateKey].activities || []).map((act) => {
        if (act.routineId === routineId && act.status === 'pending') {
          return {
            ...act,
            title: updatedData.title ?? act.title,
            time: updatedData.time ?? act.time,
            category: updatedData.category ?? act.category,
            notes: updatedData.notes ?? updatedData.description ?? act.notes,
          };
        }
        return act;
      });

      const newHistory = {
        ...history,
        [currentDateKey]: {
          date: currentDateKey,
          activities: todayActivities,
        },
      };
      setHistory(newHistory);
      saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
    }
  }
};

/**
 * Immutable Routine Deletion:
 * - Prevents future occurrences from generating by setting archivedAt = currentDateKey.
 * - Leaves all past records in history completely intact with their original titles and completion statuses.
 * - Removes today's uncompleted occurrence if desired.
 */
export const archiveRoutine = ({
  routines,
  setRoutines,
  history,
  setHistory,
  routineId,
  currentDateKey,
}) => {
  // 1. Mark archived in routine template
  const updatedRoutines = routines.map((r) => {
    if (r.id === routineId) {
      return {
        ...r,
        archivedAt: currentDateKey,
      };
    }
    return r;
  });
  setRoutines(updatedRoutines);
  saveToStorage(STORAGE_KEYS.ROUTINES, updatedRoutines);

  // 2. Remove from today's active uncompleted activities if present
  if (history[currentDateKey] && Array.isArray(history[currentDateKey].activities)) {
    const updatedActivities = history[currentDateKey].activities.filter((act) => {
      if (act.routineId === routineId && act.status === 'pending') {
        return false; // remove pending
      }
      return true; // keep completed/missed records
    });

    const newHistory = {
      ...history,
      [currentDateKey]: {
        date: currentDateKey,
        activities: updatedActivities,
      },
    };
    setHistory(newHistory);
    saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
  }
};
