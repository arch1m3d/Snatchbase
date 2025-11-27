import { motion } from 'framer-motion';
import {
  Clock,
  ExternalLink,
  Globe,
} from 'lucide-react';

import { BrowserHistoryEntry } from '@/services/api';

interface DeviceHistoryListProps {
  history: BrowserHistoryEntry[]
  isLoading: boolean
}

export default function DeviceHistoryList({ history, isLoading }: DeviceHistoryListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-dark-700/30 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <Clock className="h-16 w-16 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No browser history found</h3>
        <p className="text-dark-400">This device has no browser history entries</p>
      </div>
    )
  }

  const getBrowserColor = (browser: string) => {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (browserLower.includes('firefox')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (browserLower.includes('edge')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (browserLower.includes('safari')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    if (browserLower.includes('opera')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="group bg-dark-700/30 border border-dark-700/50 rounded-xl p-4 hover:bg-dark-700/50 transition-all hover:border-primary-500/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate" title={entry.title || entry.url}>
                    {entry.title || 'Untitled'}
                  </h3>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 truncate"
                    title={entry.url}
                  >
                    <span className="truncate">{entry.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 mt-3">
                <span className={`px-3 py-1 text-xs rounded-lg border ${getBrowserColor(entry.browser)}`}>
                  {entry.browser}
                </span>
                {entry.visit_count > 1 && (
                  <span className="px-3 py-1 bg-dark-600/50 text-dark-300 text-xs rounded-lg border border-dark-600">
                    {entry.visit_count} visits
                  </span>
                )}
                {entry.last_visit_time && (
                  <span className="px-3 py-1 bg-dark-600/50 text-dark-300 text-xs rounded-lg border border-dark-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {entry.last_visit_time}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
