import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database,
  Globe,
  Search,
  Server,
  Key,
  ArrowRight,
  Archive,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { fetchStatistics, fetchDevices, fetchRecentUploads, Upload } from '@/services/api'
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
  const [recentUploads, setRecentUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, devices, uploads] = await Promise.all([
        fetchStatistics(),
        fetchDevices({ limit: 5 }),
        fetchRecentUploads(5)
      ])

      setStats(statsData)
      setRecentDevices(devices.results)
      setRecentUploads(uploads)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="text-center">
          <div className="h-1 w-32 bg-neon-cyan animate-glow mx-auto mb-4" />
          <p className="text-gray-400 font-light">loading...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'credentials',
      value: stats?.total_credentials || 0,
      icon: Key,
      color: 'neon-cyan'
    },
    {
      label: 'devices',
      value: stats?.total_systems || 0,
      icon: Server,
      color: 'neon-green'
    },
    {
      label: 'domains',
      value: stats?.unique_domains || 0,
      icon: Globe,
      color: 'neon-purple'
    },
    {
      label: 'uploads',
      value: stats?.total_uploads || 0,
      icon: Database,
      color: 'neon-pink'
    }
  ]

  return (
    <div className="min-h-screen bg-void p-8 font-light">
      {/* Header */}
      <div className="mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-extralight text-white tracking-wider mb-2">
          snatchbase
        </h1>
        <p className="text-gray-400 text-sm font-light">osint intelligence platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-void-light border border-gray-800 p-6 hover:border-neon-cyan transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-gray-500 text-xs uppercase tracking-widest font-light">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 text-${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className={`text-3xl font-thin text-${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-light">quick access</h2>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/search')}
            className="bg-void-light border border-gray-800 p-6 text-left hover:border-neon-cyan transition-all group"
          >
            <Search className="h-5 w-5 text-neon-cyan mb-3 opacity-70 group-hover:opacity-100" />
            <div className="text-white font-light mb-1">search</div>
            <div className="text-gray-500 text-xs font-light">find credentials & data</div>
          </button>

          <button
            onClick={() => navigate('/devices')}
            className="bg-void-light border border-gray-800 p-6 text-left hover:border-neon-green transition-all group"
          >
            <Server className="h-5 w-5 text-neon-green mb-3 opacity-70 group-hover:opacity-100" />
            <div className="text-white font-light mb-1">devices</div>
            <div className="text-gray-500 text-xs font-light">infected systems</div>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="bg-void-light border border-gray-800 p-6 text-left hover:border-neon-purple transition-all group"
          >
            <Database className="h-5 w-5 text-neon-purple mb-3 opacity-70 group-hover:opacity-100" />
            <div className="text-white font-light mb-1">analytics</div>
            <div className="text-gray-500 text-xs font-light">insights & stats</div>
          </button>
        </div>
      </div>

      {/* Recent Devices */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-500 text-xs uppercase tracking-widest font-light">recent devices</h2>
          <button
            onClick={() => navigate('/devices')}
            className="text-neon-cyan text-xs hover:underline font-light flex items-center gap-1"
          >
            view all
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentDevices.map((device) => (
            <div
              key={device.device_id}
              onClick={() => navigate(`/device/${device.id}`)}
              className="bg-void-light border border-gray-800 p-4 hover:border-neon-green transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-1 w-1 bg-neon-green rounded-full group-hover:shadow-neon-green" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-light text-sm truncate">
                    {device.hostname || device.device_name}
                  </div>
                  <div className="text-gray-500 text-xs font-light">
                    {device.ip_address || 'unknown ip'}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-xs">
                <div className="text-right">
                  <div className="text-gray-500 font-light">creds</div>
                  <div className="text-neon-cyan font-light">{device.total_credentials}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 font-light">domains</div>
                  <div className="text-neon-purple font-light">{device.total_domains}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Archives */}
      <div>
        <h2 className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-light">recent ingestions</h2>

        {recentUploads.length === 0 ? (
          <div className="bg-void-light border border-gray-800 p-12 text-center">
            <Archive className="h-8 w-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-light">no archives processed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-void-light border border-gray-800 p-4 hover:border-neon-pink transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Archive className="h-4 w-4 text-neon-pink mt-1 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-light text-sm mb-1 truncate" title={upload.filename}>
                        {upload.filename}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500 font-light">
                          {new Date(upload.created_at).toLocaleString()}
                        </span>
                        {upload.status === 'completed' && (
                          <span className="flex items-center gap-1 text-neon-green">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-light">completed</span>
                          </span>
                        )}
                        {upload.status === 'failed' && (
                          <span className="flex items-center gap-1 text-neon-pink">
                            <XCircle className="h-3 w-3" />
                            <span className="font-light">failed</span>
                          </span>
                        )}
                        {upload.status === 'processing' && (
                          <span className="flex items-center gap-1 text-neon-cyan">
                            <Clock className="h-3 w-3" />
                            <span className="font-light">processing</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 text-xs flex-shrink-0">
                    <div className="text-right">
                      <div className="text-gray-500 font-light">devices</div>
                      <div className="text-white font-light">{upload.devices_processed}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 font-light">creds</div>
                      <div className="text-neon-cyan font-light">{upload.total_credentials}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 font-light">files</div>
                      <div className="text-gray-400 font-light">{upload.total_files}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
