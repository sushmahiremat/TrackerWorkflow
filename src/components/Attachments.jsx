import React, { useState, useEffect } from 'react'
import { attachmentAPI } from '../services/api.js'
import { Paperclip, Upload, Download, Trash2, File, Image, FileText, FileCode } from 'lucide-react'
import { format } from 'date-fns'

const Attachments = ({ taskId, userName }) => {
  const [attachments, setAttachments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAttachments()
  }, [taskId])

  const loadAttachments = async () => {
    try {
      setLoading(true)
      const data = await attachmentAPI.getAttachments(taskId)
      setAttachments(data || [])
    } catch (error) {
      console.error('Error loading attachments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.')
      return
    }

    setIsUploading(true)
    try {
      await attachmentAPI.uploadAttachment(taskId, file, userName || 'User')
      await loadAttachments()
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (attachmentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return

    try {
      await attachmentAPI.deleteAttachment(attachmentId)
      await loadAttachments()
    } catch (error) {
      console.error('Error deleting attachment:', error)
      alert('Failed to delete attachment. Please try again.')
    }
  }

  const handleDownload = (attachment) => {
    const downloadUrl = attachmentAPI.downloadAttachment(attachment.id)
    window.open(downloadUrl, '_blank')
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="h-5 w-5" />
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (fileType.includes('code') || fileType.includes('text')) {
      return <FileCode className="h-5 w-5 text-green-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (error) {
      return dateString
    }
  }

  const [showAllAttachments, setShowAllAttachments] = useState(false)
  const displayedAttachments = showAllAttachments ? attachments : attachments.slice(0, 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Attachments</span>
          <span className="text-xs text-gray-500">({attachments.length})</span>
        </div>
        
        {/* File Upload Button - Compact */}
        <label className="btn-primary flex items-center space-x-1 px-2 py-1 text-xs cursor-pointer">
          <Upload className="h-3 w-3" />
          <span>{isUploading ? '...' : 'Upload'}</span>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            accept="*/*"
          />
        </label>
      </div>

      {/* Attachments List */}
      {loading ? (
        <div className="text-center py-2 text-xs text-gray-500">Loading...</div>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-gray-500 py-1">No attachments yet</p>
      ) : (
        <div className="space-y-1">
          {displayedAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-gray-50 rounded p-2 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-gray-900 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download file"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id, attachment.file_name)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {attachments.length > 3 && !showAllAttachments && (
            <button
              onClick={() => setShowAllAttachments(true)}
              className="text-xs text-blue-600 hover:text-blue-800 py-1"
            >
              Show {attachments.length - 3} more file{attachments.length - 3 > 1 ? 's' : ''}
            </button>
          )}
          {showAllAttachments && attachments.length > 3 && (
            <button
              onClick={() => setShowAllAttachments(false)}
              className="text-xs text-blue-600 hover:text-blue-800 py-1"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Attachments

