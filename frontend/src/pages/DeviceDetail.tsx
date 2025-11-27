import {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Cookie,
  Cpu,
  CreditCard as CreditCardIcon,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Key,
  MapPin,
  Monitor,
  Package,
  Search as SearchIcon,
  Server,
  Shield,
  User,
  Wallet as WalletIcon,
  Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import CredentialCard from '@/components/CredentialCard';
import CreditCardList from '@/components/CreditCardList';
import DeviceCookiesList from '@/components/DeviceCookiesList';
import DeviceSoftwareList from '@/components/DeviceSoftwareList';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import WalletList from '@/components/WalletList';
import {
  CookieFile,
  fetchDevice,
  fetchDeviceCookies,
  fetchDeviceCredentials,
  fetchDeviceCreditCards,
  fetchDeviceFiles,
  fetchDeviceSoftware,
  fetchDeviceWallets,
  fetchFileContent,
  Software,
  Wallet,
} from '@/services/api';
import { getCountryInfo } from '@/utils/countries';

interface Device {
  id: number
  device_id: string
  device_name: string
  hostname?: string
  ip_address?: string
  country?: string
  language?: string
  os_version?: string
  username?: string
  infection_date?: string
  antivirus?: string
  hwid?: string
  upload_batch: string
  total_files: number
  total_credentials: number
  total_domains: number
  total_urls: number
  total_wallets: number
  total_cookies: number
  total_screenshots: number
  total_software: number
  created_at: string
}

type TabType = 'overview' | 'credentials' | 'creditcards' | 'wallets' | 'cookies' | 'software' | 'files' | 'screenshots'

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const deviceIdNum = deviceId ? parseInt(deviceId) : 0
  const navigate = useNavigate()
  const [device, setDevice] = useState<Device | null>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [cookies, setCookies] = useState<CookieFile[]>([])
  const [software, setSoftware] = useState<Software[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState(false)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const [totalWallets, setTotalWallets] = useState(0)
  const [totalSoftware, setTotalSoftware] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Track what has been loaded to prevent duplicate fetches
  const [filesLoaded, setFilesLoaded] = useState(false)
  const [cardsLoaded, setCardsLoaded] = useState(false)
  const [walletsLoaded, setWalletsLoaded] = useState(false)
  const [cookiesLoaded, setCookiesLoaded] = useState(false)
  const [softwareLoaded, setSoftwareLoaded] = useState(false)

  useEffect(() => {
    if (deviceId) {
      loadDeviceData()
    }
  }, [deviceId, page])

  const loadDeviceData = async () => {
    if (!deviceIdNum) return

    try {
      setLoading(true)
      // Reset loaded flags when switching devices
      setFilesLoaded(false)
      setCardsLoaded(false)
      setWalletsLoaded(false)
      setCookiesLoaded(false)
      setSoftwareLoaded(false)

      // Only load device metadata and initial credentials - lazy load other tabs
      const [deviceData, credsData] = await Promise.all([
        fetchDevice(deviceIdNum),
        fetchDeviceCredentials(deviceIdNum, { limit: 50, offset: page * 50 })
      ])

      setDevice(deviceData)
      setCredentials(credsData.results)
      setTotal(credsData.total)
    } catch (error) {
      console.error('Failed to load device:', error)
      toast.error('Failed to load device data')
    } finally {
      setLoading(false)
    }
  }

  // Lazy load credit cards when tab is clicked
  const loadCreditCards = async () => {
    if (!deviceIdNum || cardsLoaded) return

    try {
      const cardsData = await fetchDeviceCreditCards(deviceIdNum, { limit: 50, offset: 0 })
      setCreditCards(cardsData.results)
      setTotalCards(cardsData.total)
      setCardsLoaded(true)
    } catch (error) {
      console.error('Failed to load credit cards:', error)
      toast.error('Failed to load credit cards')
    }
  }

  // Lazy load wallets when tab is clicked
  const loadWallets = async () => {
    if (!deviceIdNum || walletsLoaded) return

    try {
      const walletsData = await fetchDeviceWallets(deviceIdNum)
      setWallets(walletsData)
      setTotalWallets(walletsData.length)
      setWalletsLoaded(true)
    } catch (error) {
      console.error('Failed to load wallets:', error)
      toast.error('Failed to load wallets')
    }
  }

  // Lazy load cookies when tab is clicked
  const loadCookies = async () => {
    if (!deviceIdNum || cookiesLoaded) return

    try {
      const cookiesData = await fetchDeviceCookies(deviceIdNum)
      setCookies(cookiesData)
      setCookiesLoaded(true)
    } catch (error) {
      console.error('Failed to load cookies:', error)
      toast.error('Failed to load cookies')
    }
  }

  // Lazy load software when tab is clicked
  const loadSoftware = async () => {
    if (!deviceIdNum || softwareLoaded) return

    try {
      const softwareData = await fetchDeviceSoftware(deviceIdNum, { limit: 500, offset: 0 })
      setSoftware(softwareData.results)
      setTotalSoftware(softwareData.total)
      setSoftwareLoaded(true)
    } catch (error) {
      console.error('Failed to load software:', error)
      toast.error('Failed to load software')
    }
  }

  // Lazy load files when tab is clicked
  const loadFiles = async () => {
    if (!deviceIdNum || filesLoaded) return

    try {
      const filesData = await fetchDeviceFiles(deviceIdNum, { limit: 1000, offset: 0 })
      setFiles(filesData.results || [])
      setFilesLoaded(true)
    } catch (error) {
      console.error('Failed to load files:', error)
      toast.error('Failed to load files')
    }
  }

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'creditcards') {
      loadCreditCards()
    } else if (activeTab === 'wallets') {
      loadWallets()
    } else if (activeTab === 'cookies') {
      loadCookies()
    } else if (activeTab === 'software') {
      loadSoftware()
    } else if (activeTab === 'files' || activeTab === 'screenshots') {
      loadFiles()
    } else if (activeTab === 'overview' && device) {
      if (device.total_wallets > 0) loadWallets()
      if (device.total_cookies > 0) loadCookies()
    }
  }, [activeTab, device])

  const extractCountryCode = (deviceName: string) => {
    const match = deviceName.match(/\[([A-Z]{2})\]/)
    return match ? match[1] : null
  }

  const extractIP = (deviceName: string) => {
    const match = deviceName.match(/\d+\.\d+\.\d+\.\d+/)
    return match ? match[0] : null
  }

  const buildFileTree = (files: any[]) => {
    const tree: any = {}

    files.forEach(file => {
      const parts = file.file_path.split('/')
      let current = tree

      parts.forEach((part, index) => {
        if (!part) return

        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isDirectory: index < parts.length - 1 || file.is_directory,
            children: {},
            file: index === parts.length - 1 ? file : null
          }
        }
        current = current[part].children
      })
    })

    return tree
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const handleFileClick = async (file: any) => {
    if (!file || !file.id) return

    try {
      // Fetch file content from backend
      const data = await fetchFileContent(file.id)

      const fileName = file.file_name || 'file'
      const fileExt = fileName.split('.').pop()?.toLowerCase()

      // Check if file has content or needs to be downloaded
      if (data.content) {
        // Text files - open in new tab
        if (['txt', 'log', 'json', 'xml', 'html', 'css', 'js', 'md'].includes(fileExt || '')) {
          const blob = new Blob([data.content], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')
          toast.success('File opened in new tab')
        }
        // PNG/images - open in new tab
        else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(fileExt || '')) {
          // If content is base64, create image
          const blob = new Blob([data.content], { type: `image/${fileExt}` })
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank')
          toast.success('Image opened in new tab')
        }
        // Other files - download
        else {
          const blob = new Blob([data.content], { type: 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          a.click()
          URL.revokeObjectURL(url)
          toast.success('File downloaded')
        }
      } else {
        toast.error('File has no content')
      }
    } catch (error) {
      console.error('Failed to open file:', error)
      toast.error('Failed to open file')
    }
  }

  const renderFileTree = (tree: any, depth = 0) => {
    return Object.values(tree).map((node: any, index) => {
      const hasChildren = Object.keys(node.children).length > 0
      const isExpanded = expandedFolders.has(node.path)

      return (
        <div key={node.path || index}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01 }}
            className="flex items-center gap-2 p-2 hover:bg-dark-700/30 rounded-lg cursor-pointer group"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleFolder(node.path)
              } else if (node.file) {
                handleFileClick(node.file)
              }
            }}
          >
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-dark-400" />
              </motion.div>
            )}

            {!hasChildren && <div className="w-4" />}

            {node.isDirectory ? (
              <Folder className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
            )}

            <span className="text-sm text-white truncate group-hover:text-primary-400 transition-colors">
              {node.name}
            </span>

            {node.file && node.file.file_size > 0 && (
              <span className="text-xs text-dark-400 ml-auto">
                {(node.file.file_size / 1024).toFixed(1)} KB
              </span>
            )}
          </motion.div>

          {hasChildren && isExpanded && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  const exportCredentials = () => {
    const csv = [
      ['Domain', 'URL', 'Username', 'Password', 'Browser', 'TLD'].join(','),
      ...credentials.map(c => [
        c.domain || '',
        c.url || '',
        c.username || '',
        c.password || '',
        c.browser || '',
        c.tld || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${device?.device_name || 'device'}-credentials.csv`
    a.click()
    toast.success('Exported to CSV')
  }

  if (loading && !device) {
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

  if (!device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
        <div className="text-center py-20">
          <Server className="h-16 w-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Device not found</h3>
          <button
            onClick={() => navigate('/devices')}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            Back to Devices
          </button>
        </div>
      </div>
    )
  }

  const countryCode = extractCountryCode(device.device_name)
  const ipAddress = extractIP(device.device_name)

  const filteredCredentials = searchQuery
    ? credentials.filter(c =>
        c.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.url?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : credentials

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/devices')}
        className="mb-6 flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Devices
      </motion.button>

      {/* Device Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="card bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 p-8 rounded-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <Server className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {device.hostname || device.device_name}
                </h1>
                {device.hostname && device.hostname !== device.device_name && (
                  <p className="text-sm text-dark-400 mb-2">Folder: {device.device_name}</p>
                )}
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {device.country && (() => {
                    const countryInfo = getCountryInfo(device.country)
                    return countryInfo && (
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg flex items-center gap-1 border border-blue-500/20">
                        <span>{countryInfo.flag}</span>
                        {countryInfo.name}
                      </span>
                    )
                  })()}
                  {device.ip_address && (
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg font-mono border border-purple-500/20">
                      📍 {device.ip_address}
                    </span>
                  )}
                  {device.antivirus && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg border border-green-500/20">
                      🛡️ {device.antivirus}
                    </span>
                  )}
                  {device.infection_date && (
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg flex items-center gap-1 border border-red-500/20">
                      <Calendar className="h-3 w-3" />
                      Infected: {(() => {
                        // Parse DD.MM.YYYY HH:MM:SS format (European: day/month/year)
                        const parts = device.infection_date.split(' ')[0].split('.')
                        if (parts.length === 3) {
                          const [day, month, year] = parts
                          // Create date with month-1 because JS months are 0-indexed
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                          return date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        }
                        return device.infection_date
                      })()}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-dark-700/50 text-dark-300 text-xs rounded-lg flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ingested: {new Date(device.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-dark-400">Credentials</span>
              </div>
              <p className="text-3xl font-bold text-white">{device.total_credentials.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-green-400" />
                <span className="text-sm text-dark-400">Domains</span>
              </div>
              <p className="text-3xl font-bold text-white">{device.total_domains.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-dark-400">URLs</span>
              </div>
              <p className="text-3xl font-bold text-white">{device.total_urls.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-dark-400">Files</span>
              </div>
              <p className="text-3xl font-bold text-white">{device.total_files.toLocaleString()}</p>
            </div>

            {device.total_wallets > 0 && (
              <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <WalletIcon className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-dark-400">Wallets</span>
                </div>
                <p className="text-3xl font-bold text-white">{device.total_wallets.toLocaleString()}</p>
              </div>
            )}

            {device.total_cookies > 0 && (
              <div className="p-4 bg-dark-700/30 rounded-xl min-w-[160px] flex-1 max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="h-5 w-5 text-amber-600" />
                  <span className="text-sm text-dark-400">Cookies</span>
                </div>
                <p className="text-3xl font-bold text-white">{device.total_cookies.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Extended System Information - Moved to Overview */}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 border-b border-dark-700/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-primary-400'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Overview
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'credentials'
                ? 'text-primary-400'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Credentials ({total})
            {activeTab === 'credentials' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('creditcards')}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'creditcards'
                ? 'text-primary-400'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <CreditCardIcon className="h-4 w-4 inline mr-2" />
            Cards ({cardsLoaded ? totalCards : '?'})
            {activeTab === 'creditcards' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
              />
            )}
          </button>

          {device.total_wallets > 0 && (
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                activeTab === 'wallets'
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <WalletIcon className="h-4 w-4 inline mr-2" />
              Wallets ({walletsLoaded ? totalWallets : device.total_wallets})
              {activeTab === 'wallets' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                />
              )}
            </button>
          )}

          {device.total_cookies > 0 && (
            <button
              onClick={() => setActiveTab('cookies')}
              className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                activeTab === 'cookies'
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <Cookie className="h-4 w-4 inline mr-2" />
              Cookies ({device.total_cookies})
              {activeTab === 'cookies' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                />
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('software')}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'software'
                ? 'text-primary-400'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Software ({softwareLoaded ? totalSoftware : device.total_software || '?'})
            {activeTab === 'software' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'files'
                ? 'text-primary-400'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Folder className="h-4 w-4 inline mr-2" />
            Files ({filesLoaded ? files.length : device.total_files})
            {activeTab === 'files' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
              />
            )}
          </button>

          {device.total_screenshots > 0 && (
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap ${
                activeTab === 'screenshots'
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Screenshots ({device.total_screenshots})
              {activeTab === 'screenshots' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                />
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Search & Actions - Only show for credentials tab */}
      {activeTab === 'credentials' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex items-center gap-4"
        >
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credentials..."
              className="w-full pl-12 pr-4 py-3 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 transition-all"
            />
          </div>

          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="px-4 py-3 bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 rounded-xl transition-all flex items-center gap-2"
          >
            {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {showPasswords ? 'Hide' : 'Show'}
          </button>

          <button
            onClick={exportCredentials}
            className="px-4 py-3 bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 rounded-xl transition-all flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </motion.div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Credentials Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary-400" />
                    Recent Credentials
                  </h3>
                  <button 
                    onClick={() => setActiveTab('credentials')}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {credentials.slice(0, 5).map(credential => (
                    <CredentialCard key={credential.id} credential={credential} showPassword={false} />
                  ))}
                </div>
              </div>

              {/* System Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary-400" />
                    System Specifications
                  </h3>
                </div>
                <div className="bg-dark-700/30 border border-dark-700/50 rounded-xl p-6">
                  <div className="grid grid-cols-1 gap-6">
                    
                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-lg">
                          <Monitor className="h-5 w-5 text-primary-400" />
                        </div>
                        <span className="text-dark-300">Hostname</span>
                      </div>
                      <span className="text-white font-medium truncate max-w-[300px]" title={device.hostname}>{device.hostname || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Cpu className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-dark-300">OS Version</span>
                      </div>
                      <span className="text-white font-medium truncate max-w-[300px]" title={device.os_version}>{device.os_version || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <User className="h-5 w-5 text-green-400" />
                        </div>
                        <span className="text-dark-300">Username</span>
                      </div>
                      <span className="text-white font-medium truncate max-w-[300px]" title={device.username}>{device.username || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Wifi className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="text-dark-300">IP Address</span>
                      </div>
                      <span className="text-white font-medium font-mono">{device.ip_address || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-yellow-400" />
                        </div>
                        <span className="text-dark-300">Country</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.country && getCountryInfo(device.country)?.flag && (
                          <span className="text-lg">{getCountryInfo(device.country)?.flag}</span>
                        )}
                        <span className="text-white font-medium">{device.country || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <Globe className="h-5 w-5 text-pink-400" />
                        </div>
                        <span className="text-dark-300">Language</span>
                      </div>
                      <span className="text-white font-medium">{device.language || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg">
                          <Shield className="h-5 w-5 text-teal-400" />
                        </div>
                        <span className="text-dark-300">Antivirus</span>
                      </div>
                      <span className="text-white font-medium truncate max-w-[300px]" title={device.antivirus}>{device.antivirus || 'None Detected'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-dark-700/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-red-400" />
                        </div>
                        <span className="text-dark-300">Infection Date</span>
                      </div>
                      <span className="text-white font-medium">{device.infection_date || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <HardDrive className="h-5 w-5 text-orange-400" />
                        </div>
                        <span className="text-dark-300">Hardware ID</span>
                      </div>
                      <code className="text-xs bg-dark-800 px-3 py-1.5 rounded-lg text-primary-300 font-mono select-all">
                        {device.hwid || 'Unknown'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallets & Cookies Preview Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {device.total_wallets > 0 && (
                 <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <WalletIcon className="h-5 w-5 text-yellow-400" />
                      Wallets Detected
                    </h3>
                    <button 
                      onClick={() => setActiveTab('wallets')}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      View All
                    </button>
                  </div>
                  <WalletList wallets={wallets.slice(0, 3)} isLoading={!walletsLoaded && activeTab === 'wallets'} />
                </div>
              )}

              {device.total_cookies > 0 && (
                 <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Cookie className="h-5 w-5 text-amber-600" />
                      Browser Cookies
                    </h3>
                    <button 
                      onClick={() => setActiveTab('cookies')}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      View All
                    </button>
                  </div>
                  <DeviceCookiesList cookies={cookies.slice(0, 3)} isLoading={!cookiesLoaded && activeTab === 'cookies'} />
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'credentials' ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {filteredCredentials.length > 0 ? (
              filteredCredentials.map((credential, index) => (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <CredentialCard credential={credential} showPassword={showPasswords} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No credentials found</h3>
                <p className="text-dark-400">Try adjusting your search</p>
              </div>
            )}
          </motion.div>
        ) : activeTab === 'creditcards' ? (
          <motion.div
            key="creditcards"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CreditCardList cards={creditCards} isLoading={loading} />
          </motion.div>
        ) : activeTab === 'wallets' ? (
          <motion.div
            key="wallets"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <WalletList wallets={wallets} isLoading={!walletsLoaded} />
          </motion.div>
        ) : activeTab === 'cookies' ? (
          <motion.div
            key="cookies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <DeviceCookiesList cookies={cookies} isLoading={!cookiesLoaded} />
          </motion.div>
        ) : activeTab === 'software' ? (
          <motion.div
            key="software"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <DeviceSoftwareList software={software} isLoading={!softwareLoaded} />
          </motion.div>
        ) : activeTab === 'screenshots' ? (
          <motion.div
            key="screenshots"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ScreenshotGallery files={files} isLoading={!filesLoaded} />
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {files.length > 0 ? (
              <div className="card bg-dark-800/30 border border-dark-700/50 rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-dark-400">File Tree</h3>
                  <button
                    onClick={() => setExpandedFolders(new Set())}
                    className="text-xs text-dark-400 hover:text-white transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
                <div className="space-y-1">
                  {renderFileTree(buildFileTree(files))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Folder className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
                <p className="text-dark-400">This device has no stored files</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {activeTab === 'credentials' && total > 50 && !searchQuery && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium"
          >
            Previous
          </button>

          <span className="text-dark-300 px-4">
            Page {page + 1} of {Math.ceil(total / 50)}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * 50 >= total}
            className="px-6 py-3 bg-dark-700/50 hover:bg-dark-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
