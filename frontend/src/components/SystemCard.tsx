import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  MapPin, 
  Calendar, 
  User, 
  Wifi, 
  HardDrive,
  Copy,
  Flag
} from 'lucide-react'
import { System } from '@/services/api'
import toast from 'react-hot-toast'

interface SystemCardProps {
  system: System
}

export default function SystemCard({ system }: SystemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return '🏳️'
    
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'RU': '🇷🇺', 'CN': '🇨🇳', 'DE': '🇩🇪', 'GB': '🇬🇧',
      'FR': '🇫🇷', 'IN': '🇮🇳', 'BR': '🇧🇷', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'JP': '🇯🇵', 'KR': '🇰🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱',
      'PL': '🇵🇱', 'TR': '🇹🇷', 'MX': '🇲🇽', 'UA': '🇺🇦', 'VN': '🇻🇳'
    }
    
    return flags[countryCode.toUpperCase()] || '🏳️'
  }

  const getRiskLevel = (system: System) => {
    // Simple risk assessment based on available data
    let risk = 0
    
    if (system.ip_address) risk += 1
    if (system.hardware_id) risk += 1
    if (system.machine_id) risk += 1
    if (system.computer_name) risk += 1
    
    if (risk >= 3) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' }
    if (risk >= 2) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' }
  }

  const riskAssessment = getRiskLevel(system)

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="card group cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-dark-700/50 rounded-lg group-hover:bg-dark-600/50 transition-colors">
              <Monitor className="h-5 w-5 text-blue-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {system.computer_name || system.machine_id || 'Unknown System'}
                </h3>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${riskAssessment.bg} ${riskAssessment.color}`}
                >
                  <span>{riskAssessment.level} Risk</span>
                </motion.div>
              </div>
              
              <p className="text-sm text-dark-400 truncate">
                {system.machine_user || 'Unknown User'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-dark-500">
            {formatDate(system.created_at)}
          </span>
          
          {system.country && (
            <div className="flex items-center space-x-1">
              <span className="text-lg">{getCountryFlag(system.country)}</span>
              <span className="text-xs text-dark-400">{system.country}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {system.ip_address && (
          <div className="flex items-center space-x-3">
            <Wifi className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-300 font-mono">{system.ip_address}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(system.ip_address!, 'IP Address')
                }}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Copy IP
              </motion.button>
            </div>
          </div>
        )}
        
        {system.country && (
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCountryFlag(system.country)}</span>
                <p className="text-sm text-dark-300">{system.country}</p>
              </div>
            </div>
          </div>
        )}
        
        {system.log_date && (
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-300">{system.log_date}</p>
              <p className="text-xs text-dark-500">Compromise Date</p>
            </div>
          </div>
        )}
        
        {system.machine_user && (
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-300">{system.machine_user}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(system.machine_user!, 'Username')
                }}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Copy User
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="border-t border-dark-700/50 pt-4 space-y-3">
          {system.machine_id && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">Machine ID:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white font-mono">
                  {system.machine_id}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(system.machine_id!, 'Machine ID')
                  }}
                  className="text-dark-400 hover:text-primary-400 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          )}
          
          {system.hardware_id && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">Hardware ID:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white font-mono truncate max-w-xs">
                  {system.hardware_id}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(system.hardware_id!, 'Hardware ID')
                  }}
                  className="text-dark-400 hover:text-primary-400 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">Upload ID:</span>
            <span className="text-sm text-dark-300 font-mono">
              {system.upload_id.substring(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">Discovered:</span>
            <span className="text-sm text-dark-300">
              {formatDate(system.created_at)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Expand Indicator */}
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        className="flex justify-center mt-4 pt-4 border-t border-dark-700/50"
      >
        <div className="w-6 h-1 bg-dark-600 rounded-full" />
      </motion.div>
    </motion.div>
  )
}
