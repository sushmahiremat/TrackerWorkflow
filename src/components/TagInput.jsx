import React, { useState, useRef, useEffect } from 'react'
import { X, Tag } from 'lucide-react'

const TagInput = ({ tags = [], onChange, placeholder = "Add tags...", disabled = false }) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // Predefined tag colors for visual variety
  const tagColors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-red-100 text-red-800 border-red-200',
    'bg-orange-100 text-orange-800 border-orange-200',
  ]

  const getTagColor = (index) => {
    return tagColors[index % tagColors.length]
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1)
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const handleInputBlur = () => {
    // Add tag when input loses focus if there's a value
    if (inputValue.trim()) {
      addTag(inputValue.trim())
    }
    setIsFocused(false)
  }

  const addTag = (tagText) => {
    const normalizedTag = tagText.trim().toLowerCase()
    
    // Don't add empty tags or duplicates
    if (!normalizedTag || tags.some(tag => tag.toLowerCase() === normalizedTag)) {
      setInputValue('')
      return
    }

    const newTags = [...tags, tagText.trim()]
    onChange(newTags)
    setInputValue('')
  }

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index)
    onChange(newTags)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div
        className={`flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md bg-white min-h-[42px] transition-colors ${
          isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagColor(index)} ${
                  disabled ? 'opacity-60' : ''
                }`}
              >
                <Tag className="h-3 w-3" />
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTag(index)
                    }}
                    className="ml-1 hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Press Enter or click outside to add a tag
      </p>
    </div>
  )
}

export default TagInput

