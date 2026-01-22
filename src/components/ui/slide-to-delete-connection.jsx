import * as React from 'react'
import { motion } from 'framer-motion'
import { Trash2, X, Link2Off } from 'lucide-react'
import { cn } from '../../lib/utils'

// Avatar component with fallback
function ConnectionAvatar({ src, name, className }) {
  const [hasError, setHasError] = React.useState(false)

  if (hasError || !src) {
    return (
      <div className={cn('rounded-full bg-gradient-to-br from-[#627EEA] to-[#8B5CF6] flex items-center justify-center', className)}>
        <span className="text-white text-sm font-bold">
          {name?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', className)}
      onError={() => setHasError(true)}
    />
  )
}

export function SlideToDeleteConnection({
  connection,
  onDelete,
  onCancel,
  className
}) {
  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="relative w-full max-w-sm mx-4 rounded-2xl bg-white border border-[#e5e5e5] shadow-xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[#f5f5f5] transition-colors z-10"
        >
          <X className="w-4 h-4 text-[#86868b]" />
        </button>

        {/* Connection info */}
        <div className="p-6 pb-4">
          {/* Visual representation of connection */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-center">
              <ConnectionAvatar
                src={connection?.sourceAvatar}
                name={connection?.sourceName}
                className="w-14 h-14 mx-auto border-2 border-[#e5e5e5]"
              />
              <p className="mt-2 text-xs font-medium text-[#1d1d1f] truncate max-w-[80px]">
                {connection?.sourceName}
              </p>
            </div>

            {/* Connection line */}
            <div className="flex items-center gap-1 px-2">
              <div className="w-8 h-0.5 bg-[#e5e5e5]" />
              <Link2Off className="w-5 h-5 text-red-500" />
              <div className="w-8 h-0.5 bg-[#e5e5e5]" />
            </div>

            <div className="text-center">
              <ConnectionAvatar
                src={connection?.targetAvatar}
                name={connection?.targetName}
                className="w-14 h-14 mx-auto border-2 border-[#e5e5e5]"
              />
              <p className="mt-2 text-xs font-medium text-[#1d1d1f] truncate max-w-[80px]">
                {connection?.targetName}
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-[#6e6e73]">
            Remove this connection?
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-sm font-medium text-[#6e6e73] hover:bg-[#f5f5f5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
