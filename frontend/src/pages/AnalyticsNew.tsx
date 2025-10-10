import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Chrome,
  Key,
  Server,
  Activity,
  Globe,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { fetchStatistics, fetchBrowserStats, fetchTldStats, fetchPasswordStats, fetchStealerStats, fetchDevices } from '@/services/api'
import toast from 'react-hot-toast'

interface Stats {
  total_credentials: number
  total_systems: number
  total_uploads: number
  unique_domains: number
  unique_countries: number
  unique_stealers: number
}

interface StatItem {
  name: string
  count: number
}

export default function AnalyticsNew() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [browserStats, setBrowserStats] = useState<StatItem[]>([])
  const [tldStats, setTldStats] = useState<StatItem[]>([])
  const [passwordStats, setPasswordStats] = useState<StatItem[]>([])
  const [stealerStats, setStealerStats] = useState<StatItem[]>([])
  const [recentDevices, setRecentDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [statsData, browsers, tlds, passwords, stealers, devices] = await Promise.all([
        fetchStatistics(),
        fetchBrowserStats(15),
        fetchTldStats(15),
        fetchPasswordStats(15),
        fetchStealerStats(15),
        fetchDevices({ limit: 10 })
      ])
      
      setStats(statsData)
      setBrowserStats(browsers.map((b: any) => ({ name: b.browser || b.stealer_name, count: b.count })))
      setTldStats(tlds.map((t: any) => ({ name: t.tld, count: t.count })))
      setPasswordStats(passwords.map((p: any) => ({ name: p.password, count: p.count })))
      setStealerStats(stealers.map((s: any) => ({ name: s.stealer_name, count: s.count })))
      setRecentDevices(devices.results)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Activity className="h-12 w-12 text-primary-500" />
        </motion.div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Credentials',
      value: stats?.total_credentials.toLocaleString() || '0',
      icon: Key,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Infected Devices',
      value: stats?.total_systems.toLocaleString() || '0',
      icon: Server,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Unique Domains',
      value: stats?.unique_domains.toLocaleString() || '0',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Unique Stealers',
      value: stats?.unique_stealers.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary-500" />
          Analytics & Insights
        </h1>
        <p className="text-dark-400">
          Deep dive into your stealer log database
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="relative card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-dark-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Browsers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Chrome className="h-5 w-5 text-primary-400" />
              Top Browsers
            </h2>
          </div>
          
          <div className="space-y-4">
            {browserStats.map((browser, index) => {
              const maxCount = browserStats[0]?.count || 1
              const percentage = (browser.count / maxCount) * 100
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-300 font-medium truncate max-w-[250px]">
                      {browser.name}
                    </span>
                    <span className="text-white font-bold">{browser.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top TLDs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-400" />
              Top TLDs
            </h2>
          </div>
          
          <div className="space-y-4">
            {tldStats.map((tld, index) => {
              const maxCount = tldStats[0]?.count || 1
              const percentage = (tld.count / maxCount) * 100
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-300 font-medium">.{tld.name}</span>
                    <span className="text-white font-bold">{tld.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Stealer Families & Top Passwords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stealer Families */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Stealer Families
            </h2>
          </div>
          
          <div className="space-y-4">
            {stealerStats.map((stealer, index) => {
              const maxCount = stealerStats[0]?.count || 1
              const percentage = (stealer.count / maxCount) * 100
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-300 font-medium truncate max-w-[250px]">
                      {stealer.name}
                    </span>
                    <span className="text-white font-bold">{stealer.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top Passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-red-400" />
              Most Common Passwords
            </h2>
          </div>
          
          <div className="space-y-3">
            {passwordStats.map((password, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg"
              >
                <span className="text-dark-300 font-mono text-sm truncate max-w-[200px]">
                  {password.name}
                </span>
                <span className="text-white font-bold">{password.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
