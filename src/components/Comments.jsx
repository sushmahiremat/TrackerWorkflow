import React, { useState, useEffect } from 'react'
import { commentAPI } from '../services/api.js'
import { MessageSquare, Send, Trash2, Edit, X, Check } from 'lucide-react'
import { format } from 'date-fns'

const Comments = ({ taskId, userName }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [taskId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await commentAPI.getComments(taskId)
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await commentAPI.createComment(taskId, {
        content: newComment.trim(),
        user_name: userName || 'User'
      })
      setNewComment('')
      await loadComments()
    } catch (error) {
      console.error('Error creating comment:', error)
      const errorMessage = error.message || 'Failed to add comment. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await commentAPI.deleteComment(commentId)
      await loadComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  const handleEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return

    try {
      await commentAPI.updateComment(commentId, editContent.trim())
      setEditingId(null)
      setEditContent('')
      await loadComments()
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Failed to update comment. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (error) {
      return dateString
    }
  }

  const [showAllComments, setShowAllComments] = useState(false)
  const displayedComments = showAllComments ? comments : comments.slice(0, 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Comments</span>
          <span className="text-xs text-gray-500">({comments.length})</span>
        </div>
      </div>

      {/* Add Comment Form - Compact */}
      <form onSubmit={handleSubmit} className="flex items-start space-x-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="2"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="btn-primary flex items-center space-x-1 px-3 py-1.5 text-xs"
        >
          <Send className="h-3 w-3" />
          <span>{isSubmitting ? '...' : 'Post'}</span>
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-2 text-xs text-gray-500">Loading...</div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500 py-1">No comments yet</p>
      ) : (
        <div className="space-y-2">
          {displayedComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded p-2 border border-gray-200"
            >
              {editingId === comment.id ? (
                <div className="space-y-1">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-gray-900 truncate">
                        {comment.user_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit comment"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-3">
                    {comment.content}
                  </p>
                </>
              )}
            </div>
          ))}
          {comments.length > 3 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-xs text-blue-600 hover:text-blue-800 py-1"
            >
              Show {comments.length - 3} more comment{comments.length - 3 > 1 ? 's' : ''}
            </button>
          )}
          {showAllComments && comments.length > 3 && (
            <button
              onClick={() => setShowAllComments(false)}
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

export default Comments

