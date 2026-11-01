
import { supabase } from './supabaseClient'

// Weekday conversion between JavaScript and Supabase
const DAY_TO_NUMBER = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
}

const NUMBER_TO_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ======================================
// DATABASE RECORD → APP OBJECT
// ======================================

function mapRoutine(row) {
    return {
        id: row.id,
        title: row.title,
        notes: row.notes || row.description || '',
        category: row.category || 'Personal',
        time: row.time || 'Scheduled',
        period: row.period || 'morning',
        recurrence: row.recurrence || 'Daily',
        days: (row.weekdays || []).map((day) => NUMBER_TO_DAY[day]),
        createdAt: row.created_at?.slice(0, 10),
        archivedAt: row.archived_at?.slice(0, 10) || null,
        version: row.version || 1,
    }
}

function mapDailyTask(row) {
    return {
        id: `${row.occurrence_date}_${row.routine_id}`,
        databaseId: row.id,
        routineId: row.routine_id,
        title: row.title,
        time: row.time || 'Scheduled',
        category: row.category || 'Personal',
        period: row.period || 'morning',
        recurrence: row.recurrence || 'Daily',
        notes: row.notes || '',
        status: row.status,
        date: row.occurrence_date,
        isCustomized: row.is_customized || false,
        loggedAt: row.completed_at,
    }
}

function mapOneTimeTask(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        category: row.category || 'College',
        dueDate: row.due_date || 'Anytime',
        dueTime: row.due_time || 'Anytime',
        priority: row.priority || 'Medium',
        tags: row.tags || [],
        status: row.status,
        completed: row.status === 'completed',
        createdAt: row.created_at?.slice(0, 10),
        completedAt: row.completed_at,
    }
}

function mapMeal(row) {
    return {
        id: row.id,
        slotLabel: row.slot_label || row.slot,
        slotKey: row.slot,
        title: row.title || '',
        description: row.description || '',
        time: row.time || 'Scheduled',
        category: row.category || 'Balanced Fuel',
        caloriesEstimate: row.calories_estimate || '',
        status: row.is_completed ? 'eaten' : 'pending',
        mealDate: row.meal_date,
        createdAt: row.created_at?.slice(0, 10),
    }
}

// ======================================
// APP OBJECT → DATABASE RECORD
// ======================================

function routineToDatabase(routine, userId) {
    return {
        user_id: userId,
        title: routine.title,
        notes: routine.notes || '',
        description: routine.notes || '',
        category: routine.category || 'Personal',
        time: routine.time || 'Scheduled',
        period: routine.period || 'morning',
        recurrence: routine.recurrence || 'Daily',
        weekdays: (routine.days || []).map((day) => DAY_TO_NUMBER[day]),
        version: routine.version || 1,
        is_active: true,
    }
}

function taskToDatabase(task, userId) {
    return {
        user_id: userId,
        title: task.title,
        description: task.description || '',
        category: task.category || 'College',
        due_date: task.dueDate || 'Anytime',
        due_time: task.dueTime || 'Anytime',
        priority: task.priority || 'Medium',
        tags: task.tags || [],
        status: task.status || 'pending',
        completed_at: task.status === 'completed'
            ? new Date().toISOString()
            : null,
    }
}

function mealToDatabase(meal, userId, mealDate) {
    return {
        user_id: userId,
        meal_date: mealDate,
        slot: meal.slotKey || 'breakfast',
        slot_label: meal.slotLabel || 'Breakfast',
        title: meal.title,
        description: meal.description || '',
        time: meal.time || 'Scheduled',
        category: meal.category || 'Balanced Fuel',
        calories_estimate: meal.caloriesEstimate || '',
        is_completed: meal.status === 'eaten',
    }
}

// ======================================
// LOAD ALL USER DATA
// ======================================

