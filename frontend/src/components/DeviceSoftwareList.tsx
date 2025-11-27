import React from 'react'
import { Package, FileCode, Hash } from 'lucide-react'
import { Software } from '../services/api'

interface DeviceSoftwareListProps {
  software: Software[]
  isLoading: boolean
}

const DeviceSoftwareList: React.FC<DeviceSoftwareListProps> = ({ software, isLoading }) => {
  // Categorize software
  const categorizedSoftware = React.useMemo(() => {
    const categories: { [key: string]: Software[] } = {
      'Browsers': [],
      'Communication': [],
      'Wallets': [],
      'Development': [],
      'Security': [],
      'Gaming': [],
      'Other': []
    }

    const browserKeywords = ['chrome', 'firefox', 'edge', 'brave', 'opera', 'safari', 'vivaldi']
    const commKeywords = ['telegram', 'discord', 'slack', 'skype', 'zoom', 'teams', 'whatsapp']
    const walletKeywords = ['wallet', 'metamask', 'exodus', 'electrum', 'trust wallet']
    const devKeywords = ['vscode', 'visual studio', 'pycharm', 'intellij', 'git', 'node', 'npm', 'docker']
    const securityKeywords = ['vpn', 'antivirus', 'firewall', 'malware', 'kaspersky', 'norton', 'avast']
    const gamingKeywords = ['steam', 'epic', 'origin', 'uplay', 'battle.net', 'riot']

    software.forEach(soft => {
      const name = soft.software_name.toLowerCase()

      if (browserKeywords.some(kw => name.includes(kw))) {
        categories['Browsers'].push(soft)
      } else if (commKeywords.some(kw => name.includes(kw))) {
        categories['Communication'].push(soft)
      } else if (walletKeywords.some(kw => name.includes(kw))) {
        categories['Wallets'].push(soft)
      } else if (devKeywords.some(kw => name.includes(kw))) {
        categories['Development'].push(soft)
      } else if (securityKeywords.some(kw => name.includes(kw))) {
        categories['Security'].push(soft)
      } else if (gamingKeywords.some(kw => name.includes(kw))) {
        categories['Gaming'].push(soft)
      } else {
        categories['Other'].push(soft)
      }
    })

    return Object.entries(categories).filter(([_, items]) => items.length > 0)
  }, [software])

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Browsers': '🌐',
      'Communication': '💬',
      'Wallets': '💰',
      'Development': '👨‍💻',
      'Security': '🔒',
      'Gaming': '🎮',
      'Other': '📦'
    }
    return icons[category] || '📦'
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Browsers': 'border-blue-500/50 bg-blue-500/10',
      'Communication': 'border-green-500/50 bg-green-500/10',
      'Wallets': 'border-yellow-500/50 bg-yellow-500/10',
      'Development': 'border-purple-500/50 bg-purple-500/10',
      'Security': 'border-red-500/50 bg-red-500/10',
      'Gaming': 'border-pink-500/50 bg-pink-500/10',
      'Other': 'border-dark-600 bg-dark-700/30'
    }
    return colors[category] || 'border-dark-600 bg-dark-700/30'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-dark-800 border border-dark-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-dark-700 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-dark-700 rounded"></div>
              <div className="h-3 bg-dark-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (software.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="h-16 w-16 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No software found</h3>
        <p className="text-dark-400">This device has no detected software</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-400">Total Software Detected</p>
            <p className="text-3xl font-bold text-white mt-1">{software.length}</p>
          </div>
          <Package className="h-10 w-10 text-primary-500" />
        </div>
      </div>

      {/* Categorized Software */}
      {categorizedSoftware.map(([category, items]) => (
        <div key={category} className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            {category}
            <span className="ml-auto text-sm text-dark-400 font-normal">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((soft) => (
              <div
                key={soft.id}
                className={`border rounded-lg p-3 transition-all hover:shadow-md ${getCategoryColor(category)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {soft.software_name}
                    </p>
                    {soft.version && (
                      <p className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {soft.version}
                      </p>
                    )}
                    <p className="text-xs text-dark-500 mt-1 flex items-center gap-1 truncate">
                      <FileCode className="h-3 w-3 flex-shrink-0" />
                      {soft.source_file}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DeviceSoftwareList
