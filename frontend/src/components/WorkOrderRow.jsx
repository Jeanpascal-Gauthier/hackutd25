import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'

function WorkOrderRow({ workOrder, isSelected, onClick, index }) {
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

  const getStatusDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-slate-400'
      case 'in_progress':
      case 'in-progress':
        return 'bg-brand-500'
      case 'completed':
        return 'bg-success-500'
      default:
        return 'bg-slate-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={onClick}
      className={`
        cursor-pointer p-4 border-l-2 transition-all duration-150
        ${isSelected 
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 border-r border-t border-b border-slate-200 dark:border-slate-700' 
          : 'border-transparent bg-white dark:bg-slate-800 border-r border-t border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Status Dot */}
          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getStatusDotColor(workOrder.status)}`} />
          
          {/* Title and Rack */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate mb-1">
              {workOrder.title}
            </h3>
            {workOrder.rack && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {workOrder.rack}
              </p>
            )}
          </div>
        </div>

        {/* Severity Badge */}
        {workOrder.severity && (
          <div className="ml-2 flex-shrink-0">
            <StatusBadge severity={workOrder.severity} size="sm" />
          </div>
        )}
      </div>

      {/* Updated Time */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatTime(workOrder.updated_at || workOrder.created_at)}
        </span>
        {workOrder.status && (
          <StatusBadge status={workOrder.status} size="sm" />
        )}
      </div>
    </motion.div>
  )
}

export default WorkOrderRow

