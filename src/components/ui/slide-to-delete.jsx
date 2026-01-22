import * as React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Trash2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function SlideToDelete({
  children,
  onDelete,
  onCancel,
  className,
  profile
}) {
  const x = useMotionValue(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const deleteThreshold = -100

  // Transform values for visual feedback
  const backgroundColor = useTransform(
    x,
    [0, deleteThreshold],
    ['var(--color-surface)', 'rgba(239, 68, 68, 0.2)']
  )

  const trashOpacity = useTransform(
    x,
    [0, deleteThreshold / 2, deleteThreshold],
    [0, 0.5, 1]
  )

  const handleDragEnd = () => {
    setIsDragging(false)
    if (x.get() <= deleteThreshold) {
      onDelete?.()
    }
  }

  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm mx-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[var(--color-surface-secondary)] transition-colors z-10"
        >
          <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
        </button>

        {/* Profile info */}
        <div className="p-6 pb-4 text-center">
          {profile && (
            <>
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-[var(--color-border)]"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.querySelector('.avatar-fallback').style.display = 'flex'
                }}
              />
              <div
                className="avatar-fallback w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-[#627EEA] to-[#8B5CF6] hidden items-center justify-center"
              >
                <span className="text-white text-xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {profile.name}
              </h3>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                Remove from network?
              </p>
            </>
          )}
        </div>

        {/* Slide to delete area */}
        <div className="px-6 pb-6">
          <motion.div
            className="relative h-14 rounded-full border border-[var(--color-border)] overflow-hidden"
            style={{ backgroundColor }}
          >
            {/* Delete icon on the right */}
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
              style={{ opacity: trashOpacity }}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Release to delete</span>
            </motion.div>

            {/* Draggable button */}
            <motion.div
              drag="x"
              dragConstraints={{ left: deleteThreshold, right: 0 }}
              dragElastic={0.1}
              style={{ x }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              className={cn(
                'absolute left-1 top-1 bottom-1 w-[calc(100%-8px)] rounded-full cursor-grab active:cursor-grabbing',
                'bg-[var(--color-surface-secondary)] flex items-center justify-center gap-2',
                'transition-shadow',
                isDragging && 'shadow-lg'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-4 bg-[var(--color-text-tertiary)] rounded-full opacity-50" />
                  <div className="w-1 h-4 bg-[var(--color-text-tertiary)] rounded-full opacity-50" />
                </div>
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Slide left to delete
                </span>
                <Trash2 className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Cancel button */}
        <div className="px-6 pb-6">
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
