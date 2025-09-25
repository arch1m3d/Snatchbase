import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'primary' | 'red' | 'green' | 'purple' | 'yellow'
  isLoading?: boolean
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

const colorClasses = {
  primary: {
    icon: 'text-primary-500',
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/20',
    glow: 'group-hover:shadow-primary-500/20'
  },
  red: {
    icon: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'group-hover:shadow-red-500/20'
  },
  green: {
    icon: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'group-hover:shadow-green-500/20'
  },
  purple: {
    icon: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/20'
  },
  yellow: {
    icon: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'group-hover:shadow-yellow-500/20'
  }
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLoading, 
  change 
}: StatsCardProps) {
  const colors = colorClasses[color]
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className={`
        group card relative overflow-hidden transition-all duration-300
        hover:shadow-2xl ${colors.glow}
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 ${colors.bg} opacity-50`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          
          {change && (
            <div className={`
              flex items-center text-sm font-medium
              ${change.type === 'increase' ? 'text-green-400' : 'text-red-400'}
            `}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="loading-dots flex space-x-1">
                <span className="w-2 h-2 bg-dark-500 rounded-full"></span>
                <span className="w-2 h-2 bg-dark-500 rounded-full"></span>
                <span className="w-2 h-2 bg-dark-500 rounded-full"></span>
              </div>
            </div>
          ) : (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white"
            >
              {formatNumber(value)}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        whileHover={{
          translateX: '200%',
          transition: { duration: 0.6 }
        }}
      />
    </motion.div>
  )
}
