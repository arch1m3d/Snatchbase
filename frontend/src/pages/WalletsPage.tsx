import React, { useEffect, useState } from 'react'
import { Wallet as WalletIcon } from 'lucide-react'
import { fetchWallets, Wallet } from '../services/api'
import WalletList from '../components/WalletList'
import WalletStats from '../components/WalletStats'

const WalletsPage: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedType, setSelectedType] = useState<string>('')
  const [hasBalanceFilter, setHasBalanceFilter] = useState<boolean | undefined>(undefined)
  const [showStats, setShowStats] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    loadWallets()
  }, [currentPage, selectedType, hasBalanceFilter])

  const loadWallets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: {
        skip: number
        limit: number
        wallet_type?: string
        has_balance?: boolean
      } = {
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      }

      if (selectedType) {
        params.wallet_type = selectedType
      }

      if (hasBalanceFilter !== undefined) {
        params.has_balance = hasBalanceFilter
      }

      const walletsData = await fetchWallets(params)
      setWallets(walletsData)
    } catch (err) {
      setError('Failed to load wallets')
      console.error('Error loading wallets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? '' : type)
    setCurrentPage(1)
  }

  const handleBalanceFilter = (hasBalance: boolean | undefined) => {
    setHasBalanceFilter(hasBalance)
    setCurrentPage(1)
  }

  const walletTypes = ['BTC', 'ETH', 'MATIC', 'BNB', 'SOL', 'USDT', 'USDC']

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <WalletIcon className="h-10 w-10 text-primary-500" />
              Cryptocurrency Wallets
            </h1>
            <p className="text-dark-400">
              Browse and analyze discovered cryptocurrency wallets
            </p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {showStats ? 'Show Wallets' : 'Show Statistics'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {showStats ? (
          <WalletStats />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>

              {/* Balance Filter */}
              <div className="mb-4">
                <p className="text-sm text-dark-400 mb-2">Balance Status:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBalanceFilter(undefined)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasBalanceFilter === undefined
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    All Wallets
                  </button>
                  <button
                    onClick={() => handleBalanceFilter(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasBalanceFilter === true
                        ? 'bg-green-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    💰 With Balance
                  </button>
                  <button
                    onClick={() => handleBalanceFilter(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasBalanceFilter === false
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    Empty Wallets
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <p className="text-sm text-dark-400 mb-2">Wallet Type:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTypeFilter('')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedType === ''
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    All Types
                  </button>
                  {walletTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {!isLoading && (
              <div className="mb-6">
                <p className="text-sm text-dark-400">
                  Showing {wallets.length} wallet(s)
                  {selectedType && ` (filtered by ${selectedType})`}
                  {hasBalanceFilter !== undefined && (hasBalanceFilter ? ' with balance' : ' without balance')}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {/* Wallets List */}
            <WalletList wallets={wallets} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && wallets.length === itemsPerPage && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
                >
                  Previous
                </button>

                <span className="text-dark-300 px-4">
                  Page {currentPage}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={wallets.length < itemsPerPage}
                  className="px-6 py-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default WalletsPage
