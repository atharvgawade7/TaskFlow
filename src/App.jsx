
import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import React, { useState, useEffect, useMemo } from 'react'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import OverviewView from './components/OverviewView'
import RoutineView from './components/RoutineView'
import ScheduleView from './components/ScheduleView'
import MealTrackerView from './components/MealTrackerView'
import InsightsView from './components/InsightsView'
import TasksView from './components/TasksView'
import TaskModal from './components/TaskModal'
import RoutineModal from './components/RoutineModal'
import MealModal from './components/MealModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

import { getCurrentDateInfo } from './data/sampleData'
import {
  getActivitiesForDate,
  calculateCompletionMetrics,
} from './data/taskStore'

import {
  loadTaskFlowData,
  createRoutine,
  updateRoutine,
  archiveRoutineInDatabase,
  saveDailyActivity,
  createOneTimeTask,
  updateOneTimeTask,
  deleteOneTimeTask,
  createMeal,
  updateMeal,
  deleteMeal,
} from './lib/supabaseData'

import { supabase } from './lib/supabaseClient'

import './App.css'


function TaskFlowDashboard() {
  const { user, signOut } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Data loaded from Supabase
  const [routines, setRoutines] = useState([])
  const [tasks, setTasks] = useState([])
  const [meals, setMeals] = useState([])
  const [history, setHistory] = useState({})

  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  // Modal states
  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    task: null,
  })

  const [routineModal, setRoutineModal] = useState({
    isOpen: false,
    routine: null,
  })

  const [mealModal, setMealModal] = useState({
    isOpen: false,
    meal: null,
  })

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    itemType: 'routine',
    itemTitle: '',
  })

  const { dateKey: todayKey } = getCurrentDateInfo()


  // ======================================
  // LOAD USER DATA FROM SUPABASE
  // ======================================

  useEffect(() => {
    let isActive = true

    async function loadData() {
      setLoadingData(true)
      setDataError('')

      try {
        const data = await loadTaskFlowData(user.id)

        if (!isActive) return

        setRoutines(data.routines)
        setTasks(data.tasks)
        setMeals(data.meals)
        setHistory(data.history)
      } catch (error) {
        console.error('Failed to load TaskFlow data:', error)

        if (isActive) {
          setDataError(
            error.message || 'Could not load your TaskFlow data.'
          )
        }
      } finally {
        if (isActive) {
          setLoadingData(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [user.id])


  // Common error handler for database operations
  const handleDatabaseError = (action, error) => {
    console.error(`${action} failed:`, error)

    window.alert(
      `${action} failed. Please try again.\n\n${error.message || 'Unknown error'}`
    )
  }


  // ======================================
  // TODAY'S ROUTINE ACTIVITIES
  // ======================================

  const todayActivities = useMemo(() => {
    return getActivitiesForDate(todayKey, routines, history)
  }, [todayKey, routines, history])


  // Save a daily activity's status to Supabase
  const handleUpdateTodayActivityStatus = async (activityId, newStatus) => {
    const existingActivity = todayActivities.find(
      (activity) =>
        activity.id === activityId ||
        activity.routineId === activityId
    )

    if (!existingActivity) return

    const updatedActivity = {
      ...existingActivity,
      status: newStatus,
      loggedAt:
        newStatus === 'completed'
          ? new Date().toISOString()
          : null,
    }

    try {
      const savedActivity = await saveDailyActivity(
        updatedActivity,
        todayKey,
        user.id
      )

      setHistory((previousHistory) => {
        const existingActivities =
          previousHistory[todayKey]?.activities || todayActivities

        const updatedActivities = existingActivities.map((activity) =>
          activity.id === existingActivity.id
            ? savedActivity
            : activity
        )

        // Add it if this is the first saved occurrence
        if (
          !updatedActivities.some(
            (activity) => activity.id === savedActivity.id
          )
        ) {
          updatedActivities.push(savedActivity)
        }

        return {
          ...previousHistory,
          [todayKey]: {
            date: todayKey,
            activities: updatedActivities,
          },
        }
      })
    } catch (error) {
      handleDatabaseError('Updating daily activity', error)
    }
  }


  const handleToggleActivityStatus = (activityId, currentStatus) => {
    let nextStatus = 'completed'

    if (currentStatus === 'completed') nextStatus = 'pending'
    else if (currentStatus === 'pending') nextStatus = 'completed'
    else if (currentStatus === 'missed') nextStatus = 'completed'
    else if (currentStatus === 'skipped') nextStatus = 'pending'

    handleUpdateTodayActivityStatus(activityId, nextStatus)
  }


  // ======================================
  // ONE-TIME TASK HANDLERS
  // ======================================

  const handleToggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    const isDone = !task.completed

    const updatedTask = {
      ...task,
      completed: isDone,
      status: isDone ? 'completed' : 'pending',
    }

    try {
      const savedTask = await updateOneTimeTask(
        id,
        updatedTask,
        user.id
      )

      setTasks((previous) =>
        previous.map((item) =>
          item.id === id ? savedTask : item
        )
      )
    } catch (error) {
      handleDatabaseError('Updating task', error)
    }
  }


  const handleSetTaskStatus = async (id, newStatus) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    const updatedTask = {
      ...task,
      status: newStatus,
      completed: newStatus === 'completed',
    }

    try {
      const savedTask = await updateOneTimeTask(
        id,
        updatedTask,
        user.id
      )

      setTasks((previous) =>
        previous.map((item) =>
          item.id === id ? savedTask : item
        )
      )
    } catch (error) {
      handleDatabaseError('Updating task status', error)
    }
  }


  const handleSaveTask = async (taskData) => {
    try {
      if (taskModal.task) {
        const updatedTask = {
          ...taskModal.task,
          ...taskData,
        }

        const savedTask = await updateOneTimeTask(
          taskModal.task.id,
          updatedTask,
          user.id
        )

        setTasks((previous) =>
          previous.map((task) =>
            task.id === savedTask.id ? savedTask : task
          )
        )
      } else {
        const newTask = {
          ...taskData,
          completed: false,
          status: 'pending',
        }

        const savedTask = await createOneTimeTask(
          newTask,
          user.id
        )

        setTasks((previous) => [savedTask, ...previous])
      }

      setTaskModal({ isOpen: false, task: null })
    } catch (error) {
      handleDatabaseError('Saving task', error)
    }
  }


  // ======================================
  // ROUTINE HANDLERS
  // ======================================

  const handleSaveRoutine = async (routineData) => {
    const { applyMode, ...cleanData } = routineData

    try {
      if (routineModal.routine) {
        // Today's-only edit changes today's snapshot,
        // not the recurring routine definition.
        if (applyMode === 'todayOnly') {
          const existingActivity = todayActivities.find(
            (activity) =>
              activity.routineId === routineModal.routine.id
          )

          if (existingActivity) {
            const updatedActivity = {
              ...existingActivity,
              ...cleanData,
              isCustomized: true,
            }

            const savedActivity = await saveDailyActivity(
              updatedActivity,
              todayKey,
              user.id
            )

            setHistory((previousHistory) => {
              const activities =
                previousHistory[todayKey]?.activities ||
                todayActivities

              return {
                ...previousHistory,
                [todayKey]: {
                  date: todayKey,
                  activities: activities.map((activity) =>
                    activity.id === existingActivity.id
                      ? savedActivity
                      : activity
                  ),
                },
              }
            })
          }
        } else {
          // Future edit updates the routine definition.
          const updatedRoutine = {
            ...routineModal.routine,
            ...cleanData,
          }

          const savedRoutine = await updateRoutine(
            routineModal.routine.id,
            updatedRoutine,
            user.id
          )

          setRoutines((previous) =>
            previous.map((routine) =>
              routine.id === savedRoutine.id
                ? savedRoutine
                : routine
            )
          )
        }
      } else {
        const savedRoutine = await createRoutine(
          cleanData,
          user.id
        )

        setRoutines((previous) => [
          ...previous,
          savedRoutine,
        ])
      }

      setRoutineModal({ isOpen: false, routine: null })
    } catch (error) {
      handleDatabaseError('Saving routine', error)
    }
  }


  // ======================================
  // MEAL HANDLERS
  // ======================================

  const handleToggleMeal = async (id) => {
    const meal = meals.find((item) => item.id === id)
    if (!meal) return

    const updatedMeal = {
      ...meal,
      status: meal.status === 'eaten' ? 'pending' : 'eaten',
    }

    try {
      const savedMeal = await updateMeal(
        id,
        updatedMeal,
        user.id,
        meal.mealDate || todayKey
      )

      setMeals((previous) =>
        previous.map((item) =>
          item.id === id ? savedMeal : item
        )
      )
    } catch (error) {
      handleDatabaseError('Updating meal', error)
    }
  }


  const handleSetMealStatus = async (id, newStatus) => {
    const meal = meals.find((item) => item.id === id)
    if (!meal) return

    const updatedMeal = {
      ...meal,
      status: newStatus,
    }

    try {
      const savedMeal = await updateMeal(
        id,
        updatedMeal,
        user.id,
        meal.mealDate || todayKey
      )

      setMeals((previous) =>
        previous.map((item) =>
          item.id === id ? savedMeal : item
        )
      )
    } catch (error) {
      handleDatabaseError('Updating meal status', error)
    }
  }


  const handleSaveMeal = async (mealData) => {
    try {
      if (mealModal.meal) {
        const updatedMeal = {
          ...mealModal.meal,
          ...mealData,
        }

        const savedMeal = await updateMeal(
          mealModal.meal.id,
          updatedMeal,
          user.id,
          mealModal.meal.mealDate || todayKey
        )

        setMeals((previous) =>
          previous.map((meal) =>
            meal.id === savedMeal.id ? savedMeal : meal
          )
        )
      } else {
        const newMeal = {
          ...mealData,
          status: 'pending',
        }

        const savedMeal = await createMeal(
          newMeal,
          user.id,
          todayKey
        )

        setMeals((previous) => [...previous, savedMeal])
      }

      setMealModal({ isOpen: false, meal: null })
    } catch (error) {
      handleDatabaseError('Saving meal', error)
    }
  }


  // ======================================
  // DELETE HANDLER
  // ======================================

  const handleConfirmDelete = async () => {
    const { item, itemType } = deleteModal
    if (!item) return

    try {
      if (itemType === 'routine') {
        // Archive instead of deleting: keeps old records intact.
        await archiveRoutineInDatabase(item.id, user.id)

        setRoutines((previous) =>
          previous.filter((routine) => routine.id !== item.id)
        )
      } else if (itemType === 'task') {
        await deleteOneTimeTask(item.id, user.id)

        setTasks((previous) =>
          previous.filter((task) => task.id !== item.id)
        )
      } else if (itemType === 'meal') {
        await deleteMeal(item.id, user.id)

        setMeals((previous) =>
          previous.filter((meal) => meal.id !== item.id)
        )
      }

      setDeleteModal({
        isOpen: false,
        item: null,
        itemType: 'routine',
        itemTitle: '',
      })
    } catch (error) {
      handleDatabaseError('Deleting item', error)
    }
  }


  // ======================================
  // RESET USER DATA
  // ======================================

  const handleResetData = async () => {
    const confirmed = window.confirm(
      'Reset all TaskFlow data to a clean initial state? Genuine past records will be cleared.'
    )

    if (!confirmed) return

    try {
      // Delete only records belonging to the signed-in user.
      // Daily tasks are deleted before routines.
      const tables = [
        'daily_tasks',
        'one_time_tasks',
        'meals',
        'routines',
      ]

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)

        if (error) throw error
      }

      setRoutines([])
      setTasks([])
      setMeals([])
      setHistory({})
    } catch (error) {
      handleDatabaseError('Resetting TaskFlow data', error)
    }
  }


  // ======================================
  // COMPLETION METRICS
  // ======================================

  const combinedActivitiesForStats = [
    ...todayActivities,
    ...meals.map((meal) => ({
      status: meal.status === 'eaten' ? 'completed' : meal.status,
    })),
  ]

  const { rate: completionRate } =
    calculateCompletionMetrics(combinedActivitiesForStats)

  const pendingTasksCount = tasks.filter(
    (task) => !task.completed
  ).length


  // ======================================
  // LOADING / ERROR STATES
  // ======================================

  if (loadingData) {
    return (
      <div className="auth-loading">
        Loading your TaskFlow data...
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="auth-loading">
        <p>We couldn't load your TaskFlow data.</p>
        <p>{dataError}</p>
        <button onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    )
  }


  // ======================================
  // DASHBOARD UI
  // ======================================

  return (
    <div className="taskflow-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completionRate={completionRate}
        routinesCount={routines.length}
        pendingTasksCount={pendingTasksCount}
        mealsCount={meals.length}
      />

      <div className="taskflow-main">
        <Header
          activeTab={activeTab}
          onMobileMenuToggle={() =>
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }
          isMobileMenuOpen={isMobileMenuOpen}
          completionRate={completionRate}
          onResetData={handleResetData}
          onSignOut={async () => {
            const { error } = await signOut()

            if (error) {
              console.error('Sign out failed:', error)
              window.alert('Could not sign out. Please try again.')
            }
          }}
        />

        <main className="taskflow-content-body">
          {activeTab === 'overview' && (
            <OverviewView
              routines={routines}
              meals={meals}
              tasks={tasks}
              todayActivities={todayActivities}
              history={history}
              setActiveTab={setActiveTab}
              onToggleStatus={handleToggleActivityStatus}
              onOpenCreateRoutine={() =>
                setRoutineModal({ isOpen: true, routine: null })
              }
              onOpenCreateTask={() =>
                setTaskModal({ isOpen: true, task: null })
              }
            />
          )}

          {activeTab === 'routine' && (
            <RoutineView
              routines={routines}
              todayActivities={todayActivities}
              onToggleStatus={handleToggleActivityStatus}
              onSetStatus={handleUpdateTodayActivityStatus}
              onOpenCreateRoutine={() =>
                setRoutineModal({ isOpen: true, routine: null })
              }
              onOpenEditRoutine={(routine) =>
                setRoutineModal({ isOpen: true, routine })
              }
              onOpenDeleteRoutine={(routine) =>
                setDeleteModal({
                  isOpen: true,
                  item: routine,
                  itemType: 'routine',
                  itemTitle: routine.title,
                })
              }
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              routines={routines}
              meals={meals}
              onOpenCreateRoutine={() =>
                setRoutineModal({ isOpen: true, routine: null })
              }
            />
          )}

          {activeTab === 'meals' && (
            <MealTrackerView
              meals={meals}
              onToggleMeal={handleToggleMeal}
              onSetMealStatus={handleSetMealStatus}
              onOpenCreateMeal={() =>
                setMealModal({ isOpen: true, meal: null })
              }
              onOpenEditMeal={(meal) =>
                setMealModal({ isOpen: true, meal })
              }
              onOpenDeleteMeal={(meal) =>
                setDeleteModal({
                  isOpen: true,
                  item: meal,
                  itemType: 'meal',
                  itemTitle: meal.title || meal.slotLabel,
                })
              }
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              routines={routines}
              tasks={tasks}
              meals={meals}
              history={history}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onSetTaskStatus={handleSetTaskStatus}
              onOpenCreateTask={() =>
                setTaskModal({ isOpen: true, task: null })
              }
              onOpenEditTask={(task) =>
                setTaskModal({ isOpen: true, task })
              }
              onOpenDeleteTask={(task) =>
                setDeleteModal({
                  isOpen: true,
                  item: task,
                  itemType: 'task',
                  itemTitle: task.title,
                })
              }
            />
          )}
        </main>
      </div>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <TaskModal
        isOpen={taskModal.isOpen}
        onClose={() =>
          setTaskModal({ isOpen: false, task: null })
        }
        onSave={handleSaveTask}
        task={taskModal.task}
      />

      <RoutineModal
        isOpen={routineModal.isOpen}
        onClose={() =>
          setRoutineModal({ isOpen: false, routine: null })
        }
        onSave={handleSaveRoutine}
        routine={routineModal.routine}
      />

      <MealModal
        isOpen={mealModal.isOpen}
        onClose={() =>
          setMealModal({ isOpen: false, meal: null })
        }
        onSave={handleSaveMeal}
        meal={mealModal.meal}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            item: null,
            itemType: 'routine',
            itemTitle: '',
          })
        }
        onConfirm={handleConfirmDelete}
        itemTitle={deleteModal.itemTitle}
        itemType={deleteModal.itemType}
      />
    </div>
  )
}


export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="auth-loading">Loading TaskFlow...</div>
  }

  if (!user) {
    return <AuthPage />
  }

  return <TaskFlowDashboard />
}
