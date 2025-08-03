import React from 'react'
import { format } from 'date-fns'
import { Calendar, User, CheckCircle } from 'lucide-react'

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
        {task.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(task.dueDate), 'MMM dd')}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          {task.assignee}
        </div>
      </div>
    </div>
  )
}

export default TaskCard 