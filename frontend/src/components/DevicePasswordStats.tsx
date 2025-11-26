import React, { useEffect, useState } from 'react'
import { Key, TrendingUp, Shield } from 'lucide-react'
import { fetchDevicePasswordStats, DevicePasswordStats as StatsType } from '../services/api'

interface DevicePasswordStatsProps {
  deviceId: number
}

const DevicePasswordStats: React.FC<DevicePasswordStatsProps> = ({ deviceId }) => {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const statsData = await fetchDevicePasswordStats(deviceId, 20)
        setStats(statsData)
      } catch (err) {
        setError('Failed to load password statistics')
        console.error('Error loading password stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [deviceId])

  if (isLoading) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-dark-700 rounded w-1/3"></div>
          <div className="h-4 bg-dark-700 rounded"></div>
          <div className="h-4 bg-dark-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    )
  }

  if (!stats || stats.top_passwords.length === 0) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary-500" />
          Password Statistics
        </h3>
        <p className="text-dark-400 text-center py-8">No password statistics available</p>
      </div>
    )
  }

  const maxCount = stats.top_passwords.length > 0
    ? Math.max(...stats.top_passwords.map(p => p.count))
    : 1

  // Determine password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { label: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500' }
    if (password.length < 8) return { label: 'Weak', color: 'text-orange-500', bg: 'bg-orange-500' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    if (!/[!@#$%^&*]/.test(password)) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' }
    return { label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' }
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Key className="h-5 w-5 text-primary-500" />
        Password Statistics
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Passwords</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total_passwords}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-dark-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Unique Passwords</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.unique_passwords}</p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Top Passwords */}
      <div>
        <h4 className="text-sm font-semibold text-dark-400 mb-3">Most Used Passwords</h4>
        <div className="space-y-2">
          {stats.top_passwords.map((passwordStat, index) => {
            const percentage = (passwordStat.count / stats.total_passwords) * 100
            const barWidth = (passwordStat.count / maxCount) * 100
            const strength = getPasswordStrength(passwordStat.password)

            return (
              <div key={index} className="bg-dark-700/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-xs font-bold ${strength.color}`}>
                      #{index + 1}
                    </span>
                    <code className="text-sm text-white font-mono truncate">
                      {passwordStat.password}
                    </code>
                    <span className={`text-xs ${strength.color} ml-auto`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm text-dark-300">
                      {passwordStat.count}x
                    </span>
                    <span className="text-xs text-dark-400 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div
                    className={`${strength.bg} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Warning */}
      {stats.top_passwords.some(p => p.password.length < 8) && (
        <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/50 rounded-lg">
          <p className="text-xs text-orange-400">
            ⚠️ This device uses weak passwords. Consider implementing stronger password policies.
          </p>
        </div>
      )}
    </div>
  )
}

export default DevicePasswordStats
