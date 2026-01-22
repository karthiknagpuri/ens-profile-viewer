import { useMemo } from 'react'
import { getDaysUntilExpiry, getExpiryStatus } from '../services/portfolioService'

export default function ExpirationTracker({ ownedNames = [] }) {
  const sortedNames = useMemo(() => {
    return [...ownedNames]
      .filter(n => n.expiryTimestamp)
      .sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.expiryTimestamp) ?? Infinity
        const daysB = getDaysUntilExpiry(b.expiryTimestamp) ?? Infinity
        return daysA - daysB
      })
  }, [ownedNames])

  const urgentNames = sortedNames.filter(n => {
    const { urgent } = getExpiryStatus(n.expiryTimestamp)
    return urgent
  })

  if (sortedNames.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          ENS Expiration Tracker
        </h3>
        {urgentNames.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff0f0] text-[#ff453a] rounded-full text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {urgentNames.length} need attention
          </span>
        )}
      </div>

      <div className="space-y-3">
        {sortedNames.slice(0, 5).map(name => {
          const days = getDaysUntilExpiry(name.expiryTimestamp)
          const { status, color } = getExpiryStatus(name.expiryTimestamp)

          return (
            <div
              key={name.name}
              className="flex items-center justify-between p-4 bg-[#fafafa] rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <code className="text-sm font-mono text-[#1d1d1f] truncate">
                  {name.name}
                </code>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color }}
                  >
                    {status === 'expired' ? 'Expired' :
                     days === 0 ? 'Expires today' :
                     days === 1 ? '1 day left' :
                     `${days} days left`}
                  </p>
                  <p className="text-xs text-[#86868b]">
                    {name.expiryDate}
                  </p>
                </div>

                {(status === 'expired' || status === 'critical' || status === 'warning') && (
                  <a
                    href={`https://app.ens.domains/${name.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#1d1d1f] text-white text-xs font-medium rounded-full hover:bg-black transition-colors"
                  >
                    Renew
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {sortedNames.length > 5 && (
        <p className="mt-4 text-sm text-[#6e6e73]">
          +{sortedNames.length - 5} more names
        </p>
      )}
    </div>
  )
}
