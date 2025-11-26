import { motion } from 'framer-motion';
import {
  Cookie,
  Database,
  Download,
  Globe,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { fetchFileContent } from '@/services/api';

interface CookieFile {
  id: number
  file_name: string
  file_path: string
  file_size: number
  cookie_count: number
  service: string
}

interface DeviceCookiesListProps {
  cookies: CookieFile[]
  isLoading: boolean
}

export default function DeviceCookiesList({ cookies, isLoading }: DeviceCookiesListProps) {
  const handleDownload = async (cookie: CookieFile) => {
    try {
      const data = await fetchFileContent(cookie.id)
      if (data.content) {
        const blob = new Blob([data.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = cookie.file_name
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Cookie file downloaded')
      } else {
        toast.error('File has no content')
      }
    } catch (error) {
      console.error('Failed to download file:', error)
      toast.error('Failed to download cookie file')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-dark-700/30 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (cookies.length === 0) {
    return (
      <div className="text-center py-20">
        <Cookie className="h-16 w-16 text-dark-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No cookies found</h3>
        <p className="text-dark-400">This device has no cookie files</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cookies.map((cookie, index) => (
          <motion.div
            key={cookie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-dark-700/30 border border-dark-700/50 rounded-xl p-4 hover:bg-dark-700/50 transition-all hover:border-primary-500/30"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  cookie.service.includes('Chrome') ? 'bg-yellow-500/10 text-yellow-400' :
                  cookie.service.includes('Firefox') ? 'bg-orange-500/10 text-orange-400' :
                  cookie.service.includes('Edge') ? 'bg-blue-500/10 text-blue-400' :
                  'bg-primary-500/10 text-primary-400'
                }`}>
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{cookie.service}</h3>
                  <p className="text-xs text-dark-400 truncate max-w-[150px]" title={cookie.file_name}>
                    {cookie.file_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(cookie)}
                className="p-2 bg-dark-600/50 hover:bg-primary-500/20 text-dark-400 hover:text-primary-400 rounded-lg transition-colors"
                title="Download Cookies"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-dark-300 bg-dark-800/50 px-3 py-1.5 rounded-lg">
                <Database className="h-3 w-3" />
                <span>{cookie.cookie_count} cookies</span>
              </div>
              <div className="text-dark-400 text-xs">
                {(cookie.file_size / 1024).toFixed(1)} KB
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
