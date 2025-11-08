import { useState } from 'react'

function SplitLayout({ leftPane, rightPane, leftWidth = 30 }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [leftPaneWidth, setLeftPaneWidth] = useState(leftWidth)

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Left Pane */}
      <div
        className={`
          transition-all duration-200 border-r border-slate-200 dark:border-slate-800
          flex-shrink-0 overflow-y-auto bg-white dark:bg-slate-900
        `}
        style={{ 
          width: isCollapsed ? 0 : `${leftPaneWidth}%`,
          minWidth: isCollapsed ? 0 : undefined,
          overflow: isCollapsed ? 'hidden' : 'auto'
        }}
      >
        {!isCollapsed && leftPane}
      </div>

      {/* Resizer */}
      {!isCollapsed && (
        <div
          className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-brand-500 cursor-col-resize flex-shrink-0 transition-colors relative z-10"
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = leftPaneWidth

            const handleMouseMove = (moveEvent) => {
              const deltaX = moveEvent.clientX - startX
              const containerWidth = window.innerWidth
              const newWidth = ((startWidth / 100) * containerWidth + deltaX) / containerWidth * 100
              const clampedWidth = Math.max(25, Math.min(35, newWidth))
              setLeftPaneWidth(clampedWidth)
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 z-20
          w-6 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          rounded-r-lg flex items-center justify-center
          hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200
          ${isCollapsed ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Pane */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {rightPane}
      </div>
    </div>
  )
}

export default SplitLayout

