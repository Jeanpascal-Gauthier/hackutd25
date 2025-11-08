import { motion } from 'framer-motion'

function Timeline({ steps = [], onRunStep, currentStep }) {
  if (steps.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className="relative pl-8"
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-3 top-8 w-0.5 h-full ${
                  isCompleted
                    ? 'bg-success-500'
                    : 'bg-slate-200 dark:bg-slate-700'
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
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  )}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div
              className={`${
                isCurrent ? 'bg-brand-50 dark:bg-brand-900/20' : ''
              } rounded-lg p-4 transition-colors`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {step.title || `Step ${index + 1}`}
                  </h4>
                  {step.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  )}
                </div>
                {onRunStep && !isCompleted && (
                  <button
                    onClick={() => onRunStep(index)}
                    className="ml-4 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded transition-colors"
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
                      ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-700 dark:text-success-300'
                      : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300'
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

