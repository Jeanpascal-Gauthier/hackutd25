function StatusChip({ status, severity, size = 'default' }) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-bg-tertiary',
          text: 'text-text-secondary',
          border: 'border-border',
        }
      case 'in_progress':
      case 'in-progress':
        return {
          bg: 'bg-accent-50 dark:bg-accent-50',
          text: 'text-accent-600 dark:text-accent-500',
          border: 'border-accent-200 dark:border-accent-200',
        }
      case 'completed':
        return {
          bg: 'bg-success-50 dark:bg-success-50',
          text: 'text-success-600 dark:text-success-500',
          border: 'border-success-200 dark:border-success-200',
        }
      default:
        return {
          bg: 'bg-bg-tertiary',
          text: 'text-text-secondary',
          border: 'border-border',
        }
    }
  }

  const getSeverityConfig = () => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-priority-critical-50 dark:bg-priority-critical-50',
          text: 'text-priority-critical-600 dark:text-priority-critical-500',
          border: 'border-priority-critical-200 dark:border-priority-critical-200',
        }
      case 'high':
        return {
          bg: 'bg-danger-50 dark:bg-danger-50',
          text: 'text-danger-600 dark:text-danger-500',
          border: 'border-danger-200 dark:border-danger-200',
        }
      case 'medium':
        return {
          bg: 'bg-warning-50 dark:bg-warning-50',
          text: 'text-warning-600 dark:text-warning-500',
          border: 'border-warning-200 dark:border-warning-200',
        }
      case 'low':
        return {
          bg: 'bg-bg-tertiary',
          text: 'text-text-secondary',
          border: 'border-border',
        }
      default:
        return null
    }
  }

  const config = severity ? getSeverityConfig() : getStatusConfig()
  if (!config) return null

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border}`}
    >
      {status ? status.replace('_', ' ').toUpperCase() : severity?.toUpperCase()}
    </span>
  )
}

export default StatusChip
