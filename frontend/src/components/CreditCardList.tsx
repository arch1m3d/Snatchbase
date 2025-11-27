import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { CreditCard } from '../services/api'

interface CreditCardListProps {
  cards: CreditCard[]
  isLoading?: boolean
}

const getCardBrandIcon = (brand?: string) => {
  if (!brand) return '💳'
  
  const icons: { [key: string]: string } = {
    'Visa': '💳',
    'Mastercard': '💳',
    'American Express': '💳',
    'Discover': '💳',
    'JCB': '💳',
    'Diners Club': '💳',
    'Unknown': '💳'
  }
  
  return icons[brand] || '💳'
}

const getCardBrandColor = (brand?: string) => {
  if (!brand) return 'bg-dark-700 text-dark-300'

  const colors: { [key: string]: string } = {
    'Visa': 'bg-blue-500/20 text-blue-400',
    'Mastercard': 'bg-orange-500/20 text-orange-400',
    'American Express': 'bg-green-500/20 text-green-400',
    'Discover': 'bg-purple-500/20 text-purple-400',
    'JCB': 'bg-red-500/20 text-red-400',
    'Diners Club': 'bg-indigo-500/20 text-indigo-400',
    'Unknown': 'bg-dark-700 text-dark-300'
  }

  return colors[brand] || 'bg-dark-700 text-dark-300'
}

const CreditCardList: React.FC<CreditCardListProps> = ({ cards, isLoading }) => {
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set())

  const toggleReveal = (cardId: number) => {
    setRevealedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-dark-800/30 border border-dark-700 rounded-lg p-6">
            <div className="h-4 bg-dark-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-dark-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-800/30 border border-dark-700 rounded-lg">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Credit Cards Found</h3>
        <p className="text-dark-400">No credit card data is available in the system.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const isRevealed = revealedCards.has(card.id)
        return (
          <div
            key={card.id}
            className="bg-dark-800/30 border border-dark-700 rounded-lg hover:border-primary-500/50 transition-all p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getCardBrandIcon(card.card_brand)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-mono font-bold text-white">
                        {isRevealed ? (card.card_number || card.card_number_masked || '****-****-****-****') : (card.card_number_masked || '****-****-****-****')}
                      </h3>
                      <button
                        onClick={() => toggleReveal(card.id)}
                        className="p-1 hover:bg-dark-700 rounded transition-colors"
                        title={isRevealed ? 'Hide card number' : 'Show full card number'}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-4 w-4 text-dark-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-dark-400" />
                        )}
                      </button>
                    </div>
                    {card.card_brand && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getCardBrandColor(card.card_brand)}`}>
                        {card.card_brand}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {card.cardholder_name && (
                    <div>
                      <span className="text-dark-400 font-medium">Cardholder:</span>
                      <p className="text-white font-semibold">{card.cardholder_name}</p>
                    </div>
                  )}

                  {card.expiration && (
                    <div>
                      <span className="text-dark-400 font-medium">Expiration:</span>
                      <p className="text-white font-semibold font-mono">{card.expiration}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-dark-400 font-medium">Device ID:</span>
                    <p className="text-dark-300 font-mono text-xs">{card.device_id}</p>
                  </div>

                  {card.source_file && (
                    <div>
                      <span className="text-dark-400 font-medium">Source:</span>
                      <p className="text-dark-300 text-xs truncate" title={card.source_file}>
                        {card.source_file.split('/').pop() || card.source_file}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-dark-700">
                  <span className="text-xs text-dark-400">
                    Found: {new Date(card.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CreditCardList
