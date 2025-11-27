import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Credential {
  id: number
  url?: string
  domain?: string
  tld?: string
  username?: string
  password?: string
  browser?: string
  file_path?: string
  device_id?: string
  stealer_name?: string
  created_at: string
}

export interface System {
  id: number
  machine_id?: string
  computer_name?: string
  hardware_id?: string
  machine_user?: string
  ip_address?: string
  country?: string
  log_date?: string
  upload_id: string
  created_at: string
}

export interface Statistics {
  total_credentials: number
  total_systems: number
  total_uploads: number
  unique_domains: number
  unique_countries: number
  unique_stealers: number
}

export interface DomainStatistic {
  domain: string
  count: number
}

export interface CountryStatistic {
  country: string
  count: number
}

export interface StealerStatistic {
  stealer_name: string
  count: number
}

export interface UploadResponse {
  message: string
  filename: string
  task_id: string
  status: string
}

export interface Upload {
  id: number
  filename: string
  status: string
  devices_found: number
  devices_processed: number
  devices_skipped: number
  total_credentials: number
  total_files: number
  created_at: string
  completed_at?: string
  error_message?: string
}

// API Functions
export const fetchStatistics = async (): Promise<Statistics> => {
  const response = await api.get('/api/stats')
  return response.data
}

export const fetchDomainStats = async (limit = 20): Promise<DomainStatistic[]> => {
  const response = await api.get(`/api/stats/domains?limit=${limit}`)
  return response.data
}

export const fetchCountryStats = async (limit = 20): Promise<CountryStatistic[]> => {
  const response = await api.get(`/api/stats/countries?limit=${limit}`)
  return response.data
}

export const fetchStealerStats = async (limit = 20): Promise<StealerStatistic[]> => {
  const response = await api.get(`/api/stats/stealers?limit=${limit}`)
  return response.data
}

export const fetchRecentUploads = async (limit = 10): Promise<Upload[]> => {
  const response = await api.get(`/api/stats/recent-uploads?limit=${limit}`)
  return response.data
}

export interface SearchResponse<T> {
  results: T[]
  total: number
  limit: number
  offset: number
}

export const searchCredentials = async (params: {
  q?: string
  domain?: string
  username?: string
  browser?: string
  tld?: string
  limit?: number
  offset?: number
}): Promise<SearchResponse<Credential>> => {
  const response = await api.get('/api/search/credentials', { params })
  return response.data
}

export const exportCredentials = async (params: {
  q?: string
  domain?: string
  username?: string
  browser?: string
  tld?: string
  stealer_name?: string
  limit?: number
}): Promise<Blob> => {
  const response = await api.get('/api/search/export', {
    params,
    responseType: 'blob'
  })
  return response.data
}

export const searchSystems = async (params: {
  q?: string
  country?: string
  ip_address?: string
  computer_name?: string
  limit?: number
  offset?: number
}): Promise<SearchResponse<System>> => {
  const response = await api.get('/api/search/systems', { params })
  return response.data
}

// New Device endpoints
export interface Device {
  id: number
  device_id: string
  device_name: string
  hostname?: string
  upload_batch: string
  total_files: number
  total_credentials: number
  total_domains: number
  total_urls: number
  total_wallets: number
  total_cookies: number
  total_screenshots: number
  total_software: number
  total_history: number
  created_at: string
}

export interface CreditCard {
  id: number
  device_id: number
  card_number: string
  card_number_masked: string
  expiration?: string
  cardholder_name?: string
  card_brand?: string
  source_file?: string
  created_at: string
}

export interface CreditCardStats {
  total_credit_cards: number
  devices_with_cards: number
  by_brand: Array<{ brand: string; count: number }>
}

export interface CardBrandStat {
  brand: string
  count: number
}

export const fetchDevices = async (params: {
  q?: string
  limit?: number
  offset?: number
}): Promise<SearchResponse<Device>> => {
  const response = await api.get('/api/devices', { params })
  return response.data
}

export const fetchDevice = async (deviceId: number): Promise<Device> => {
  const response = await api.get(`/api/devices/${deviceId}`)
  return response.data
}

export const fetchDeviceCredentials = async (
  deviceId: number,
  params: { limit?: number; offset?: number }
): Promise<SearchResponse<Credential>> => {
  const response = await api.get(`/api/devices/${deviceId}/credentials`, { params })
  return response.data
}

export interface FileItem {
  id: number
  file_path: string
  file_name: string
  parent_path?: string
  is_directory: boolean
  file_size: number
  has_content: boolean
}

export const fetchDeviceFiles = async (
  deviceId: number,
  params: { limit?: number; offset?: number }
): Promise<SearchResponse<FileItem>> => {
  const response = await api.get(`/api/devices/${deviceId}/files`, { params })
  return response.data
}

