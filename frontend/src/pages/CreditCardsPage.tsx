import React, { useEffect, useState } from 'react'
import { CreditCard as CreditCardIcon } from 'lucide-react'
import { fetchCreditCards, CreditCard, SearchResponse } from '../services/api'
import CreditCardList from '../components/CreditCardList'
import CreditCardStats from '../components/CreditCardStats'
import Pagination from '../components/Pagination'

const CreditCardsPage: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCards, setTotalCards] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [showStats, setShowStats] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    loadCreditCards()
  }, [currentPage, selectedBrand])

  const loadCreditCards = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: {
        limit: number
        offset: number
        card_brand?: string
      } = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      }

      if (selectedBrand) {
        params.card_brand = selectedBrand
      }

      const response: SearchResponse<CreditCard> = await fetchCreditCards(params)
      setCards(response.results)
      setTotalCards(response.total)
    } catch (err) {
      setError('Failed to load credit cards')
      console.error('Error loading credit cards:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCards / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand === selectedBrand ? '' : brand)
    setCurrentPage(1)
  }

  const cardBrands = ['Visa', 'Mastercard', 'American Express', 'Discover', 'JCB', 'Diners Club']

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <CreditCardIcon className="h-10 w-10 text-primary-500" />
              Credit Cards
            </h1>
            <p className="text-dark-400">
              Browse and analyze discovered credit card information
            </p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {showStats ? 'Show Cards' : 'Show Statistics'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {showStats ? (
          <CreditCardStats />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Filter by Brand</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBrandFilter('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedBrand === ''
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  All Brands
                </button>
                {cardBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandFilter(brand)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedBrand === brand
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            {!isLoading && (
              <div className="mb-6">
                <p className="text-sm text-dark-400">
                  Showing {cards.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                  {Math.min(currentPage * itemsPerPage, totalCards)} of {totalCards.toLocaleString()} credit cards
                  {selectedBrand && ` (filtered by ${selectedBrand})`}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {/* Credit Cards List */}
            <CreditCardList cards={cards} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalResults={totalCards}
                  resultsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CreditCardsPage
