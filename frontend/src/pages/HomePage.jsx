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
import ApprovalRequests from '../components/ApprovalRequests'
import { useToast } from '../hooks/useToast'

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
  const [currentLocation, setCurrentLocation] = useState({ pod: 'Pod-1', aisle: 'Aisle-A' })
  const { toasts, addToast, removeToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in (simplified - in real app, use auth context)
    const token = localStorage.getItem('auth_token')
    if (!token) {
      // For development: auto-login if no token exists
      localStorage.setItem('auth_token', 'demo_token')
      // Uncomment the line below to enable auth redirect in production:
      // navigate('/login')
    }
  }, [navigate])

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

  const handleRunPlan = async (workOrderId) => {
    const workOrder = selectedWorkOrder || { title: 'Work Order', rack: 'Unknown' }
    addToast('Plan execution started', 'info', 'Agent is processing your request...')
    
    // Simulate agent reasoning
    const reasoning = [
      {
        message: `Agent: Analyzing work order "${workOrder.title}" requirements...`,
        timestamp: new Date().toISOString(),
      },
      {
        message: `Agent: Checking inventory availability for required parts at ${workOrder.rack || 'location'}...`,
        timestamp: new Date().toISOString(),
      },
      {
        message: `Agent: Generating optimized procedure steps for ${workOrder.title}...`,
        timestamp: new Date().toISOString(),
      },
      {
        message: `Agent: Calculating shortest path to ${workOrder.location?.pod || 'target location'}...`,
        timestamp: new Date().toISOString(),
      },
    ]
    setAgentReasoning(reasoning)

    // Simulate adding detailed logs
    const newLogs = [
      {
        message: `Agent: Plan execution initiated for "${workOrder.title}"`,
        type: 'info',
        source: 'agent',
        timestamp: new Date().toISOString(),
      },
      {
        message: `Agent: Parsing work order details - Rack: ${workOrder.rack}, Model: ${workOrder.model || 'N/A'}`,
        type: 'info',
        source: 'agent',
        timestamp: new Date().toISOString(),
      },
      {
        message: `Agent: Querying inventory database for part ID: ${workOrder.part_id || 'N/A'}`,
        type: 'info',
        source: 'agent',
        timestamp: new Date().toISOString(),
      },
    ]
    setLogs(prev => [...prev, ...newLogs])

    // After delays, add more specific logs
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        {
          message: `Agent: Inventory check complete - Parts available at ${workOrder.location?.pod || 'Pod-1'}`,
          type: 'success',
          source: 'agent',
          timestamp: new Date().toISOString(),
        },
        {
          message: `Agent: Generated 5-step procedure for ${workOrder.title}`,
          type: 'success',
          source: 'agent',
          timestamp: new Date().toISOString(),
        },
      ])
    }, 1000)

    setTimeout(() => {
      addToast('Plan executed successfully', 'success', 'Agent has generated the repair procedure')
      setLogs(prev => [
        ...prev,
        {
          message: `Agent: Plan generation complete. Ready for technician execution.`,
          type: 'success',
          source: 'agent',
          timestamp: new Date().toISOString(),
        },
        {
          message: `Technician: Reviewing generated procedure steps...`,
          type: 'info',
          source: 'technician',
          timestamp: new Date().toISOString(),
        },
      ])
      setAgentReasoning(prev => [
        ...prev,
        {
          message: 'Plan generation complete. Ready to execute.',
          timestamp: new Date().toISOString(),
        },
      ])
    }, 2000)
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
          ...formData,
          status: 'pending',
          location: {
            pod: formData.pod,
            aisle: formData.aisle,
            aisleType: formData.aisleType,
          },
        }),
      })

      if (response.ok) {
        const newWorkOrder = await response.json()
        addToast('Work order created successfully', 'success', `Created: ${newWorkOrder.title}`)
        setLogs(prev => [
          ...prev,
          {
            message: `Technician: Created new work order "${newWorkOrder.title}"`,
            type: 'success',
            source: 'technician',
            timestamp: new Date().toISOString(),
          },
        ])
        // Refresh the work orders list by triggering a re-fetch
        window.location.reload()
      } else {
        throw new Error('Failed to create work order')
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
                    onRunPlan={handleRunPlan}
                    onAssignClick={() => setAssignmentModalOpen(true)}
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
