import React from 'react'
import { Clock, FolderOpen, FileText } from 'lucide-react'

const Recent = () => {
  const recentItems = [
    {
      id: 1,
      name: 'Test Project',
      type: 'project',
      description: 'This is a test project',
      lastAccessed: '2 hours ago',
      icon: FolderOpen
    },
    {
      id: 2,
      name: 'Backend API Task',
      type: 'task',
      description: 'Create API endpoints for user management',
      lastAccessed: '1 day ago',
      icon: FileText
    },
    {
      id: 3,
      name: 'Mobile App Project',
      type: 'project',
      description: 'React Native application development',
      lastAccessed: '3 days ago',
      icon: FolderOpen
    }
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recent</h1>
              <p className="text-sm text-gray-600">Items you've accessed recently</p>
            </div>
          </div>
        </div>

        {/* Recent Items */}
        <div className="space-y-4">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">Last accessed {item.lastAccessed}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no items) */}
        {recentItems.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Items you access will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Recent
