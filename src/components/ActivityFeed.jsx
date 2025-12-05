import React, { useState, useEffect } from 'react'
import { activityAPI } from '../services/api.js'
import TeamMemberAvatar from './TeamMemberAvatar.jsx'
import { 
  Plus, Edit, Trash2, User, MessageSquare, Paperclip, 
  CheckCircle, Clock, AlertCircle, FolderPlus, Folder
} from 'lucide-react'

const ActivityFeed = ({ teamId, projectId, taskId, limit = 50 }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loadActivities()
    // Poll for new activities every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [teamId, projectId, taskId])
  
  const loadActivities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await activityAPI.getActivities({
        team_id: teamId,
        project_id: projectId,
        task_id: taskId,
        limit
      })
      setActivities(data || [])
    } catch (err) {
      console.error('Error loading activities:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const getActivityIcon = (type) => {
    const iconClass = "h-4 w-4 flex-shrink-0"
    switch (type) {
      case 'TASK_CREATED':
        return <Plus className={`${iconClass} text-blue-500`} />
      case 'TASK_UPDATED':
        return <Edit className={`${iconClass} text-yellow-500`} />
      case 'TASK_ASSIGNED':
        return <User className={`${iconClass} text-purple-500`} />
      case 'TASK_STATUS_CHANGED':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'TASK_DELETED':
        return <Trash2 className={`${iconClass} text-red-500`} />
      case 'COMMENT_ADDED':
        return <MessageSquare className={`${iconClass} text-blue-500`} />
      case 'ATTACHMENT_ADDED':
        return <Paperclip className={`${iconClass} text-gray-500`} />
      case 'PROJECT_CREATED':
        return <FolderPlus className={`${iconClass} text-blue-500`} />
      case 'PROJECT_UPDATED':
        return <Folder className={`${iconClass} text-yellow-500`} />
      case 'MENTION':
        return <AlertCircle className={`${iconClass} text-orange-500`} />
      default:
        return <Clock className={`${iconClass} text-gray-500`} />
    }
  }
  
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }
  
  if (loading && activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm">Loading activities...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">Error loading activities: {error}</p>
      </div>
    )
  }
  
  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No activities yet</p>
        <p className="text-xs text-gray-400 mt-1">Activity feed will appear here</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0">
            <TeamMemberAvatar
              member={{ user_name: activity.user_name, user_avatar: activity.user_avatar }}
              size="sm"
              showStatus={false}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getActivityIcon(activity.type)}
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user_name}</span>
                {' '}
                <span className="text-gray-600">{activity.description}</span>
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">{formatTime(activity.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityFeed

