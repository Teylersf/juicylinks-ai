"use client"

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, Eye, EyeOff, Calendar, Building2, Zap, CheckCircle, XCircle, RefreshCw, MessageSquare, Bot } from 'lucide-react'
import { AIModelLogo } from './ai-model-logo'
import { LLM_MODELS } from '@/lib/constants/llm-models'

interface Business {
  id: string
  name: string
}

interface PromptLog {
  id: string
  businessId: string
  businessName: string
  llmProvider: string
  model: string
  promptType: string
  triggerType: string
  promptSent: string
  response: string | null
  wasSuccessful: boolean
  errorMessage: string | null
  cost: number
  createdAt: string
}

interface PromptLogsViewProps {
  businesses: Business[]
}

export function PromptLogsView({ businesses }: PromptLogsViewProps) {
  const [logs, setLogs] = useState<PromptLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const logsPerPage = 20

  // Get provider list from unified system
  const llmProviders = Object.keys(LLM_MODELS)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: logsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBusiness && { businessId: selectedBusiness }),
        ...(selectedProvider && { provider: selectedProvider }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateRange !== 'all' && { dateRange }),
      })

      const response = await fetch(`/api/prompt-logs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(Math.ceil(data.total / logsPerPage))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedBusiness, selectedProvider, selectedStatus, dateRange])

  useEffect(() => {
    fetchLogs()
  }, [currentPage, searchTerm, selectedBusiness, selectedProvider, selectedStatus, dateRange, fetchLogs])

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBusiness && { businessId: selectedBusiness }),
        ...(selectedProvider && { provider: selectedProvider }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateRange !== 'all' && { dateRange }),
      })

      const response = await fetch(`/api/prompt-logs?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to export logs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedBusiness('')
    setSelectedProvider('')
    setSelectedStatus('')
    setDateRange('all')
    setCurrentPage(1)
  }

  const getProviderColor = (provider: string) => {
    const colors = {
      GROK: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      OPENAI: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      PERPLEXITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      GEMINI: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      CLAUDE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    }
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  const getTriggerTypeColor = (triggerType: string) => {
    const colors = {
      automatic: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      manual: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      credit: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
    }
    return colors[triggerType as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  const getTriggerTypeLabel = (triggerType: string) => {
    const labels = {
      automatic: 'Subscription',
      manual: 'Manual',
      credit: 'Credits',
    }
    return labels[triggerType as keyof typeof labels] || triggerType
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Clear All
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Business Filter */}
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Businesses</option>
            {businesses.map(business => (
              <option key={business.id} value={business.id}>{business.name}</option>
            ))}
          </select>

          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Providers</option>
            {llmProviders.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prompt Logs
            </h2>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <AIModelLogo provider={log.llmProvider as 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'} size={32} />
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(log.llmProvider)}`}>
                              {log.llmProvider}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {log.model}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerTypeColor(log.triggerType)}`}>
                              {getTriggerTypeLabel(log.triggerType)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {log.promptType}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Building2 className="h-3 w-3 mr-1" />
                            {log.businessName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
                          log.wasSuccessful
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {log.wasSuccessful ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.wasSuccessful ? 'Success' : 'Failed'}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => toggleLogExpansion(log.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedLogs.has(log.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Always show prompt and response prominently */}
                    <div className="space-y-4 mt-4">
                      {/* Prompt Section */}
                      <div>
                        <div className="flex items-center mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                          <h4 className="font-medium text-gray-900 dark:text-white">Prompt Sent:</h4>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {expandedLogs.has(log.id) ? log.promptSent : (
                              <>
                                {log.promptSent.substring(0, 200)}
                                {log.promptSent.length > 200 && (
                                  <span className="text-blue-600 dark:text-blue-400 cursor-pointer ml-2" onClick={() => toggleLogExpansion(log.id)}>
                                    ... (click to see full prompt)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Response Section */}
                      {log.wasSuccessful && log.response ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <Bot className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                            <h4 className="font-medium text-gray-900 dark:text-white">AI Response:</h4>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {expandedLogs.has(log.id) ? log.response : (
                                <>
                                  {log.response.substring(0, 300)}
                                  {log.response.length > 300 && (
                                    <span className="text-green-600 dark:text-green-400 cursor-pointer ml-2" onClick={() => toggleLogExpansion(log.id)}>
                                      ... (click to see full response)
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : log.errorMessage ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                            <h4 className="font-medium text-red-600 dark:text-red-400">Error Message:</h4>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="text-sm text-red-700 dark:text-red-300">
                              {log.errorMessage}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center mb-2">
                            <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-600 dark:text-gray-400">No Response:</h4>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-gray-400">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              No response received from the AI model.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Created: {new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
