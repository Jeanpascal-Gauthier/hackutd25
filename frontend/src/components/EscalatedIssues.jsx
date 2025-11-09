import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

function EscalatedIssues({ escalatedIssues = [], onResolve }) {
  const prefersReducedMotion = useReducedMotion()
  const [expandedIssue, setExpandedIssue] = useState(null)

  if (!escalatedIssues || escalatedIssues.length === 0) {
    return (
      <div className="bg-bg-elevated border border-border rounded-lg shadow-sm p-6">
        <h2 className="text-h2 text-text-primary mb-4">Escalated Issues</h2>
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-text-tertiary mb-3"
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
          <p className="text-body text-text-tertiary">
            No escalated issues at this time
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-elevated border border-border rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h2 text-text-primary">Escalated Issues</h2>
          <p className="text-body text-text-secondary mt-1">
            {escalatedIssues.length} issue{escalatedIssues.length !== 1 ? 's' : ''} requiring engineer review
          </p>
        </div>
        <div className="px-3 py-1 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 rounded-full text-sm font-medium">
          {escalatedIssues.length}
        </div>
      </div>

      <div className="space-y-4">
        {escalatedIssues.map((issue, index) => (
          <motion.div
            key={issue.id || index}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-warning-600 dark:text-warning-400"
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
                    <span className="text-sm font-semibold text-warning-800 dark:text-warning-200">
                      Escalated from Technician
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    issue.urgency === 'high'
                      ? 'bg-danger-200 dark:bg-danger-800 text-danger-800 dark:text-danger-200'
                      : issue.urgency === 'medium'
                      ? 'bg-warning-200 dark:bg-warning-800 text-warning-800 dark:text-warning-200'
                      : 'bg-success-200 dark:bg-success-800 text-success-800 dark:text-success-200'
                  }`}>
                    {issue.urgency?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Work Order: <span className="font-normal">{issue.workOrderTitle || 'Unknown'}</span>
                    </p>
                    {issue.stepTitle && (
                      <p className="text-xs text-text-secondary">
                        Step: {issue.stepTitle}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-text-primary">
                    {issue.description || issue.message}
                  </p>

                  {expandedIssue === index && (
                    <div className="mt-3 pt-3 border-t border-warning-200 dark:border-warning-800 space-y-2">
                      {issue.source && (
                        <p className="text-xs text-text-secondary">
                          Source: <span className="font-medium capitalize">{issue.source.replace('_', ' ')}</span>
                        </p>
                      )}
                      {issue.status && (
                        <p className="text-xs text-text-secondary">
                          Status: <span className="font-medium capitalize">{issue.status}</span>
                        </p>
                      )}
                      {issue.timestamp && (
                        <p className="text-xs text-text-tertiary">
                          Escalated at: {new Date(issue.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end space-y-2">
                <button
                  onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
                >
                  {expandedIssue === index ? 'Show Less' : 'Show More'}
                </button>
                {onResolve && (
                  <button
                    onClick={() => onResolve(issue)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default EscalatedIssues

