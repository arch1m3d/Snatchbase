import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  User, 
  Key, 
  Calendar, 
  Shield, 
  Copy, 
  Eye, 
  EyeOff,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { Credential } from '@/services/api'
import toast from 'react-hot-toast'

interface CredentialCardProps {
  credential: Credential
  showPassword?: boolean
}

export default function CredentialCard({ credential, showPassword = false }: CredentialCardProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(showPassword)
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

  const getSeverityColor = (stealer?: string) => {
    if (!stealer) return 'text-gray-400'
    const stealerLower = stealer.toLowerCase()
    if (stealerLower.includes('redline') || stealerLower.includes('vidar')) {
      return 'text-red-400'
    }
    if (stealerLower.includes('raccoon') || stealerLower.includes('mars')) {
      return 'text-yellow-400'
    }
    return 'text-blue-400'
  }

  const getDomainRisk = (domain?: string) => {
    if (!domain) return null
    const riskDomains = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'twitter']
    const isHighRisk = riskDomains.some(risk => domain.toLowerCase().includes(risk))
    return isHighRisk ? 'high' : 'low'
  }

  const domainRisk = getDomainRisk(credential.domain)

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
              <Globe className="h-5 w-5 text-primary-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {credential.domain || credential.host || 'Unknown Domain'}
                </h3>
                
                {domainRisk === 'high' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>High Risk</span>
                  </motion.div>
                )}
                
                {credential.stealer_name && (
                  <span className={`px-2 py-1 text-xs rounded-full bg-dark-700/50 ${getSeverityColor(credential.stealer_name)}`}>
                    {credential.stealer_name}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-dark-400 truncate">
                {credential.software || 'Unknown Software'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-dark-500">
            {formatDate(credential.created_at)}
          </span>
          
          {credential.host && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                window.open(credential.host.startsWith('http') ? credential.host : `https://${credential.host}`, '_blank')
              }}
              className="p-1 text-dark-400 hover:text-primary-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {credential.username && (
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-300 truncate">{credential.username}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(credential.username!, 'Username')
                }}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Copy
              </motion.button>
            </div>
          </div>
        )}
        
        {credential.password && (
          <div className="flex items-center space-x-3">
            <Key className="h-4 w-4 text-dark-400" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-dark-300 font-mono">
                  {isPasswordVisible ? credential.password : '••••••••'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPasswordVisible(!isPasswordVisible)
                  }}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(credential.password!, 'Password')
                  }}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Copy
                </motion.button>
              </div>
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
          {credential.email_domain && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">Email Domain:</span>
              <span className="text-sm text-white">{credential.email_domain}</span>
            </div>
          )}
          
          {credential.local_part && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">Local Part:</span>
              <span className="text-sm text-white">{credential.local_part}</span>
            </div>
          )}
          
          {credential.filepath && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">File Path:</span>
              <span className="text-sm text-white font-mono truncate max-w-xs">
                {credential.filepath}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">Upload ID:</span>
            <span className="text-sm text-dark-300 font-mono">
              {credential.upload_id.substring(0, 8)}...
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
