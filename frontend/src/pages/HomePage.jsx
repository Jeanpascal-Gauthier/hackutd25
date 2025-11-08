import { useState } from 'react'
import TopBar from '../components/TopBar'
import SplitLayout from '../components/SplitLayout'
import WorkOrdersList from '../components/WorkOrdersList'
import WorkOrderDetails from '../components/WorkOrderDetails'

function HomePage() {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
            <WorkOrderDetails workOrderId={selectedWorkOrderId} />
          }
          leftWidth={30}
        />
      </div>
    </div>
  )
}

export default HomePage