export const fetchFileContent = async (fileId: number): Promise<{ content: string }> => {
  const response = await api.get(`/api/files/${fileId}`)
  return response.data
}

// New statistics endpoints
export const fetchBrowserStats = async (limit = 20) => {
  const response = await api.get(`/api/stats/browsers?limit=${limit}`)
  return response.data
}
export const fetchTldStats = async (limit = 20) => {
  const response = await api.get(`/api/stats/tlds?limit=${limit}`)
  return response.data
}

export const fetchPasswordStats = async (limit: number = 20) => {
  const response = await api.get(`/api/stats/passwords?limit=${limit}`)
  return response.data
}

export const fetchSoftwareStats = async (limit = 20) => {
  const response = await api.get(`/api/stats/software?limit=${limit}`)
  return response.data
}

// Credit Card API Functions
export const fetchCreditCards = async (params: {
  device_id?: number
  card_brand?: string
  limit?: number
  offset?: number
}): Promise<SearchResponse<CreditCard>> => {
  const response = await api.get('/api/credit-cards', { params })
  return response.data
}

export const fetchCreditCard = async (cardId: number): Promise<CreditCard> => {
  const response = await api.get(`/api/credit-cards/${cardId}`)
  return response.data
}

export const fetchDeviceCreditCards = async (
  deviceId: number,
  params: { limit?: number; offset?: number }
): Promise<SearchResponse<CreditCard>> => {
  const response = await api.get(`/api/devices/${deviceId}/credit-cards`, { params })
  return response.data
}

export const fetchCreditCardStats = async (): Promise<CreditCardStats> => {
  const response = await api.get('/api/stats/credit-cards')
  return response.data
}

export const fetchCardBrandStats = async (): Promise<CardBrandStat[]> => {
  const response = await api.get('/api/stats/credit-card-brands')
  return response.data
}

// Wallet API Functions
export interface Wallet {
  id: number
  device_id: number
  wallet_type: string
  address?: string
  mnemonic_hash?: string
  private_key_hash?: string
  password?: string
  path?: string
  source_file?: string
  balance: number
  balance_usd?: number
  last_checked?: string
  has_balance: boolean
  token_balances?: string
  created_at: string
}

export interface WalletStats {
  total_wallets: number
  wallets_with_balance: number
  total_value_usd: number
  breakdown_by_type: Record<string, { count: number; total_usd: number }>
  top_wallets: Array<{
    id: number
    wallet_type: string
    address: string
    balance: number
    balance_usd: number
  }>
}

export const fetchWallets = async (params: {
  wallet_type?: string
  has_balance?: boolean
  min_balance?: number
  skip?: number
  limit?: number
}): Promise<Wallet[]> => {
  const response = await api.get('/api/wallets', { params })
  return response.data
}

export const fetchWallet = async (walletId: number): Promise<Wallet> => {
  const response = await api.get(`/api/wallets/${walletId}`)
  return response.data
}

export const fetchWalletStats = async (): Promise<WalletStats> => {
  const response = await api.get('/api/stats/wallets')
  return response.data
}

export const fetchDeviceWallets = async (
  deviceId: number,
  params?: { wallet_type?: string; has_balance?: boolean }
): Promise<Wallet[]> => {
  const response = await api.get(`/api/devices/${deviceId}/wallets`, { params })
  return response.data
}

export const triggerBalanceCheck = async (params?: {
  wallet_ids?: number[]
  device_id?: number
}): Promise<{ message: string; updated: number; total_requested: number }> => {
  const response = await api.post('/api/wallets/check-balance', params)
  return response.data
}

// Software API Functions
export interface Software {
  id: number
  software_name: string
  version?: string
  source_file: string
}

export const fetchDeviceSoftware = async (
  deviceId: number,
  params?: { limit?: number; offset?: number }
): Promise<SearchResponse<Software>> => {
  const response = await api.get(`/api/devices/${deviceId}/software`, { params })
  return response.data
}

// Cookie API Functions
export interface CookieFile {
  id: number
  file_name: string
  file_path: string
  file_size: number
  cookie_count: number
  service: string
}

export const fetchDeviceCookies = async (
  deviceId: number,
  limit: number = 100
): Promise<CookieFile[]> => {
  const response = await api.get(`/api/devices/${deviceId}/cookies`, {
    params: { limit }
  })
  return response.data
}

// Browser History API Functions
export interface BrowserHistoryEntry {
  id: number
  url: string
  title?: string
  visit_count: number
  last_visit_time?: string
  browser: string
  source_file?: string
  created_at: string
}

export const fetchDeviceHistory = async (
  deviceId: number,
  params?: { limit?: number; offset?: number; browser?: string }
): Promise<SearchResponse<BrowserHistoryEntry>> => {
  const response = await api.get(`/api/devices/${deviceId}/history`, { params })
  return response.data
}

export default api
