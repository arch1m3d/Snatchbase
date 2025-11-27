import React, { useEffect, useState } from 'react'
import { fetchWalletStats, WalletStats as StatsType } from '../services/api'
import { Wallet, TrendingUp, DollarSign } from 'lucide-react'

const WalletStats: React.FC = () => {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const statsData = await fetchWalletStats()
        setStats(statsData)
      } catch (err) {
        setError('Failed to load wallet statistics')
        console.error('Error loading wallet stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const getWalletTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'BTC': 'bg-orange-500',
      'ETH': 'bg-purple-500',
      'MATIC': 'bg-indigo-500',
      'BNB': 'bg-yellow-500',
      'SOL': 'bg-green-500',
      'USDT': 'bg-emerald-500',
      'USDC': 'bg-blue-500',
    }
    return colors[type] || 'bg-gray-500'
  }

  const getWalletTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'MATIC': '⟠',
      'BNB': '🔶',
      'SOL': '◎',
      'USDT': '₮',
      'USDC': '$',
    }
    return icons[type] || '💰'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="h-6 bg-dark-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-dark-700 rounded"></div>
            <div className="h-4 bg-dark-700 rounded w-5/6"></div>
          </div>
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

  if (!stats) return null

  const walletTypes = Object.entries(stats.breakdown_by_type || {})
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.total_usd - a.total_usd)

  const totalWallets = stats.total_wallets || 0
  const maxCount = walletTypes.length > 0 ? Math.max(...walletTypes.map(w => w.count)) : 1

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Total Wallets</p>
              <p className="text-3xl font-bold text-white mt-2">{totalWallets.toLocaleString()}</p>
            </div>
            <Wallet className="h-10 w-10 text-primary-500" />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">With Balance</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.wallets_with_balance.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Total Value</p>
              <p className="text-3xl font-bold text-green-400 mt-2">${stats.total_value_usd.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Wallet Types</p>
              <p className="text-3xl font-bold text-white mt-2">{walletTypes.length}</p>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </div>
      </div>

      {/* Wallet Type Distribution */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Type Distribution</h3>

        {walletTypes.length === 0 ? (
          <p className="text-dark-400 text-center py-8">No wallet data available</p>
        ) : (
          <div className="space-y-4">
            {walletTypes.map((wallet) => {
              const percentage = totalWallets > 0 ? (wallet.count / totalWallets * 100) : 0
              const barWidth = maxCount > 0 ? (wallet.count / maxCount * 100) : 0

              return (
                <div key={wallet.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getWalletTypeIcon(wallet.type)}</span>
                      <span className="text-sm font-medium text-white">{wallet.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-dark-300">
                        {wallet.count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                      {wallet.total_usd > 0 && (
                        <span className="text-xs text-green-400 block">
                          ${wallet.total_usd.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-3">
                    <div
                      className={`${getWalletTypeColor(wallet.type)} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top Wallets by Value */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Wallets by Value</h3>
        <div className="space-y-3">
          {stats.top_wallets && stats.top_wallets.length > 0 ? (
            stats.top_wallets.map((wallet, index) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-600"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getWalletTypeColor(wallet.wallet_type)} flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-mono text-sm">
                      {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : 'No address'}
                    </p>
                    <p className="text-xs text-dark-400">{wallet.wallet_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">${wallet.balance_usd.toFixed(2)}</p>
                  <p className="text-xs text-dark-400">
                    {wallet.balance.toFixed(6)} {wallet.wallet_type}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-dark-400 text-center py-8">No wallets with balance found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletStats
