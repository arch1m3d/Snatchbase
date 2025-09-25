import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalResults: number
  resultsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ 
  currentPage, 
  totalResults, 
  resultsPerPage, 
  onPageChange 
}: PaginationProps) {
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 text-sm text-dark-400">
        <span>
          Showing {(currentPage - 1) * resultsPerPage + 1} to{' '}
          {Math.min(currentPage * resultsPerPage, totalResults)} of{' '}
          {totalResults.toLocaleString()} results
        </span>
      </div>

      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200
            ${currentPage === 1
              ? 'text-dark-500 cursor-not-allowed'
              : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }
          `}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`dots-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="h-4 w-4 text-dark-500" />
                </div>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <motion.button
                key={pageNumber}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  px-3 py-2 rounded-lg transition-all duration-200 min-w-[40px]
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-lg glow'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }
                `}
              >
                {pageNumber}
              </motion.button>
            )
          })}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200
            ${currentPage === totalPages
              ? 'text-dark-500 cursor-not-allowed'
              : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }
          `}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  )
}
