import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import { notificationAPI } from '../services/api.js'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    // Try user.name first, then user.email as fallback
    const userName = user?.name || user?.email
    if (!userName) {
      console.log('⚠️ NotificationContext: No user name or email available')
      return
    }

    setLoading(true)
    setError(null)
    try {
      console.log('📬 Loading notifications for user:', userName)
      const data = await notificationAPI.getNotifications(userName)
      console.log('✅ Notifications loaded:', data.length, 'notifications')
      setNotifications(data || [])
    } catch (err) {
      console.error('❌ Error loading notifications:', err)
      setError(err.message)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [user?.name, user?.email])

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    const userName = user?.name || user?.email
    if (!userName) return

    try {
      const data = await notificationAPI.getUnreadCount(userName)
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Error loading unread count:', err)
    }
  }, [user?.name, user?.email])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const userName = user?.name || user?.email
    if (!userName) return

    try {
      await notificationAPI.markAllAsRead(userName)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }, [user?.name, user?.email])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId)
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [notifications])

  // Load notifications and unread count on mount and when user changes
  useEffect(() => {
    const userName = user?.name || user?.email
    if (userName) {
      console.log('🔄 NotificationContext: User available, loading notifications')
      loadNotifications()
      loadUnreadCount()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadNotifications()
        loadUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    } else {
      console.log('⚠️ NotificationContext: No user available yet')
    }
  }, [user?.name, user?.email, loadNotifications, loadUnreadCount])

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

