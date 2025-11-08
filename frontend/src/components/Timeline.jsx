import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

function Timeline({ steps = [], onRunStep, currentStep }) {
  const prefersReducedMotion = useReducedMotion()

  if (steps.length === 0) {
    return (
      <div className="text-sm text-text-tertiary">
        No steps available
      </div>
    )
  }

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const hasResult = step.result !== undefined

        return (
          <motion.li
            key={index}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className="relative pl-8"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-3 top-8 w-0.5 h-full ${
                  isCompleted
                    ? 'bg-success-500'
                    : 'bg-border'
                }`}
              />
            )}

            {/* Step Marker */}
            <div className="absolute left-0 top-0.5">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isCurrent
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-50'
                      : 'border-border bg-bg-elevated'
                  }`}
                >
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-accent-500" />
                  )}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div
              className={`${
                isCurrent ? 'bg-accent-50 dark:bg-accent-50' : ''
              } rounded-lg p-4 transition-colors`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary mb-1">
                    {step.title || `Step ${index + 1}`}
                  </h4>
                  {step.description && (
                    <p className="text-sm text-text-secondary">
                      {step.description}
                    </p>
                  )}
                </div>
                {onRunStep && !isCompleted && (
                  <button
                    onClick={() => onRunStep(index)}
                    className="ml-4 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-50 rounded transition-colors"
                  >
                    Run Step
                  </button>
                )}
              </div>

              {/* Step Result */}
              {hasResult && (
                <div
                  className={`mt-3 p-3 rounded border text-sm ${
                    step.result.success
                      ? 'bg-success-50 dark:bg-success-50 border-success-200 dark:border-success-200 text-success-600 dark:text-success-500'
                      : 'bg-danger-50 dark:bg-danger-50 border-danger-200 dark:border-danger-200 text-danger-600 dark:text-danger-500'
                  }`}
                >
                  <div className="flex items-start">
                    {step.result.success ? (
                      <svg
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <div>
                      <p className="font-medium">{step.result.message}</p>
                      {step.result.timestamp && (
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(step.result.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}

export default Timeline
