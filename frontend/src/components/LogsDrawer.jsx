import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

function LogsDrawer({ isOpen, onClose, logs }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={prefersReducedMotion ? { x: '100%' } : { x: '100%' }}
            animate={prefersReducedMotion ? { x: 0 } : { x: 0 }}
            exit={prefersReducedMotion ? { x: '100%' } : { x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-96 bg-bg-elevated border-l border-border shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-h2 text-text-primary">Activity Logs</h2>
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" role="log" aria-live="polite">
              {logs.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">No logs available</p>
              ) : (
                logs.toReversed().map((log, index) => (
                  <motion.div
                    key={log.id || log.timestamp || index}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.15 }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors"
                  >
                    <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${
                      log.type === 'error' ? 'bg-danger-500' :
                      log.type === 'warning' ? 'bg-warning-500' :
                      log.type === 'success' ? 'bg-success-500' :
                      'bg-accent-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {log.source && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            log.source === 'agent' 
                              ? 'bg-accent-50 dark:bg-accent-50 text-accent-600 dark:text-accent-500' 
                              : 'bg-success-50 dark:bg-success-50 text-success-600 dark:text-success-500'
                          }`}>
                            {log.source === 'agent' ? '🤖 Agent' : '👤 Technician'}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        log.type === 'error' ? 'text-danger-500 dark:text-danger-400' :
                        log.type === 'warning' ? 'text-warning-500 dark:text-warning-400' :
                        log.type === 'success' ? 'text-success-500 dark:text-success-400' :
                        'text-text-primary dark:text-text-primary'
                      }`}>
                        {log.message || log.agent_action || log}
                      </p>
                      {log.result && (
                        <p className="text-xs text-text-secondary dark:text-text-secondary mt-1 italic">
                          {log.result}
                        </p>
                      )}
                      {log.step_number && (
                        <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-1">
                          Step {log.step_number}
                        </p>
                      )}
                      {log.timestamp && (
                        <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LogsDrawer

