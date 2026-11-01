// TaskFlow - Core Data Definitions & Clean Defaults
// Preloaded sample tasks, routines, meals, and historical statistics have been removed.
// All lists start completely empty until created by the user.

export const getCurrentDateInfo = () => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shortDay = shortDays[now.getDay()];

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = now.getHours();
  let timePhase = 'Morning Phase (06:00 - 12:00)';
  let greeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timePhase = 'Afternoon Phase (12:00 - 17:00)';
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    timePhase = 'Evening Phase (17:00 - 21:00)';
    greeting = 'Good evening';
  } else if (hour >= 21 || hour < 6) {
    timePhase = 'Night Wind-Down (21:00 - 06:00)';
    greeting = 'Good evening';
  }

  // YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  return {
    dateStr,
    dayName,
    shortDay,
    timePhase,
    greeting,
    dateKey,
    now,
  };
};

export const currentUser = {
  name: "User",
  role: "TaskFlow Member",
  get dateStr() {
    return getCurrentDateInfo().dateStr;
  },
  get greeting() {
    return `${getCurrentDateInfo().greeting}!`;
  },
  get currentTimePhase() {
    return getCurrentDateInfo().timePhase;
  },
};

// 1. CLEAN INITIAL ROUTINES (Empty by default)
export const initialRoutines = [];

// 2. CLEAN INITIAL MEALS (Empty by default)
export const initialMeals = [];

// 3. CLEAN INITIAL ONE-TIME TASKS (Empty by default)
export const initialOneTimeTasks = [];

// 4. CLEAN INITIAL ACTIVITY HISTORY (Empty by default)
export const initialHistory = {};

// Categories supported across the app
export const categoriesList = [
  'College',
  'Fitness',
  'Meals',
  'Study',
  'Personal',
  'Errands',
  'Health',
];

// Recurrence periods supported across routines
export const routinePeriods = [
  { key: 'morning', label: 'Morning', timeRange: '06:00 - 12:00' },
  { key: 'afternoon', label: 'Afternoon', timeRange: '12:00 - 17:00' },
  { key: 'evening', label: 'Evening', timeRange: '17:00 - 20:30' },
  { key: 'night', label: 'Night', timeRange: '20:30 - 23:30' },
];

// Helper to generate the current 7-day week (Mon - Sun)
export const getCurrentWeekDays = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday
  // Distance to Monday: if Sunday (0), distance is -6 days; otherwise 1 - currentDay
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const shortKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;

  return shortKeys.map((key, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const dateFormatted = `${monthShort} ${d.getDate()}`;

    return {
      key,
      label: fullLabels[idx],
      date: dateFormatted,
      dateKey,
      isToday: dateKey === todayKey,
    };
  });
};
