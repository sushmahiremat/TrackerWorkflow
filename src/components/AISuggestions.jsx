import React, { useState, useEffect, useRef } from 'react'
import { aiAPI } from '../services/api.js'
import { 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Lightbulb
} from 'lucide-react'

const AISuggestions = ({ description, onSubtaskSelect }) => {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addedSubtasks, setAddedSubtasks] = useState(new Set())
  const [lastProcessedDescription, setLastProcessedDescription] = useState('')
  const addedSubtasksRef = useRef(new Set())

  useEffect(() => {
    // Clear any existing timeout
    const timeoutId = setTimeout(() => {
      if (description && description.trim().length > 10) {
        // Extract the original description (before any bullet points were added)
        const originalDescription = description.split('\n\n•')[0].trim()
        
        // Only generate if the original description has changed significantly
        if (originalDescription !== lastProcessedDescription && !originalDescription.includes('•')) {
          console.log('Generating AI suggestions for:', originalDescription)
          generateSuggestions(originalDescription)
          setLastProcessedDescription(originalDescription)
          // Don't reset added subtasks when description changes - keep them
          // setAddedSubtasks(new Set())
        } else {
          console.log('Skipping AI generation. Original:', originalDescription, 'Last processed:', lastProcessedDescription)
        }
      } else if (description.trim().length <= 10) {
        // Clear suggestions if description is too short
        setSuggestions(null)
        setLastProcessedDescription('')
        setAddedSubtasks(new Set())
        addedSubtasksRef.current.clear()
      }
    }, 1000) // Wait 1 second after user stops typing

    // Cleanup timeout on unmount or when description changes
    return () => clearTimeout(timeoutId)
  }, [description, lastProcessedDescription])

  // Sync ref with state whenever state changes
  useEffect(() => {
    addedSubtasksRef.current = addedSubtasks
  }, [addedSubtasks])

  const generateSuggestions = async (taskDescription) => {
    // Extract the original description (before any bullet points)
    const originalDescription = taskDescription.split('\n\n•')[0].trim()
    
    // Don't regenerate if we already have suggestions for this description
    if (suggestions && !loading && lastProcessedDescription === originalDescription) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await aiAPI.summarizeTask(originalDescription)
      
      if (response.success && response.data) {
        setSuggestions(response.data)
        setError(null)
      } else {
        throw new Error(response.data?.detail || 'Failed to generate suggestions')
      }
    } catch (err) {
      console.error('AI suggestions error:', err)
      setError(err.message || 'AI suggestions not available')
    } finally {
      setLoading(false)
    }
  }

  const handleSubtaskSelect = (subtask) => {
    if (onSubtaskSelect) {
      onSubtaskSelect(subtask)
      // Mark this subtask as added and persist it in both state and ref
      setAddedSubtasks(prev => {
        const newSet = new Set(prev)
        newSet.add(subtask)
        addedSubtasksRef.current = newSet

        return newSet
      })
    }
  }

  const handleSummarySelect = (summary) => {
    if (onSubtaskSelect) {
      // Pass the summary as a special subtask that will replace the description
      onSubtaskSelect(`[SUMMARY] ${summary}`)
    }
  }

  const handleRegenerate = async (e) => {
    e.preventDefault() // Prevent any default behavior
    e.stopPropagation() // Stop event bubbling
    
    try {
      // Clear current suggestions and regenerate
      setSuggestions(null)
      setError(null)
      setLoading(true)
      setAddedSubtasks(new Set())
      addedSubtasksRef.current.clear()
      
      // Extract original description and regenerate suggestions
      const originalDescription = description.split('\n\n•')[0].trim()
      await generateSuggestions(originalDescription)
    } catch (err) {
      console.error('Regenerate error:', err)
      setError('Failed to regenerate suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  if (!description || description.trim().length <= 10) {
    return null
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-900">Generating AI suggestions...</p>
            <p className="text-xs text-blue-700">Analyzing your task description</p>
          </div>
        </div>
      </div>
    )
  }

  // Show "thinking" state when description is long enough but no suggestions yet
  if (description.trim().length > 10 && !suggestions && !loading && !error) {
    return (
      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-purple-600 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-purple-900">AI is thinking...</p>
            <p className="text-xs text-purple-700">Type more to get better suggestions</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-900">AI suggestions not available</p>
            <p className="text-xs text-yellow-700">You can still create your task manually</p>
          </div>
        </div>
      </div>
    )
  }

  if (!suggestions) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex items-center mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-semibold text-purple-900">
            AI-Powered Suggestions
          </h4>
        </div>
      </div>

             {/* Task Summary */}
       {suggestions.summary && (
         <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
           <div className="flex items-start space-x-2">
             <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
             <div className="flex-1">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-semibold text-blue-900">🎯 AI Task Summary</p>
                                   <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSummarySelect(suggestions.summary)
                    }}
                    className="px-3 py-1 text-xs rounded font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    Use Summary
                  </button>
               </div>
               <p className="text-sm text-blue-800 bg-white px-3 py-2 rounded-md border border-blue-100 shadow-sm">
                 {suggestions.summary}
               </p>
               <p className="text-xs text-blue-600 mt-2">
                 💡 Click "Use Summary" to replace your description with this AI-generated summary
               </p>
             </div>
           </div>
         </div>
       )}

      {/* Suggested Subtasks */}
      {suggestions.subtasks && suggestions.subtasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-900">Suggested Subtasks</p>
          </div>
          
          <div className="space-y-2">
            {suggestions.subtasks.map((subtask, index) => {
              const isAdded = addedSubtasks.has(subtask) || addedSubtasksRef.current.has(subtask)
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                    isAdded 
                      ? 'bg-green-50 border border-green-300' 
                      : 'bg-white border border-green-200 hover:border-green-300'
                  }`}
                >
                  <span className={`text-sm flex-1 ${
                    isAdded ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {subtask}
                  </span>
                  <button
                    onClick={() => !isAdded && handleSubtaskSelect(subtask)}
                    disabled={isAdded}
                    className={`ml-2 px-3 py-1 text-xs rounded font-medium transition-colors ${
                      isAdded
                        ? 'bg-green-200 text-green-800 cursor-not-allowed opacity-75'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isAdded ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              )
            })}
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            💡 Click "Add" to add any subtask to your task description. You can select multiple subtasks!
            {(addedSubtasks.size > 0 || addedSubtasksRef.current.size > 0) && (
              <span className="block mt-1 text-green-600 font-medium">
                ✨ {Math.max(addedSubtasks.size, addedSubtasksRef.current.size)} subtask{Math.max(addedSubtasks.size, addedSubtasksRef.current.size) !== 1 ? 's' : ''} added to your description
              </span>
            )}
          </p>
        </div>
      )}

                    {/* AI Status */}
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="flex items-center justify-end">
            {/* Temporarily commented out - not working properly
            <button
              onClick={handleRegenerate}
              className="text-xs text-purple-600 hover:text-purple-800 underline"
            >
              Regenerate
            </button>
            */}
          </div>
        </div>
    </div>
  )
}

export default AISuggestions
