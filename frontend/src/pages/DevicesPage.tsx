import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Server, 
  Search, 
  MapPin, 
  Calendar,
  Key,
  Globe,
  ChevronRight,
  Activity,
  Database
} from 'lucide-react'
import { fetchDevices } from '@/services/api'
import { getCountryInfo } from '@/utils/countries'

interface Device {
  id: number
  device_id: string
  device_name: string
  hostname?: string
  ip_address?: string
  country?: string
  antivirus?: string
  infection_date?: string
  upload_batch: string
  total_files: number
  total_credentials: number
  total_domains: number
  total_urls: number
  created_at: string
}
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [antivirusFilter, setAntivirusFilter] = useState('')
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  
  // Get unique countries and antiviruses for filters
  const uniqueCountries = Array.from(new Set(devices.map(d => d.country).filter(Boolean)))
  const uniqueAntiviruses = Array.from(new Set(devices.map(d => d.antivirus).filter(Boolean)))

  useEffect(() => {
    loadDevices()
  }, [page, searchQuery])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await fetchDevices({
        q: searchQuery || undefined,
        limit: 20,
        offset: page * 20
      })
      setDevices(response.results)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  // Filter devices based on selected filters
  const filteredDevices = devices.filter(device => {
    if (countryFilter && device.country !== countryFilter) return false
    if (antivirusFilter && device.antivirus !== antivirusFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Server className="h-10 w-10 text-primary-500" />
          Infected Devices
        </h1>
        <p className="text-dark-400">
          Browse through {total.toLocaleString()} compromised machines
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search devices by name, IP, or country..."
            className="w-full pl-12 pr-4 py-4 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 flex gap-4"
      >
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
        >
          <option value="">All Countries</option>
          {uniqueCountries.map(country => {
            const countryInfo = getCountryInfo(country)
            return (
              <option key={country} value={country}>
                {countryInfo ? `${countryInfo.flag} ${countryInfo.name}` : country}
              </option>
            )
          })}
        </select>

        <select
          value={antivirusFilter}
          onChange={(e) => setAntivirusFilter(e.target.value)}
          className="px-4 py-2 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
        >
          <option value="">All Antivirus</option>
          {uniqueAntiviruses.map(av => (
            <option key={av} value={av}>{av}</option>
          ))}
        </select>

        {(countryFilter || antivirusFilter) && (
          <button
            onClick={() => {
              setCountryFilter('')
              setAntivirusFilter('')
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
          >
            Clear Filters
          </button>
        )}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Devices</p>
              <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Avg Credentials</p>
              <p className="text-2xl font-bold text-white">
                {devices.length > 0 
                  ? Math.round(devices.reduce((acc, d) => acc + d.total_credentials, 0) / devices.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Avg Domains</p>
              <p className="text-2xl font-bold text-white">
                {devices.length > 0 
                  ? Math.round(devices.reduce((acc, d) => acc + d.total_domains, 0) / devices.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Devices Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="h-12 w-12 text-primary-500" />
          </motion.div>
        </div>
      ) : filteredDevices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDevices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  onClick={() => navigate(`/device/${device.id}`)}
                  className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl hover:border-primary-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl group-hover:scale-110 transition-transform">
                        <Server className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                          {device.hostname || device.device_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {device.country && (() => {
                            const countryInfo = getCountryInfo(device.country)
                            return countryInfo && (
                              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg flex items-center gap-1 border border-blue-500/20">
                                <span>{countryInfo.flag}</span>
                                {countryInfo.name}
                              </span>
                            )
                          })()}
                          {device.ip_address && (
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg font-mono border border-purple-500/20">
                              📍 {device.ip_address}
                            </span>
                          )}
                          {device.antivirus && (
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg border border-green-500/20">
                              🛡️ {device.antivirus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-dark-700/30 rounded-xl">
                      <p className="text-2xl font-bold text-white">{device.total_credentials.toLocaleString()}</p>
                      <p className="text-xs text-dark-400 mt-1">Credentials</p>
                    </div>
                    <div className="text-center p-3 bg-dark-700/30 rounded-xl">
                      <p className="text-2xl font-bold text-white">{device.total_domains.toLocaleString()}</p>
                      <p className="text-xs text-dark-400 mt-1">Domains</p>
                    </div>
                    <div className="text-center p-3 bg-dark-700/30 rounded-xl">
                      <p className="text-2xl font-bold text-white">{device.total_files.toLocaleString()}</p>
                      <p className="text-xs text-dark-400 mt-1">Files</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {device.infection_date && (
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg flex items-center gap-1 border border-red-500/20">
                        <Calendar className="h-3 w-3" />
                        Infected: {(() => {
                          // Parse DD.MM.YYYY HH:MM:SS format (European: day/month/year)
                          const parts = device.infection_date.split(' ')[0].split('.')
                          if (parts.length === 3) {
                            const [day, month, year] = parts
                            // Create date with month-1 because JS months are 0-indexed
                            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                            return date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          }
                          return device.infection_date
                        })()}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-dark-700/50 text-dark-300 rounded-lg flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Ingested: {new Date(device.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium"
              >
                Previous
              </button>
              
              <span className="text-dark-300 px-4">
                Page {page + 1} of {Math.ceil(total / 20)}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 20 >= total}
                className="px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Server className="h-16 w-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No devices found</h3>
          <p className="text-dark-400">Try adjusting your search query</p>
        </div>
      )}
    </div>
  )
}