export async function loadTaskFlowData(userId) {
    const [
        routinesResult,
        dailyTasksResult,
        tasksResult,
        mealsResult,
    ] = await Promise.all([
        supabase
            .from('routines')
            .select('*')
            .eq('user_id', userId),

        supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('occurrence_date', { ascending: true }),

        supabase
            .from('one_time_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

        supabase
            .from('meals')
            .select('*')
            .eq('user_id', userId)
            .order('meal_date', { ascending: false }),
    ])

    const error =
        routinesResult.error ||
        dailyTasksResult.error ||
        tasksResult.error ||
        mealsResult.error

    if (error) throw error

    // Reconstruct the history object expected by taskStore.js
    const history = {}

    dailyTasksResult.data.forEach((row) => {
        const activity = mapDailyTask(row)
        const date = row.occurrence_date

        if (!history[date]) {
            history[date] = {
                date,
                activities: [],
            }
        }

        history[date].activities.push(activity)
    })

    return {
        routines: routinesResult.data
            .filter((row) => row.is_active)
            .map(mapRoutine),

        tasks: tasksResult.data.map(mapOneTimeTask),

        meals: mealsResult.data.map(mapMeal),

        history,
    }
}

// ======================================
// ROUTINE OPERATIONS
// ======================================

export async function createRoutine(routine, userId) {
    const { data, error } = await supabase
        .from('routines')
        .insert(routineToDatabase(routine, userId))
        .select()
        .single()

    if (error) throw error
    return mapRoutine(data)
}

export async function updateRoutine(routineId, routine, userId) {
    const { data, error } = await supabase
        .from('routines')
        .update({
            ...routineToDatabase(routine, userId),
            updated_at: new Date().toISOString(),
            version: (routine.version || 1) + 1,
        })
        .eq('id', routineId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return mapRoutine(data)
}

export async function archiveRoutineInDatabase(routineId, userId) {
    const { error } = await supabase
        .from('routines')
        .update({
            is_active: false,
            archived_at: new Date().toISOString(),
        })
        .eq('id', routineId)
        .eq('user_id', userId)

    if (error) throw error
}

// ======================================
// DAILY TASK OPERATIONS
// ======================================

export async function saveDailyActivity(activity, date, userId) {
    const record = {
        user_id: userId,
        routine_id: activity.routineId || null,
        occurrence_date: date,
        title: activity.title,
        category: activity.category || 'Personal',
        time: activity.time || 'Scheduled',
        period: activity.period || 'morning',
        recurrence: activity.recurrence || 'Daily',
        notes: activity.notes || '',
        status: activity.status || 'pending',
        is_customized: activity.isCustomized || false,
        completed_at: activity.status === 'completed'
            ? new Date().toISOString()
            : null,
    }

    const { data, error } = await supabase
        .from('daily_tasks')
        .upsert(record, {
            onConflict: 'routine_id,occurrence_date',
        })
        .select()
        .single()

    if (error) throw error
    return mapDailyTask(data)
}

// ======================================
// ONE-TIME TASK OPERATIONS
// ======================================

export async function createOneTimeTask(task, userId) {
    const { data, error } = await supabase
        .from('one_time_tasks')
        .insert(taskToDatabase(task, userId))
        .select()
        .single()

    if (error) throw error
    return mapOneTimeTask(data)
}

export async function updateOneTimeTask(taskId, task, userId) {
    const { data, error } = await supabase
        .from('one_time_tasks')
        .update(taskToDatabase(task, userId))
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return mapOneTimeTask(data)
}

export async function deleteOneTimeTask(taskId, userId) {
    const { error } = await supabase
        .from('one_time_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)

    if (error) throw error
}

// ======================================
// MEAL OPERATIONS
// ======================================

export async function createMeal(meal, userId, mealDate) {
    const { data, error } = await supabase
        .from('meals')
        .insert(mealToDatabase(meal, userId, mealDate))
        .select()
        .single()

    if (error) throw error
    return mapMeal(data)
}

export async function updateMeal(mealId, meal, userId, mealDate) {
    const { data, error } = await supabase
        .from('meals')
        .update(mealToDatabase(meal, userId, mealDate))
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return mapMeal(data)
}

export async function deleteMeal(mealId, userId) {
    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId)

    if (error) throw error
}
