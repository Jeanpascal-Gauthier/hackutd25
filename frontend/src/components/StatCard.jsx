function StatCard({ label, value, icon, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-bg-elevated border-border',
    success: 'bg-success-50 dark:bg-success-50 border-success-200 dark:border-success-200',
    warning: 'bg-warning-50 dark:bg-warning-50 border-warning-200 dark:border-warning-200',
    danger: 'bg-danger-50 dark:bg-danger-50 border-danger-200 dark:border-danger-200',
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-text-secondary mb-1">{label}</p>
          <p className="text-lg font-semibold text-text-primary">{value}</p>
        </div>
        {icon && (
          <div className="ml-2 text-text-tertiary">{icon}</div>
        )}
      </div>
    </div>
  )
}

export default StatCard
