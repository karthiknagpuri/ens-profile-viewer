import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizeName, isValidEnsName } from '../services/ensService'

export default function SearchBar({ onSearch, initialValue = '', autoFocus = false, compact = false }) {
  const [input, setInput] = useState(initialValue)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter an ENS name')
      return
    }

    const normalized = normalizeName(trimmed)

    if (!isValidEnsName(normalized)) {
      setError('Please enter a valid ENS name')
      return
    }

    if (onSearch) {
      onSearch(normalized)
    } else {
      navigate(`/profile/${encodeURIComponent(normalized)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative ${compact ? '' : 'max-w-xl mx-auto'}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-[var(--color-text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError('')
            }}
            placeholder="Search ENS name..."
            autoFocus={autoFocus}
            className={`w-full bg-[var(--color-surface-secondary)] border-0 rounded-full pl-10 sm:pl-12 pr-4 text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-all ${
              compact ? 'py-2.5 text-sm' : 'py-3 sm:py-4 text-sm sm:text-base'
            }`}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute inset-y-0 right-14 flex items-center pr-2"
            >
              <span className="w-5 h-5 rounded-full bg-[var(--color-text-tertiary)] flex items-center justify-center">
                <svg className="w-3 h-3 text-[var(--color-surface)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          )}
          <button
            type="submit"
            className={`absolute inset-y-0 right-0 flex items-center pr-2 ${compact ? 'pr-1.5' : 'pr-2'}`}
          >
            <span className={`bg-[var(--color-accent)] text-[var(--color-surface)] rounded-full font-medium hover:opacity-90 transition-colors ${
              compact ? 'px-4 py-1.5 text-sm' : 'px-5 py-2 text-sm'
            }`}>
              Search
            </span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-error)] text-center">{error}</p>
        )}
      </div>
    </form>
  )
}
