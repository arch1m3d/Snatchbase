import React from 'react'
import { Link } from 'react-router-dom'
import { Wallet } from '../services/api'
import { Wallet as WalletIcon, Copy, ExternalLink, Server } from 'lucide-react'
import toast from 'react-hot-toast'

interface WalletListProps {
  wallets: Wallet[]
  isLoading?: boolean
}

const getWalletIcon = (type: string) => {
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

const getWalletColor = (type: string) => {
  const colors: { [key: string]: string } = {
    'BTC': 'bg-orange-100 text-orange-800 border-orange-300',
    'ETH': 'bg-purple-100 text-purple-800 border-purple-300',
    'MATIC': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'BNB': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'SOL': 'bg-green-100 text-green-800 border-green-300',
    'USDT': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'USDC': 'bg-blue-100 text-blue-800 border-blue-300',
  }
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300'
}

const getExplorerUrl = (type: string, address: string) => {
  const explorers: { [key: string]: string } = {
    'BTC': `https://blockchain.com/btc/address/${address}`,
    'ETH': `https://etherscan.io/address/${address}`,
    'MATIC': `https://polygonscan.com/address/${address}`,
    'BNB': `https://bscscan.com/address/${address}`,
    'SOL': `https://solscan.io/account/${address}`,
  }
  return explorers[type]
}

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied!`)
}

const WalletList: React.FC<WalletListProps> = ({ wallets, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <div className="h-4 bg-dark-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-dark-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!wallets || wallets.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-800 border border-dark-700 rounded-lg">
        <WalletIcon className="h-16 w-16 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Wallets Found</h3>
        <p className="text-dark-400">No wallet data is available with the current filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="bg-dark-800 border border-dark-700 rounded-lg hover:border-primary-500/50 transition-all p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{getWalletIcon(wallet.wallet_type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getWalletColor(wallet.wallet_type)}`}>
                      {wallet.wallet_type}
                    </span>
                    {wallet.has_balance && (
                      <span className="inline-block px-3 py-1 rounded-lg text-sm font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                        💰 Has Balance
                      </span>
                    )}
                  </div>
                  {wallet.address && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-white font-mono text-sm">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                      </p>
                      <button
                        onClick={() => copyToClipboard(wallet.address!, 'Address')}
                        className="p-1 hover:bg-dark-600 rounded transition-colors"
                        title="Copy address"
                      >
                        <Copy className="h-4 w-4 text-dark-400 hover:text-primary-400" />
                      </button>
                      {getExplorerUrl(wallet.wallet_type, wallet.address) && (
                        <a
                          href={getExplorerUrl(wallet.wallet_type, wallet.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-dark-600 rounded transition-colors"
                          title="View on explorer"
                        >
                          <ExternalLink className="h-4 w-4 text-dark-400 hover:text-primary-400" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {wallet.balance > 0 && (
                  <div>
                    <span className="text-dark-400 font-medium">Balance:</span>
                    <p className="text-white font-bold">
                      {wallet.balance.toFixed(6)} {wallet.wallet_type}
                    </p>
                  </div>
                )}

                {wallet.balance_usd && wallet.balance_usd > 0 && (
                  <div>
                    <span className="text-dark-400 font-medium">USD Value:</span>
                    <p className="text-green-400 font-bold">${wallet.balance_usd.toFixed(2)}</p>
                  </div>
                )}

                <div>
                  <span className="text-dark-400 font-medium">Device:</span>
                  <Link
                    to={`/device/${wallet.device_id}`}
                    className="flex items-center gap-1 text-primary-400 hover:text-primary-300 font-mono text-xs truncate transition-colors group"
                  >
                    <Server className="h-3 w-3 flex-shrink-0" />
                    <span className="group-hover:underline">View Device</span>
                  </Link>
                </div>

                {wallet.last_checked && (
                  <div>
                    <span className="text-dark-400 font-medium">Last Checked:</span>
                    <p className="text-dark-300 text-xs">
                      {new Date(wallet.last_checked).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {wallet.source_file && (
                  <div className="col-span-2">
                    <span className="text-dark-400 font-medium">Source:</span>
                    <p className="text-dark-300 text-xs truncate" title={wallet.source_file}>
                      {wallet.source_file.split('/').pop() || wallet.source_file}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-dark-700">
                <span className="text-xs text-dark-500">
                  Found: {new Date(wallet.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WalletList
