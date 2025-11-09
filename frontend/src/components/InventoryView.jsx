import { useState, useEffect } from 'react'

function InventoryView() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Inventory</h2>
        <p className="text-slate-600">View parts availability and locations</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by item name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600">Total Items</div>
          <div className="text-2xl font-semibold text-slate-900">{inventory.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600">Available Items</div>
          <div className="text-2xl font-semibold text-green-600">
            {inventory.filter(item => item.available).length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm text-slate-600">Low Stock Items</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {inventory.filter(item => item.quantity > 0 && item.quantity < 10).length}
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center">
            <p className="text-slate-500">No inventory items found</p>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-900 mb-1">
                      {item.name}
                    </h3>
                    {item.cost && item.cost !== 'N/A' && (
                      <p className="text-sm text-slate-600 mb-3">Cost: ${item.cost}</p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded border ${
                      item.available
                        ? item.quantity < 10
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {item.available 
                      ? item.quantity < 10 
                        ? 'LOW STOCK' 
                        : 'AVAILABLE' 
                      : 'OUT OF STOCK'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium text-slate-900">{item.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quantity:</span>
                    <span className="font-medium text-slate-900">{item.quantity || 0}</span>
                  </div>
                  {item.reserved && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-medium text-orange-600">Reserved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default InventoryView

