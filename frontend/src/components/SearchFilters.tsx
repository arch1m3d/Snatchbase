import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface SearchFiltersProps {
  type: 'credentials' | 'systems'
  filters: Record<string, string>
  onChange: (filters: Record<string, string>) => void
}

export default function SearchFilters({ type, filters, onChange }: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value.trim() === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onChange(newFilters)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onChange(newFilters)
  }

  const clearAllFilters = () => {
    onChange({})
  }

  const credentialFilters = [
    { key: 'domain', label: 'Domain', placeholder: 'e.g., google.com' },
    { key: 'username', label: 'Username', placeholder: 'e.g., john@example.com' },
    { key: 'software', label: 'Software', placeholder: 'e.g., Chrome, Firefox' },
    { key: 'stealer_name', label: 'Stealer', placeholder: 'e.g., RedLine, Raccoon' }
  ]

  const systemFilters = [
    { key: 'country', label: 'Country', placeholder: 'e.g., US, RU' },
    { key: 'ip_address', label: 'IP Address', placeholder: 'e.g., 192.168.1.1' },
    { key: 'computer_name', label: 'Computer Name', placeholder: 'e.g., DESKTOP-ABC123' }
  ]

  const activeFilters = type === 'credentials' ? credentialFilters : systemFilters
  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-dark-700/50 pt-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-dark-300">Advanced Filters</h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFilters}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeFilters.map((filter) => (
          <div key={filter.key} className="relative">
            <label className="block text-xs font-medium text-dark-400 mb-2">
              {filter.label}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={filter.placeholder}
                value={filters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="input-field w-full pr-8"
              />
              {filters[filter.key] && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => clearFilter(filter.key)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-dark-700/50"
        >
          <p className="text-xs text-dark-400 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <motion.span
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs"
              >
                <span>{activeFilters.find(f => f.key === key)?.label}: {value}</span>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
