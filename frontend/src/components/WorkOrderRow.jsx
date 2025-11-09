import { motion } from 'framer-motion'
import StatusChip from './StatusChip'
import { useReducedMotion } from '../hooks/useReducedMotion'

function WorkOrderRow({ workOrder, isSelected, onClick, index }) {
  const prefersReducedMotion = useReducedMotion()

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }


  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={onClick}
      className={`
        cursor-pointer p-4 border-l-2 transition-all duration-150
        ${isSelected 
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-50 border-r border-t border-b border-border' 
          : 'border-transparent bg-bg-elevated border-r border-t border-b border-border hover:bg-bg-secondary dark:hover:bg-bg-tertiary'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium truncate mb-1 ${
              isSelected 
                ? 'text-accent-700 dark:text-accent-600' 
                : 'text-text-primary'
            }`}>
              {workOrder.title}
            </h3>
            {workOrder.description && (
              <p className="text-xs text-text-secondary truncate mb-1">
                {workOrder.description}
              </p>
            )}
            {workOrder.rack && (
              <p className="text-xs text-text-secondary font-mono">
                {workOrder.rack}
              </p>
            )}
          </div>
        </div>

        {/* Severity Badge */}
        {workOrder.severity && (
          <div className="ml-2 flex-shrink-0">
            <StatusChip severity={workOrder.severity} size="sm" />
          </div>
        )}
      </div>

      {/* Updated Time */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-tertiary">
          {formatTime(workOrder.updated_at || workOrder.created_at)}
        </span>
        {workOrder.status && (
          <StatusChip status={workOrder.status} size="sm" />
        )}
      </div>
    </motion.div>
  )
}

export default WorkOrderRow
