import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { Globe, TrendingUp } from 'lucide-react'
import { fetchDomainStats } from '@/services/api'

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 100
    }
  })
}

export default function TopDomains() {
  const { data: domainStats, isLoading } = useQuery(
    'domain-stats',
    () => fetchDomainStats(10),
    { refetchInterval: 60000 } // Refresh every minute
  )

  const maxCount = domainStats ? Math.max(...domainStats.map(d => d.count)) : 0

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-dark-700 rounded-lg"></div>
              <div className="h-4 bg-dark-700 rounded w-24"></div>
            </div>
            <div className="h-4 bg-dark-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!domainStats || domainStats.length === 0) {
    return (
      <div className="text-center py-8 text-dark-400">
        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No domain data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {domainStats.map((domain, index) => {
        const percentage = maxCount > 0 ? (domain.count / maxCount) * 100 : 0
        
        return (
          <motion.div
            key={domain.domain}
            custom={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, x: 4 }}
            className="group relative overflow-hidden"
          >
            {/* Background bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg"
            />
            
            {/* Content */}
            <div className="relative flex items-center justify-between p-3 rounded-lg border border-dark-700/30 group-hover:border-dark-600/50 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-dark-700/50 rounded-lg group-hover:bg-dark-600/50 transition-colors">
                  <Globe className="h-4 w-4 text-primary-400" />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-32">
                    {domain.domain}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">
                      {index === 0 ? 'Top' : `#${index + 1}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {domain.count.toLocaleString()}
                </p>
                <p className="text-xs text-dark-400">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: domainStats.length * 0.05 + 0.3 }}
        className="pt-4 border-t border-dark-700/50"
      >
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>Total domains tracked</span>
          <span className="font-medium">
            {domainStats.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
