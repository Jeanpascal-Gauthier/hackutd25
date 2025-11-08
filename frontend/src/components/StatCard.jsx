function StatCard({ label, value, icon, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
    danger: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800',
  }

  return (
    <div
      className={`p-3 rounded-lg border ${variantClasses[variant]} transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        {icon && (
          <div className="ml-2 text-slate-400 dark:text-slate-500">{icon}</div>
        )}
      </div>
    </div>
  )
}

export default StatCard

