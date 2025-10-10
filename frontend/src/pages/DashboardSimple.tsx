import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Database, 
  Globe, 
  Search, 
  TrendingUp,
  AlertTriangle,
  Server,
  Activity,
  Key,
  ArrowRight,
  Zap
} from 'lucide-react'
import { fetchStatistics, fetchDevices } from '@/services/api'
import toast from 'react-hot-toast'

interface Stats {
  total_credentials: number
  total_systems: number
  total_uploads: number
  unique_domains: number
  unique_countries: number
  unique_stealers: number
}

export default function DashboardSimple() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentDevices, setRecentDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, devices] = await Promise.all([
        fetchStatistics(),
        fetchDevices({ limit: 5 })
      ])
      
      setStats(statsData)
      setRecentDevices(devices.results)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
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

  const quickActions = [
    {
      title: 'Search Credentials',
      description: 'Find credentials by domain, username, or browser',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/search')
    },
    {
      title: 'Browse Devices',
      description: 'View all infected devices and their data',
      icon: Server,
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/devices')
    },
    {
      title: 'View Analytics',
      description: 'Explore detailed statistics and insights',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/analytics')
    }
  ]

  const statCards = [
    {
      title: 'Total Credentials',
      value: stats?.total_credentials.toLocaleString() || '0',
      icon: Key,
      color: 'text-blue-400'
    },
    {
      title: 'Infected Devices',
      value: stats?.total_systems.toLocaleString() || '0',
      icon: Server,
      color: 'text-purple-400'
    },
    {
      title: 'Unique Domains',
      value: stats?.unique_domains.toLocaleString() || '0',
      icon: Globe,
      color: 'text-green-400'
    },
    {
      title: 'Unique Stealers',
      value: stats?.unique_stealers.toLocaleString() || '0',
      icon: AlertTriangle,
      color: 'text-red-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
          <Database className="h-12 w-12 text-primary-500" />
          Welcome to Snatchbase
        </h1>
        <p className="text-xl text-dark-400">
          Your comprehensive stealer log management platform
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              if (stat.title === 'Total Credentials') navigate('/search')
              else if (stat.title === 'Infected Devices') navigate('/devices')
              else if (stat.title === 'Unique Domains' || stat.title === 'Unique Stealers') navigate('/analytics')
            }}
            className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-6 rounded-2xl hover:border-primary-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-dark-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary-500" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={action.action}
              className="group relative overflow-hidden"
            >
              <div className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-8 rounded-2xl hover:border-primary-500/50 transition-all text-left">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-dark-400 mb-4">{action.description}</p>
                
                <div className="flex items-center text-primary-400 font-medium">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Devices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="h-6 w-6 text-purple-400" />
            Recent Devices
          </h2>
          <button
            onClick={() => navigate('/devices')}
            className="text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDevices.map((device, index) => (
            <motion.div
              key={device.device_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              onClick={() => navigate(`/device/${device.id}`)}
              className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-5 rounded-xl hover:border-primary-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Server className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors truncate max-w-[250px]" title={device.hostname || device.device_name}>
                    {device.hostname || device.device_name}
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-dark-400">Credentials</p>
                  <p className="text-white font-bold">{device.total_credentials.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-dark-400">Domains</p>
                  <p className="text-white font-bold">{device.total_domains.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
