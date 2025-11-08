function PrimaryButton({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow focus:ring-brand-500',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-slate-500',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-sm hover:shadow focus:ring-danger-500',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton

