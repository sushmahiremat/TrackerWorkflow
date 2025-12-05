import React from 'react'
import { format } from 'date-fns'
import { Calendar, User, CheckCircle, Tag } from 'lucide-react'

const TaskCard = ({ task, onDragStart, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    if (status === 'DONE') {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return null
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date'
    try {
      return format(new Date(dueDate), 'MMM dd')
    } catch (error) {
      console.warn('Invalid due date:', dueDate)
      return 'Invalid date'
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
          {task.title}
        </h4>
        {getStatusIcon(task.status)}
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
        {task.description || 'No description'}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDueDate(task.due_date)}
          </div>
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => {
              const tagColors = [
                'bg-blue-100 text-blue-800 border-blue-200',
                'bg-purple-100 text-purple-800 border-purple-200',
                'bg-pink-100 text-pink-800 border-pink-200',
                'bg-green-100 text-green-800 border-green-200',
              ]
              const tagColor = tagColors[index % tagColors.length]
              return (
                <span
                  key={index}
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium border ${tagColor}`}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              )
            })}
            {task.tags.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          {task.assignee || 'Unassigned'}
        </div>
      </div>
    </div>
  )
}

export default TaskCard 