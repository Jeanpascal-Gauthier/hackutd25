import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatusChip from './StatusChip'
import StatCard from './StatCard'
import Timeline from './Timeline'
import PrimaryButton from './PrimaryButton'
import InventoryBadge from './InventoryBadge'
import IssueReportForm from './IssueReportForm'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useAuth } from '../contexts/AuthContext'

function WorkOrderDetails({ workOrderId, onLogsClick, onAssignClick, onIssueEscalate }) {
  const { isEngineer } = useAuth()
  const [workOrder, setWorkOrder] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [issueFormOpen, setIssueFormOpen] = useState(false)
  const [selectedStepIndex, setSelectedStepIndex] = useState(null)
  const [loadingStepId, setLoadingStepId] = useState(null)
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderDetails()
    }
  }, [workOrderId])

  const fetchWorkOrderDetails = async () => {
    if (!workOrderId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch work order
      const woResponse = await fetch(`/api/work_orders/${workOrderId}`)
      if (!woResponse.ok) throw new Error('Failed to fetch work order')
      const woData = await woResponse.json()
      setWorkOrder(woData)

      // Fetch steps for this work order
      const stepsResponse = await fetch(`/api/work_orders/${workOrderId}/steps`)
      if (stepsResponse.ok) {
        const stepsData = await stepsResponse.json()
        // Transform API steps to match Timeline component format
        const transformedSteps = stepsData.map(step => ({
          id: step.id,
          title: `Step ${step.step_number}`,
          description: step.description,
          step_number: step.step_number,
          status: step.status,
          executor: step.executor,
          result: step.result,
          executed_at: step.executed_at,
        }))
        setSteps(transformedSteps)
      } else {
        // No steps yet or error - set empty array
        setSteps([])
      }

      // Try to find relevant inventory items based on work order title/description
      // Look for common component keywords
      const inventoryKeywords = ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'memory', 'storage', 'server', 'rack', 'cable', 'power', 'PSU', 'UPS', 'network', 'ethernet', 'fiber']
      const workOrderText = `${woData.title || ''} ${woData.description || ''}`.toUpperCase()
      
      const matchedKeywords = inventoryKeywords.filter(keyword => 
        workOrderText.includes(keyword.toUpperCase())
      )
      
      if (matchedKeywords.length > 0) {
        try {
          // Search inventory for items matching the keywords
          const searchQuery = matchedKeywords[0] // Use first matched keyword
          const invResponse = await fetch(`/api/inventory/search?q=${encodeURIComponent(searchQuery)}`)
          if (invResponse.ok) {
            const invData = await invResponse.json()
            // Get the first matching inventory item
            if (invData && invData.length > 0) {
              setInventory(invData[0])
            }
          }
        } catch (err) {
          console.error('Error fetching inventory:', err)
        }
      }

    } catch (err) {
      setError(err.message)
      console.error('Error fetching work order details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRunStep = async (stepIndex) => {
    const step = steps[stepIndex]
    // Simulate step execution with detailed logs
    const updatedSteps = [...steps]
    const success = Math.random() > 0.2 // 80% success rate
    
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: success,
        message: success 
          ? `${step.title} completed successfully` 
          : `${step.title} failed - retry required`,
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
    
    // Add detailed activity logs
    if (onLogsClick) {
      // This would be passed from parent to add logs
      // For now, we'll trigger the logs drawer to show
    }
    
    if (success) {
      setCurrentStep(stepIndex + 1)
    }
  }

  const handleStepComplete = async (stepId, workOrderId) => {
    setLoadingStepId(stepId)
    try {
      const response = await fetch('/api/work_orders/confirm_step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step_id: stepId,
          work_order_id: workOrderId,
        }),
      })

      if (response.ok) {
        // Refresh steps after confirmation
        await fetchWorkOrderDetails()
        // Add log entry
        if (onLogsClick) {
          // This will be handled by parent component
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to confirm step')
      }
    } catch (err) {
      console.error('Error confirming step:', err)
      alert('Failed to confirm step: ' + err.message)
    } finally {
      setLoadingStepId(null)
    }
  }

  const handleStepFail = (stepIndex) => {
    const updatedSteps = [...steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      result: {
        success: false,
        message: 'Step marked as failed - replan required',
        timestamp: new Date().toISOString(),
      },
    }
    setSteps(updatedSteps)
  }

  const handleReportIssue = (stepIndex) => {
    setSelectedStepIndex(stepIndex)
    setIssueFormOpen(true)
  }

  const handleIssueSubmit = async (issueReport) => {
    setIsSubmittingIssue(true)
    try {
      // Find the step by index
      const step = steps[issueReport.stepIndex]
      if (!step || !step.id) {
        throw new Error('Step not found')
      }

      let response
      
      if (issueReport.escalateToEngineer) {
        // Send to escalation endpoint
        const escalationMessage = `Issue with Step ${step.step_number || issueReport.stepIndex + 1}: ${issueReport.description}`
        
        response = await fetch('/api/escalations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            work_order_id: workOrderId,
            message: escalationMessage,
            source: 'technician',
          }),
        })

        if (response.ok) {
          const result = await response.json()
          // Close the modal first
          setIssueFormOpen(false)
          setSelectedStepIndex(null)
          // Refresh work order details to show updated status
          await fetchWorkOrderDetails()
          // Notify parent component if callback exists
          if (onIssueEscalate) {
            onIssueEscalate(issueReport, workOrderId, workOrder?.title)
          }
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to escalate issue')
        }
      } else {
        // Send to AI regeneration endpoint
        response = await fetch('/api/work_orders/issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step_id: step.id,
            work_order_id: workOrderId,
            issue_description: issueReport.description,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          // Close the modal first
          setIssueFormOpen(false)
          setSelectedStepIndex(null)
          // Refresh steps after regeneration
          await fetchWorkOrderDetails()
          // Add log entry
          if (onLogsClick) {
            // This will be handled by parent component
          }
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to report issue')
        }
      }
    } catch (err) {
      console.error('Error submitting issue report:', err)
      alert('Failed to report issue: ' + err.message)
    } finally {
      setIsSubmittingIssue(false)
    }
  }

  const formatSLA = () => {
    if (!workOrder?.created_at) return 'N/A'
    try {
      const created = new Date(workOrder.created_at)
      const now = new Date()
      const diffMs = now - created
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      // Handle negative time (timezone issues)
      if (hours < 0) {
        return 'Just created'
      }
      
      if (hours === 0) {
        return `${minutes}m`
      }
      
      return `${hours}h ${minutes}m`
    } catch (e) {
      return 'N/A'
    }
  }

  if (!workOrderId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-text-tertiary">
            Select a work order to view details
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-tertiary rounded w-3/4" />
          <div className="h-4 bg-bg-tertiary rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-bg-tertiary rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !workOrder) {
    return (
      <div className="p-8">
        <div className="bg-danger-50 dark:bg-danger-50 border border-danger-200 dark:border-danger-200 rounded-lg p-4">
          <p className="text-sm text-danger-600 dark:text-danger-500">
            Error loading work order: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-y-auto"
    >
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-h1 text-text-primary mb-2">
                {workOrder?.title || 'Work Order Details'}
              </h1>
              <div className="flex items-center space-x-4 text-body text-text-secondary">
                {workOrder?.rack && (
                  <span className="font-mono text-code">{workOrder.rack}</span>
                )}
                {workOrder?.model && (
                  <span>{workOrder.model}</span>
                )}
                {workOrder?.part_id && (
                  <span className="font-mono text-code">Part: {workOrder.part_id}</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {workOrder?.status && (
                <StatusChip status={workOrder.status} />
              )}
              {inventory && (
                <InventoryBadge
                  available={inventory.available}
                  quantity={inventory.quantity}
                  location={inventory.location}
                />
              )}
            </div>
          </div>
        </div>

        {/* Key Info Strip */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Inventory Status"
            value={inventory?.available ? 'Available' : 'Unavailable'}
            variant={inventory?.available ? 'success' : 'danger'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            label="Qty @ Site"
            value={inventory?.quantity ?? 'N/A'}
            variant="default"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="SLA Clock"
            value={formatSLA()}
            variant="warning"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Steps Timeline */}
        <div className="bg-bg-elevated border border-border rounded-lg shadow-sm p-6 relative">
          <h2 className="text-h2 text-text-primary mb-6">Procedure Steps</h2>
          {steps.length === 0 ? (
            <div className="text-sm text-text-tertiary text-center py-8">
              No steps available yet. The agent is generating steps...
            </div>
          ) : (
            <Timeline
              steps={steps}
              workOrderId={workOrderId}
              onConfirmStep={handleStepComplete}
              onReportIssue={handleReportIssue}
              loadingStepId={loadingStepId}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-3">
            {isEngineer() && onAssignClick && (
              <PrimaryButton
                onClick={onAssignClick}
                variant="ghost"
              >
                Assign
              </PrimaryButton>
            )}
          </div>
          <button
            onClick={onLogsClick}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            View Logs →
          </button>
        </div>
      </div>

      {/* Issue Report Form Modal */}
      {selectedStepIndex !== null && (
        <IssueReportForm
          isOpen={issueFormOpen}
          onClose={() => {
            setIssueFormOpen(false)
            setSelectedStepIndex(null)
          }}
          stepTitle={steps[selectedStepIndex]?.title || `Step ${selectedStepIndex + 1}`}
          stepIndex={selectedStepIndex}
          onSubmit={handleIssueSubmit}
          isSubmitting={isSubmittingIssue}
        />
      )}
    </motion.div>
  )
}

export default WorkOrderDetails
