import { motion } from 'framer-motion'

function LogItem({ log, index }) {
  const getLogTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'error':
        return 'text-danger-600 dark:text-danger-400'
      case 'warning':
        return 'text-warning-600 dark:text-warning-400'
      case 'success':
        return 'text-success-600 dark:text-success-400'
      case 'info':
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.15 }}
      className="flex items-start space-x-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500 mt-2" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${getLogTypeStyles(log.type)}`}>
          {log.message || log}
        </p>
        {log.timestamp && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {new Date(log.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default LogItem

