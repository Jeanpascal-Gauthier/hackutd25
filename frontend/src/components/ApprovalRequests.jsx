import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import PrimaryButton from './PrimaryButton'
import { useToast } from '../hooks/useToast'

function ApprovalRequests({ isOpen, onClose, workOrderId }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { addToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchApprovalRequests()
    }
  }, [isOpen, workOrderId])

  const fetchApprovalRequests = async () => {
    try {
      setLoading(true)
      // In real app, fetch from API: /api/approval_requests?work_order_id=${workOrderId}
      // For now, use mock data
      const mockRequests = [
        {
          id: 'req-1',
          type: 'purchase',
          title: 'Order GPU A100',
          description: 'Agent requests to order NVIDIA A100 GPU (out of stock)',
          item: 'NVIDIA A100 GPU',
          quantity: 1,
          reason: 'Required part is out of stock. Estimated delivery: 2-3 weeks',
          priority: 'high',
          workOrderId: workOrderId,
          requestedAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending'
        },
        {
          id: 'req-2',
          type: 'purchase',
          title: 'Order PSU Unit',
          description: 'Agent requests to order 1600W PSU for Rack-A12',
          item: '1600W Power Supply Unit',
          quantity: 2,
          reason: 'Current PSU units are failing. Need replacement parts.',
          priority: 'medium',
          workOrderId: workOrderId,
          requestedAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'pending'
        },
        {
          id: 'req-3',
          type: 'access',
          title: 'Request Access to Pod-3',
          description: 'Agent requires access to Pod-3 for maintenance',
          item: 'Pod-3 Access',
          quantity: 1,
          reason: 'Work order requires access to restricted area',
          priority: 'low',
          workOrderId: workOrderId,
          requestedAt: new Date(Date.now() - 1800000).toISOString(),
          status: 'pending'
        }
      ]
      setRequests(mockRequests)
    } catch (err) {
      console.error('Error fetching approval requests:', err)
      addToast('Failed to load approval requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      // In real app: POST /api/approval_requests/${requestId}/approve
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ))
      addToast('Request approved successfully', 'success')
      
      // Remove approved request after a delay
      setTimeout(() => {
        setRequests(prev => prev.filter(req => req.id !== requestId))
      }, 2000)
    } catch (err) {
      addToast('Failed to approve request', 'error')
    }
  }

  const handleReject = async (requestId, reason) => {
    try {
      // In real app: POST /api/approval_requests/${requestId}/reject
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected', rejectionReason: reason } : req
      ))
      addToast('Request rejected', 'info')
      
      // Remove rejected request after a delay
      setTimeout(() => {
        setRequests(prev => prev.filter(req => req.id !== requestId))
      }, 2000)
    } catch (err) {
      addToast('Failed to reject request', 'error')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-danger-50 dark:bg-danger-50 text-danger-600 dark:text-danger-500 border-danger-200 dark:border-danger-200'
      case 'medium':
        return 'bg-warning-50 dark:bg-warning-50 text-warning-600 dark:text-warning-500 border-warning-200 dark:border-warning-200'
      case 'low':
        return 'bg-accent-50 dark:bg-accent-50 text-accent-600 dark:text-accent-500 border-accent-200 dark:border-accent-200'
      default:
        return 'bg-bg-tertiary text-text-secondary border-border'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'purchase':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      case 'access':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-bg-elevated rounded-lg border border-border shadow-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-h1 text-text-primary">Approval Requests</h2>
              <p className="text-sm text-text-secondary mt-1">
                Agent requests requiring engineer approval
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-text-tertiary">Loading requests...</div>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="w-16 h-16 text-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-text-secondary">No pending approval requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="p-4 bg-bg-secondary rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getPriorityColor(request.priority)}`}>
                            {getTypeIcon(request.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-text-primary">{request.title}</h3>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mb-2">{request.description}</p>
                            <div className="space-y-1 text-xs text-text-secondary">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Item:</span>
                                <span>{request.item}</span>
                                {request.quantity > 1 && (
                                  <span className="text-text-tertiary">(Qty: {request.quantity})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Reason:</span>
                                <span>{request.reason}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Requested:</span>
                                <span>{new Date(request.requestedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                          <PrimaryButton
                            onClick={() => handleReject(request.id, 'Not approved')}
                            variant="ghost"
                            className="text-danger-500 hover:text-danger-600"
                          >
                            Reject
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={() => handleApprove(request.id)}
                            variant="primary"
                          >
                            Approve
                          </PrimaryButton>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-success-500 dark:text-success-400">
                            Request approved
                          </p>
                        </div>
                      )}

                      {request.status === 'rejected' && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-danger-500 dark:text-danger-400">
                            Request rejected: {request.rejectionReason || 'Not approved'}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ApprovalRequests

