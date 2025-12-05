// Browser Notification Service
class NotificationService {
  constructor() {
    this.permission = null
    this.checkPermission()
  }

  // Check current notification permission status
  checkPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }
    this.permission = Notification.permission
    return true
  }

  // Request notification permission from user
  async requestPermission() {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission was denied')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (!('Notification' in window) || this.permission !== 'granted') {
      return null
    }

    const defaultOptions = {
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      ...options
    }

    try {
      const notification = new Notification(title, defaultOptions)
      
      // Auto-close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // Handle click on notification
      if (options.onClick) {
        notification.onclick = options.onClick
      }

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  // Check if a task is due soon or overdue
  isTaskDue(task) {
    if (!task.due_date) return false

    const dueDate = new Date(task.due_date)
    const now = new Date()
    const timeDiff = dueDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // Task is due today or overdue
    return daysDiff <= 0
  }

  // Check if a task is due soon (within X days)
  isTaskDueSoon(task, daysAhead = 1) {
    if (!task.due_date) return false

    const dueDate = new Date(task.due_date)
    const now = new Date()
    const timeDiff = dueDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // Task is due within the specified days
    return daysDiff >= 0 && daysDiff <= daysAhead
  }

  // Format due date message
  getDueDateMessage(task) {
    if (!task.due_date) return ''

    const dueDate = new Date(task.due_date)
    const now = new Date()
    const timeDiff = dueDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`
    } else if (daysDiff === 0) {
      return 'Due today'
    } else if (daysDiff === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${daysDiff} days`
    }
  }

  // Show notification for a due task
  notifyDueTask(task, onClick) {
    const message = this.getDueDateMessage(task)
    const isOverdue = this.isTaskDue(task) && !this.isTaskDueSoon(task, 0)

    return this.showNotification(
      isOverdue ? `⚠️ Task Overdue: ${task.title}` : `📅 Task Due: ${task.title}`,
      {
        body: `${message}${task.description ? `\n${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}` : ''}`,
        tag: `task-${task.id}`,
        requireInteraction: isOverdue, // Keep overdue notifications open
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        onClick: onClick || (() => {
          window.focus()
        })
      }
    )
  }

  // Check multiple tasks and notify for due ones
  checkAndNotifyDueTasks(tasks, onClick, options = {}) {
    const {
      notifyOverdue = true,
      notifyDueToday = true,
      notifyDueSoon = true,
      daysAhead = 1
    } = options

    if (this.permission !== 'granted') {
      return []
    }

    const notifiedTasks = []

    tasks.forEach(task => {
      // Skip completed tasks
      if (task.status === 'DONE') return

      const isOverdue = this.isTaskDue(task) && !this.isTaskDueSoon(task, 0)
      const isDueToday = this.isTaskDueSoon(task, 0)
      const isDueSoon = this.isTaskDueSoon(task, daysAhead) && !isDueToday

      if (
        (isOverdue && notifyOverdue) ||
        (isDueToday && notifyDueToday) ||
        (isDueSoon && notifyDueSoon)
      ) {
        this.notifyDueTask(task, onClick)
        notifiedTasks.push(task)
      }
    })

    return notifiedTasks
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService

