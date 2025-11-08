import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'

function ThemeSwitch() {
  const { theme, accent, updateTheme, updateAccent } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const accents = [
    { id: 'blue', name: 'Blue', color: '#3B82F6' },
    { id: 'indigo', name: 'Indigo', color: '#6366F1' },
    { id: 'emerald', name: 'Emerald', color: '#10B981' },
  ]

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'system', name: 'System', icon: '💻' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
        aria-label="Theme settings"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-bg-elevated border border-border rounded-lg shadow-lg z-50 p-4 space-y-4"
            >
              {/* Accent Color Selection */}
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {accents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => updateAccent(a.id)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        accent === a.id
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-50'
                          : 'border-border hover:border-accent-200'
                      }`}
                      aria-label={`Select ${a.name} accent`}
                    >
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: a.color }}
                      />
                      <span className="text-xs text-text-secondary mt-1 block">
                        {a.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="text-xs font-medium text-text-secondary mb-2 block">
                  Theme
                </label>
                <div className="space-y-1">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        updateTheme(t.id)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        theme === t.id
                          ? 'bg-accent-50 dark:bg-accent-50 text-accent-600 dark:text-accent-400 font-medium'
                          : 'text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <span className="mr-2">{t.icon}</span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeSwitch

