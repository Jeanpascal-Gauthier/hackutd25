function PrimaryButton({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm hover:shadow focus:ring-accent-500',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary border border-border focus:ring-text-secondary',
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
