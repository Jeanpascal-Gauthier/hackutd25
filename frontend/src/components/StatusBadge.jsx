function StatusBadge({ status, severity, size = 'default' }) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
        }
      case 'in_progress':
      case 'in-progress':
        return {
          bg: 'bg-brand-50 dark:bg-brand-900/20',
          text: 'text-brand-700 dark:text-brand-300',
          border: 'border-brand-200 dark:border-brand-800',
        }
      case 'completed':
        return {
          bg: 'bg-success-50 dark:bg-success-900/20',
          text: 'text-success-700 dark:text-success-300',
          border: 'border-success-200 dark:border-success-800',
        }
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
        }
    }
  }

  const getSeverityConfig = () => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          bg: 'bg-danger-50 dark:bg-danger-900/20',
          text: 'text-danger-700 dark:text-danger-300',
          border: 'border-danger-200 dark:border-danger-800',
        }
      case 'medium':
        return {
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          text: 'text-warning-700 dark:text-warning-300',
          border: 'border-warning-200 dark:border-warning-800',
        }
      case 'low':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
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

export default StatusBadge

