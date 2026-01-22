import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { resolveEnsProfileEnhanced, normalizeName } from '../services/ensService'
import ProfileCard from '../components/ProfileCard'
import SearchBar from '../components/SearchBar'

export default function Profile() {
  const { name } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async (showLoading = true) => {
    if (!name) return

    if (showLoading) {
      setLoading(true)
      setProfile(null)
    }
    setError(null)

    try {
      const normalizedName = normalizeName(decodeURIComponent(name))
      const data = await resolveEnsProfileEnhanced(normalizedName)
      setProfile(data)

      // Save to recent searches
      const saved = localStorage.getItem('ens-recent-searches')
      let recent = saved ? JSON.parse(saved) : []
      recent = [normalizedName, ...recent.filter((n) => n !== normalizedName)].slice(0, 10)
      localStorage.setItem('ens-recent-searches', JSON.stringify(recent))
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleProfileUpdate = () => {
    // Reload profile without showing loading state
    fetchProfile(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Back link and search */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-secondary)] transition-colors"
        >
          <svg className="w-5 h-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <SearchBar compact initialValue={profile?.name || ''} />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8">
          <div className="animate-pulse">
            <div className="flex items-start gap-6">
              <div className="w-28 h-28 rounded-full bg-[var(--color-surface-secondary)]" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-lg" />
                <div className="h-5 w-32 bg-[var(--color-surface-secondary)] rounded-lg" />
                <div className="h-10 w-64 bg-[var(--color-surface-secondary)] rounded-lg" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full bg-[var(--color-surface-secondary)] rounded" />
              <div className="h-4 w-3/4 bg-[var(--color-surface-secondary)] rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Unable to load profile
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6">{error}</p>

          {error.includes('not registered') && (
            <a
              href={`https://app.ens.domains/${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface)] rounded-full text-sm font-medium hover:opacity-90 transition-colors"
            >
              Register on ENS
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <button
            onClick={() => window.location.reload()}
            className="ml-3 px-5 py-2.5 bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-full text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Profile display */}
      {profile && !loading && (
        <ProfileCard profile={profile} onProfileUpdate={handleProfileUpdate} />
      )}
    </div>
  )
}
