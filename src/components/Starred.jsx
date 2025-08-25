import React from 'react'
import { Star, FolderOpen, FileText, Heart } from 'lucide-react'

const Starred = () => {
  const starredItems = [
    {
      id: 1,
      name: 'Important Project',
      type: 'project',
      description: 'High priority client project',
      starred: true,
      icon: FolderOpen
    },
    {
      id: 2,
      name: 'Critical Bug Fix',
      type: 'task',
      description: 'Fix authentication issue in production',
      starred: true,
      icon: FileText
    }
  ]

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Starred</h1>
              <p className="text-sm text-gray-600">Your favorite projects and tasks</p>
            </div>
          </div>
        </div>

        {/* Starred Items */}
        <div className="space-y-4">
          {starredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {starredItems.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No starred items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Star projects and tasks to find them quickly here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Starred
