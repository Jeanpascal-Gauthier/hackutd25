import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

function AgentReasoningFeed({ reasoning, isActive }) {
  const prefersReducedMotion = useReducedMotion()

  if (!isActive || !reasoning || reasoning.length === 0) {
    return (
      <div className="p-4 bg-bg-secondary rounded-lg border border-border">
        <p className="text-sm text-text-tertiary text-center">
          Agent reasoning will appear here when plan is executed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      <AnimatePresence>
        {reasoning.map((item, index) => (
          <motion.div
            key={index}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: -10, scale: 0.95 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, x: 0, scale: 1 }
            }
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className="p-3 bg-accent-50 dark:bg-accent-500/10 rounded-lg border border-accent-200 dark:border-accent-500/30"
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">{item.message}</p>
                {item.timestamp && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default AgentReasoningFeed

