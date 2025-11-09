import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import SplitLayout from '../components/SplitLayout'
import WorkOrdersList from '../components/WorkOrdersList'
import WorkOrderDetails from '../components/WorkOrderDetails'
import LocationGuidance from '../components/LocationGuidance'
import AgentReasoningFeed from '../components/AgentReasoningFeed'
import PathfindingCard from '../components/PathfindingCard'
import Toast from '../components/Toast'
import LogsDrawer from '../components/LogsDrawer'
import CreateWorkOrderModal from '../components/CreateWorkOrderModal'
import WorkOrderAssignment from '../components/WorkOrderAssignment'
import EscalatedIssues from '../components/EscalatedIssues'
import ApprovalRequests from '../components/ApprovalRequests'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'

function HomePage() {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [agentReasoning, setAgentReasoning] = useState([])
  const [escalatedIssues, setEscalatedIssues] = useState([])
  const [currentLocation, setCurrentLocation] = useState({ pod: 'Pod-1', aisle: 'Aisle-A' })
  const { toasts, addToast, removeToast } = useToast()
  const { user, isEngineer } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Load escalated issues from localStorage (in real app, fetch from API)
    const stored = localStorage.getItem('escalated_issues')
    if (stored) {
      try {
        setEscalatedIssues(JSON.parse(stored))
      } catch (err) {
        console.error('Error loading escalated issues:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedWorkOrderId) {
      fetchWorkOrder(selectedWorkOrderId)
    } else {
      setSelectedWorkOrder(null)
    }
  }, [selectedWorkOrderId])

  const fetchWorkOrder = async (id) => {
    try {
      const response = await fetch(`/api/work_orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedWorkOrder(data)
      } else {
        // If API fails, create a mock work order from the list
        const mockWorkOrder = {
          id: id,
          title: `Work Order #${id}`,
          status: 'pending',
          severity: 'high',
          rack: `Rack-${String.fromCharCode(64 + (id % 26))}${id}`,
          model: 'NVIDIA A100',
          part_id: `part-${id}`,
          created_at: new Date().toISOString(),
          location: {
            pod: `Pod-${Math.ceil(id / 8)}`,
            aisle: `Aisle-${String.fromCharCode(65 + (id % 2))}`,
            aisleType: id % 2 === 0 ? 'cold' : 'hot'
          }
        }
        setSelectedWorkOrder(mockWorkOrder)
      }
    } catch (err) {
      console.error('Error fetching work order:', err)
      // Fallback to mock data
      const mockWorkOrder = {
        id: id,
        title: `Work Order #${id}`,
        status: 'pending',
        severity: 'high',
        rack: `Rack-${String.fromCharCode(64 + (id % 26))}${id}`,
        model: 'NVIDIA A100',
        part_id: `part-${id}`,
        created_at: new Date().toISOString(),
        location: {
          pod: `Pod-${Math.ceil(id / 8)}`,
          aisle: `Aisle-${String.fromCharCode(65 + (id % 2))}`,
          aisleType: id % 2 === 0 ? 'cold' : 'hot'
        }
      }
      setSelectedWorkOrder(mockWorkOrder)
    }
  }

  const getPathToLocation = (targetLocation) => {
    if (!targetLocation) return null
    // Simulate pathfinding - in real app, call /api/pathfind
    return ['Pod-1', 'Pod-2', targetLocation.pod]
  }

  const handleCreateWorkOrder = async (formData) => {
    try {
      const response = await fetch('/api/work_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || '',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        addToast('Work order created successfully', 'success', `Agent is generating steps for: ${formData.title}`)
        setLogs(prev => [
          ...prev,
          {
            message: `Engineer: Created new work order "${formData.title}"`,
            type: 'success',
            source: 'engineer',
            timestamp: new Date().toISOString(),
          },
          {
            message: `Agent: Analyzing work order and generating steps...`,
            type: 'info',
            source: 'agent',
            timestamp: new Date().toISOString(),
          },
        ])
        // Refresh the work orders list by triggering a re-fetch
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create work order')
      }
    } catch (err) {
      addToast('Failed to create work order', 'error', err.message)
      throw err
    }
  }

  const handleAssignWorkOrder = async (workOrderId, technicianId) => {
    try {
      const response = await fetch(`/api/work_orders/${workOrderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ technician_id: technicianId }),
      })

      if (response.ok) {
        addToast('Work order assigned successfully', 'success', 'Technician notified')
        setLogs(prev => [
          ...prev,
          {
            message: `Technician: Assigned work order "${selectedWorkOrder?.title || 'Work Order'}" to technician`,
            type: 'success',
            source: 'technician',
            timestamp: new Date().toISOString(),
          },
        ])
      } else {
        throw new Error('Failed to assign work order')
      }
    } catch (err) {
      addToast('Failed to assign work order', 'error', err.message)
      throw err
    }
  }

  const handleIssueEscalation = (issueReport, workOrderId, workOrderTitle) => {
    if (issueReport.escalateToEngineer) {
      const escalatedIssue = {
        id: Date.now(),
        ...issueReport,
        workOrderId,
        workOrderTitle,
        technicianName: user?.name || 'Technician',
        escalated: true,
      }
      const updated = [...escalatedIssues, escalatedIssue]
      setEscalatedIssues(updated)
      localStorage.setItem('escalated_issues', JSON.stringify(updated))
      addToast('Issue escalated to engineer', 'info', 'Engineers have been notified')
    }
  }

  const handleResolveEscalatedIssue = (issue) => {
    const updated = escalatedIssues.filter(i => i.id !== issue.id)
    setEscalatedIssues(updated)
    localStorage.setItem('escalated_issues', JSON.stringify(updated))
    addToast('Escalated issue resolved', 'success', 'Issue has been marked as resolved')
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <TopBar 
        onSearchChange={setSearchQuery} 
        onCreateClick={() => setCreateModalOpen(true)}
        onApprovalsClick={() => setApprovalModalOpen(true)}
      />
      <div className="relative">
        <SplitLayout
          leftPane={
            <WorkOrdersList
              selectedId={selectedWorkOrderId}
              onSelect={setSelectedWorkOrderId}
              searchQuery={searchQuery}
            />
          }
          rightPane={
            <div className="h-full overflow-y-auto p-6 space-y-6">
              {/* Escalated Issues Section (Engineers Only) */}
              {isEngineer() && (
                <EscalatedIssues
                  escalatedIssues={escalatedIssues}
                  onResolve={handleResolveEscalatedIssue}
                />
              )}

              {selectedWorkOrder ? (
                <>
                  {/* Location Guidance */}
                  {selectedWorkOrder.location && (
                    <LocationGuidance workOrder={selectedWorkOrder} />
                  )}

                  {/* Pathfinding */}
                  {selectedWorkOrder.location && (
                    <PathfindingCard
                      fromLocation={currentLocation}
                      toLocation={selectedWorkOrder.location}
                      path={getPathToLocation(selectedWorkOrder.location)}
                    />
                  )}

                  {/* Work Order Details */}
                  <WorkOrderDetails
                    workOrderId={selectedWorkOrderId}
                    onLogsClick={() => setLogsDrawerOpen(true)}
                    onAssignClick={() => setAssignmentModalOpen(true)}
                    onIssueEscalate={(issueReport) => handleIssueEscalation(issueReport, selectedWorkOrderId, selectedWorkOrder?.title)}
                  />

                  {/* Agent Reasoning Feed */}
                  <div className="bg-bg-elevated rounded-lg border border-border shadow-sm p-6">
                    <h2 className="text-h2 text-text-primary mb-4">Agent Reasoning</h2>
                    <AgentReasoningFeed
                      reasoning={agentReasoning}
                      isActive={agentReasoning.length > 0}
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-100 dark:bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-accent-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-body text-text-tertiary">
                      Select a work order to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          }
          leftWidth={30}
        />
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
      <LogsDrawer
        isOpen={logsDrawerOpen}
        onClose={() => setLogsDrawerOpen(false)}
        logs={logs}
      />
      <CreateWorkOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateWorkOrder}
      />
      <WorkOrderAssignment
        workOrder={selectedWorkOrder}
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        onAssign={handleAssignWorkOrder}
      />
      <ApprovalRequests
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        workOrderId={selectedWorkOrderId}
      />
    </div>
  )
}

export default HomePage
