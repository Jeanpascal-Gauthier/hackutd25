import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

function Timeline({ steps = [], onRunStep, currentStep, onReportIssue }) {
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
        const hasIssue = step.issueReport !== undefined
        
        // Check if all previous steps are completed (no issues and completed)
        const canComplete = index === 0 
          ? true // First step can always be completed
          : steps.slice(0, index).every((prevStep, prevIndex) => 
              prevIndex < currentStep && !prevStep.issueReport
            )

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
                  isCompleted && !hasIssue
                    ? 'bg-success-500'
                    : hasIssue
                    ? 'bg-danger-500'
                    : 'bg-border'
                }`}
              />
            )}

            {/* Step Marker */}
            <div className="absolute left-0 top-0.5">
              {isCompleted && !hasIssue ? (
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
              ) : hasIssue ? (
                <div className="w-6 h-6 rounded-full bg-danger-500 flex items-center justify-center">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
                isCurrent ? 'bg-accent-50 dark:bg-accent-50' : hasIssue ? 'bg-danger-50 dark:bg-danger-900/20' : ''
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
                {!isCompleted && (
                  <div className="ml-4 flex items-center space-x-2">
                    {onRunStep && (
                      <button
                        onClick={() => onRunStep(index)}
                        disabled={!canComplete}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          canComplete
                            ? 'text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-50'
                            : 'text-text-tertiary cursor-not-allowed opacity-50'
                        }`}
                        title={!canComplete ? 'Complete previous steps first' : ''}
                      >
                        Step Completed
                      </button>
                    )}
                    {onReportIssue && (
                      <button
                        onClick={() => onReportIssue(index)}
                        className="px-3 py-1.5 text-xs font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded transition-colors border border-danger-200 dark:border-danger-800"
                      >
                        Issue Encountered
                      </button>
                    )}
                  </div>
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

              {/* Issue Report */}
              {hasIssue && step.issueReport && (
                <div className="mt-3 p-4 rounded-lg border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-danger-600 dark:text-danger-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-danger-700 dark:text-danger-300">
                          Issue Reported
                        </p>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          step.issueReport.urgency === 'high'
                            ? 'bg-danger-200 dark:bg-danger-800 text-danger-800 dark:text-danger-200'
                            : step.issueReport.urgency === 'medium'
                            ? 'bg-warning-200 dark:bg-warning-800 text-warning-800 dark:text-warning-200'
                            : 'bg-success-200 dark:bg-success-800 text-success-800 dark:text-success-200'
                        }`}>
                          {step.issueReport.urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-danger-600 dark:text-danger-400 mb-2">
                        <span className="font-medium">Reason:</span>{' '}
                        {step.issueReport.reason.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-danger-700 dark:text-danger-300 mb-2">
                        {step.issueReport.description}
                      </p>
                      {step.issueReport.additionalNotes && (
                        <p className="text-xs text-danger-600 dark:text-danger-400 italic">
                          {step.issueReport.additionalNotes}
                        </p>
                      )}
                      {step.issueReport.timestamp && (
                        <p className="text-xs mt-2 text-danger-500 dark:text-danger-500 opacity-75">
                          Reported at {new Date(step.issueReport.timestamp).toLocaleString()}
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
