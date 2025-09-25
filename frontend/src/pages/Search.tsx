import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from 'react-query'
import { 
  Search as SearchIcon, 
  Filter, 
  Download, 
  Eye,
  EyeOff,
  Globe,
  User,
  Shield,
  Calendar,
  MapPin,
  Monitor
} from 'lucide-react'
import { searchCredentials, searchSystems, Credential, System, SearchResponse } from '@/services/api'
import SearchFilters from '@/components/SearchFilters'
import CredentialCard from '@/components/CredentialCard'
import SystemCard from '@/components/SystemCard'
import Pagination from '@/components/Pagination'

type SearchType = 'credentials' | 'systems'

interface SearchParams {
  query: string
  type: SearchType
  filters: Record<string, string>
  page: number
  limit: number
}

export default function Search() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    type: 'credentials',
    filters: {},
    page: 1,
    limit: 50
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  // Search credentials
  const { 
    data: credentials, 
    isLoading: credentialsLoading,
    refetch: refetchCredentials 
  } = useQuery(
    ['search-credentials', searchParams],
    () => searchCredentials({
      q: searchParams.query || undefined,
      domain: searchParams.filters.domain || undefined,
      username: searchParams.filters.username || undefined,
      software: searchParams.filters.software || undefined,
      stealer_name: searchParams.filters.stealer_name || undefined,
      limit: searchParams.limit,
      offset: (searchParams.page - 1) * searchParams.limit
    }),
    { 
      enabled: searchParams.type === 'credentials',
      keepPreviousData: true
    }
  )

  // Search systems
  const { 
    data: systems, 
    isLoading: systemsLoading,
    refetch: refetchSystems 
  } = useQuery(
    ['search-systems', searchParams],
    () => searchSystems({
      q: searchParams.query || undefined,
      country: searchParams.filters.country || undefined,
      ip_address: searchParams.filters.ip_address || undefined,
      computer_name: searchParams.filters.computer_name || undefined,
      limit: searchParams.limit,
      offset: (searchParams.page - 1) * searchParams.limit
    }),
    { 
      enabled: searchParams.type === 'systems',
      keepPreviousData: true
    }
  )

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }))
  }

  const handleFilterChange = (filters: Record<string, string>) => {
    setSearchParams(prev => ({ ...prev, filters, page: 1 }))
  }

  const handleTypeChange = (type: SearchType) => {
    setSearchParams(prev => ({ ...prev, type, page: 1, filters: {} }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }))
  }

  const isLoading = searchParams.type === 'credentials' ? credentialsLoading : systemsLoading
  const results = searchParams.type === 'credentials' ? credentials : systems
  const resultCount = results?.total || 0
  const currentResults = results?.results || []

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Search Intelligence
          </h1>
          <p className="text-dark-400 text-lg">
            Advanced search across stealer log data
          </p>
        </motion.div>

        {/* Search Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-6"
        >
          {/* Search Type Tabs */}
          <div className="flex space-x-1 mb-6 bg-dark-800/50 p-1 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeChange('credentials')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${searchParams.type === 'credentials'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }
              `}
            >
              <Shield className="h-4 w-4" />
              <span>Credentials</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeChange('systems')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${searchParams.type === 'systems'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                }
              `}
            >
              <Monitor className="h-4 w-4" />
              <span>Systems</span>
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                placeholder={`Search ${searchParams.type}...`}
                value={searchParams.query}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`
                btn-secondary flex items-center space-x-2
                ${showFilters ? 'bg-primary-600 text-white' : ''}
              `}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </motion.button>
            
            {searchParams.type === 'credentials' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPasswords(!showPasswords)}
                className="btn-secondary flex items-center space-x-2"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SearchFilters
                  type={searchParams.type}
                  filters={searchParams.filters}
                  onChange={handleFilterChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">
                {isLoading ? 'Searching...' : `${resultCount} ${searchParams.type} found`}
              </h2>
              
              {resultCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </motion.button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dark-400">
              <span>Page {searchParams.page}</span>
              <span>•</span>
              <span>{searchParams.limit} per page</span>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-24 bg-dark-700/50 rounded"></div>
                </div>
              ))}
            </div>
          ) : resultCount === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-dark-500" />
              <h3 className="text-xl font-semibold text-dark-300 mb-2">
                No results found
              </h3>
              <p className="text-dark-400">
                Try adjusting your search terms or filters
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {searchParams.type === 'credentials' && credentials?.results?.map((credential, index) => (
                  <motion.div
                    key={credential.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CredentialCard 
                      credential={credential} 
                      showPassword={showPasswords}
                    />
                  </motion.div>
                ))}
                
                {searchParams.type === 'systems' && systems?.results?.map((system, index) => (
                  <motion.div
                    key={system.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SystemCard system={system} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Pagination */}
              {resultCount > searchParams.limit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <Pagination
                    currentPage={searchParams.page}
                    totalResults={resultCount}
                    resultsPerPage={searchParams.limit}
                    onPageChange={handlePageChange}
                  />
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
