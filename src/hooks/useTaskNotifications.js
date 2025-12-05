import { useEffect, useRef } from 'react'
import { useProject } from '../contexts/ProjectContext.jsx'
import notificationService from '../services/notificationService.js'

/**
 * Hook to manage task notifications
 * Checks for due tasks periodically and shows browser notifications
 */
export const useTaskNotifications = (options = {}) => {
  const { tasks, loadTasksByProject } = useProject()
  const {
    enabled = true,
    checkInterval = 60000, // Check every minute (60000ms)
    notifyOverdue = true,
    notifyDueToday = true,
    notifyDueSoon = true,
    daysAhead = 1,
    onTaskClick = null
  } = options

  const intervalRef = useRef(null)
  const notifiedTasksRef = useRef(new Set()) // Track which tasks we've already notified

  // Request permission on mount
  useEffect(() => {
    if (enabled && 'Notification' in window) {
      notificationService.requestPermission().then(granted => {
        if (granted) {
          console.log('✅ Notification permission granted')
        } else {
          console.log('❌ Notification permission denied')
        }
      })
    }
  }, [enabled])

  // Check for due tasks
  const checkDueTasks = () => {
    if (!enabled || notificationService.permission !== 'granted') {
      return
    }

    if (!tasks || tasks.length === 0) {
      return
    }

    // Filter tasks that need notification
    const tasksToNotify = tasks.filter(task => {
      // Skip if already notified
      if (notifiedTasksRef.current.has(task.id)) {
        return false
      }

      // Skip completed tasks
      if (task.status === 'DONE') {
        return false
      }

      // Check if task is due
      const isOverdue = notificationService.isTaskDue(task) && 
                       !notificationService.isTaskDueSoon(task, 0)
      const isDueToday = notificationService.isTaskDueSoon(task, 0)
      const isDueSoon = notificationService.isTaskDueSoon(task, daysAhead) && !isDueToday

      return (
        (isOverdue && notifyOverdue) ||
        (isDueToday && notifyDueToday) ||
        (isDueSoon && notifyDueSoon)
      )
    })

    // Notify for each due task
    tasksToNotify.forEach(task => {
      const onClick = onTaskClick 
        ? () => onTaskClick(task)
        : () => {
            // Default: focus window
            window.focus()
          }

      notificationService.notifyDueTask(task, onClick)
      notifiedTasksRef.current.add(task.id)
    })
  }

  // Set up periodic checking
  useEffect(() => {
    if (!enabled) {
      return
    }

    // Initial check
    checkDueTasks()

    // Set up interval
    intervalRef.current = setInterval(() => {
      checkDueTasks()
    }, checkInterval)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, tasks, checkInterval, notifyOverdue, notifyDueToday, notifyDueSoon, daysAhead, onTaskClick])

  // Reset notified tasks when tasks change significantly
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Reset notifications for tasks that are no longer due
      const currentTaskIds = new Set(tasks.map(t => t.id))
      notifiedTasksRef.current.forEach(taskId => {
        if (!currentTaskIds.has(taskId)) {
          notifiedTasksRef.current.delete(taskId)
        }
      })
    }
  }, [tasks])

  return {
    permission: notificationService.permission,
    requestPermission: () => notificationService.requestPermission(),
    checkDueTasks,
    clearNotifications: () => {
      notifiedTasksRef.current.clear()
    }
  }
}

