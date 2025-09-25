import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchCountryStats } from '@/services/api'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{label}</p>
        <p className="text-primary-400">
          Systems: <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function CountryMap() {
  const { data: countryStats, isLoading } = useQuery(
    'country-stats',
    () => fetchCountryStats(15),
    { refetchInterval: 60000 }
  )

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="loading-dots flex space-x-2">
          <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
          <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
          <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
        </div>
      </div>
    )
  }

  if (!countryStats || countryStats.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        <p>No geographic data available</p>
      </div>
    )
  }

  // Transform data for the chart
  const chartData = countryStats.map(stat => ({
    country: stat.country || 'Unknown',
    count: stat.count,
    // Add country code mapping for better display
    displayName: getCountryDisplayName(stat.country)
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="displayName"
            stroke="#64748b"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="url(#colorGradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 grid grid-cols-3 gap-4 text-center"
      >
        <div className="p-3 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400">Total Countries</p>
          <p className="text-lg font-semibold text-white">{countryStats.length}</p>
        </div>
        <div className="p-3 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400">Top Country</p>
          <p className="text-lg font-semibold text-primary-400">
            {getCountryDisplayName(countryStats[0]?.country)}
          </p>
        </div>
        <div className="p-3 bg-dark-800/30 rounded-lg">
          <p className="text-xs text-dark-400">Total Systems</p>
          <p className="text-lg font-semibold text-white">
            {countryStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper function to get country display names
function getCountryDisplayName(countryCode?: string): string {
  if (!countryCode) return 'Unknown'
  
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'RU': 'Russia',
    'CN': 'China',
    'DE': 'Germany',
    'GB': 'United Kingdom',
    'FR': 'France',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'PL': 'Poland',
    'TR': 'Turkey',
    'MX': 'Mexico',
    'UA': 'Ukraine',
    'VN': 'Vietnam'
  }
  
  return countryNames[countryCode.toUpperCase()] || countryCode.toUpperCase()
}
