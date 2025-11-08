import ThemeSwitch from './ThemeSwitch'

function TopBar({ onSearchChange }) {
  const handleSearchChange = (e) => {
    onSearchChange?.(e.target.value)
  }

  return (
    <header className="h-16 bg-bg-elevated border-b border-border flex items-center px-4 md:px-6">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left: Product Name */}
        <div className="flex items-center flex-shrink-0">
          <h1 className="text-lg md:text-h1 text-text-primary font-semibold whitespace-nowrap">
            DataCenterOps Copilot
          </h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search work orders..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-body text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right: Utility Actions */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          {/* Help */}
          <button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
            aria-label="Help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Theme Switch */}
          <ThemeSwitch />

          {/* Avatar */}
          <button
            className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-medium hover:bg-accent-600 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            aria-label="User menu"
          >
            T
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
