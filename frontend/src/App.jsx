import { useState } from 'react'
import TopBar from './components/TopBar'
import SplitLayout from './components/SplitLayout'
import WorkOrdersList from './components/WorkOrdersList'
import WorkOrderDetails from './components/WorkOrderDetails'
import Toast from './components/Toast'
import LogsDrawer from './components/LogsDrawer'
import { useToast } from './hooks/useToast'

function App() {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const { toasts, addToast, removeToast } = useToast()

  const handleRunPlan = async (workOrderId) => {
    addToast('Plan execution started', 'info', 'Agent is processing your request...')
    
    // Simulate adding logs
    const newLogs = [
      {
        message: 'Plan execution initiated',
        type: 'info',
        timestamp: new Date().toISOString(),
      },
      {
        message: 'Agent analyzing work order requirements',
        type: 'info',
        timestamp: new Date().toISOString(),
      },
    ]
    setLogs(prev => [...prev, ...newLogs])

    // After a delay, add success log
    setTimeout(() => {
      addToast('Plan executed successfully', 'success', 'Agent has generated the repair procedure')
      setLogs(prev => [
        ...prev,
        {
          message: 'Plan generated successfully',
          type: 'success',
          timestamp: new Date().toISOString(),
        },
      ])
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <TopBar onSearchChange={setSearchQuery} />
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
            <WorkOrderDetails
              workOrderId={selectedWorkOrderId}
              onLogsClick={() => setLogsDrawerOpen(true)}
              onRunPlan={handleRunPlan}
            />
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
    </div>
  )
}

export default App
